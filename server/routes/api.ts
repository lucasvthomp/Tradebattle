import { Router } from 'express';
import { 
  getStockQuote, 
  searchStocks, 
  getHistoricalData, 
  getCompanyProfile,
  getPopularStocks,
  getStockPerformance,
  getAllSectors,
  TimeFrame
} from '../services/yahooFinance.js';
import { 
  asyncHandler, 
  validateSymbol, 
  sanitizeInput, 
  ValidationError, 
  NotFoundError 
} from '../utils/errorHandler.js';
import { storage } from '../storage.js';
import { db } from '../db.js';
import { tournaments, tournamentParticipants, tradeHistory } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '../auth.js';

const router = Router();

/**
 * Helper function to calculate portfolio growth and award achievements
 */
async function checkPersonalPortfolioGrowthAchievements(userId: number) {
  try {
    const user = await storage.getUser(userId);
    if (!user) return;

    const purchases = await storage.getPersonalStockPurchases(userId);
    const currentBalance = parseFloat(user.personalBalance) || 10000;
    const initialDeposit = parseFloat(user.totalDeposited) || 10000;
    
    // Calculate current portfolio value
    let currentPortfolioValue = currentBalance;
    
    for (const purchase of purchases) {
      // Get current price for each stock
      try {
        const quote = await getStockQuote(purchase.symbol);
        const currentValue = purchase.shares * quote.price;
        currentPortfolioValue += currentValue;
      } catch (error) {
        // If unable to get current price, use purchase price as fallback
        const purchaseValue = purchase.shares * purchase.purchasePrice;
        currentPortfolioValue += purchaseValue;
      }
    }
    
    // Calculate growth percentage
    const growthPercentage = ((currentPortfolioValue - initialDeposit) / initialDeposit) * 100;
    
    console.log(`Portfolio growth check for user ${userId}: ${growthPercentage.toFixed(2)}% (${currentPortfolioValue} vs ${initialDeposit})`);
    
    // Award 5% Portfolio Growth achievement
    if (growthPercentage >= 5) {
      await storage.awardAchievement({
        userId,
        achievementType: '5_percent_growth',
        achievementTier: 'uncommon',
        achievementName: '5% Portfolio Growth',
        achievementDescription: 'Made over 5% on any portfolio'
      });
    }
    
    // Award 10% Portfolio Growth achievement
    if (growthPercentage >= 10) {
      await storage.awardAchievement({
        userId,
        achievementType: '10_percent_growth',
        achievementTier: 'rare',
        achievementName: '10% Portfolio Growth',
        achievementDescription: 'Made over 10% on any portfolio'
      });
    }
    
    // Award 25% Portfolio Growth achievement
    if (growthPercentage >= 25) {
      await storage.awardAchievement({
        userId,
        achievementType: '25_percent_growth',
        achievementTier: 'legendary',
        achievementName: '25% Portfolio Growth',
        achievementDescription: 'Made over 25% on any portfolio'
      });
    }
    
    // Award 100% Portfolio Growth achievement
    if (growthPercentage >= 100) {
      await storage.awardAchievement({
        userId,
        achievementType: '100_percent_growth',
        achievementTier: 'mythic',
        achievementName: '100% Portfolio Growth',
        achievementDescription: 'Made over 100% on any portfolio'
      });
    }
  } catch (error) {
    console.log('Error checking portfolio growth achievements:', error);
  }
}

/**
 * GET /api/quote/:symbol
 * Fetch current stock quote data
 */
router.get('/quote/:symbol', asyncHandler(async (req: any, res: any) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  try {
    const quote = await getStockQuote(symbol);
    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    throw new NotFoundError(`Stock quote not found for symbol: ${symbol}`);
  }
}));

/**
 * GET /api/search/:query
 * Search for stock symbols by company name
 */
router.get('/search/:query', asyncHandler(async (req: any, res: any) => {
  const query = sanitizeInput(req.params.query);
  
  if (!query || query.length < 2) {
    throw new ValidationError('Query must be at least 2 characters long');
  }

  const results = await searchStocks(query);
  
  res.json({
    success: true,
    data: results,
  });
}));

/**
 * GET /api/historical/:symbol
 * Get historical price data
 */
router.get('/historical/:symbol', asyncHandler(async (req: any, res: any) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.query.timeframe as string || '1M') as TimeFrame;
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  // Validate timeframe
  const validTimeframes: TimeFrame[] = ['1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];
  if (!validTimeframes.includes(timeFrame)) {
    throw new ValidationError('Invalid timeframe. Valid timeframes: ' + validTimeframes.join(', '));
  }

  try {
    const historicalData = await getHistoricalData(symbol, timeFrame);
    res.json({
      success: true,
      data: historicalData,
      timeFrame,
    });
  } catch (error) {
    throw new NotFoundError(`Historical data not found for symbol: ${symbol}`);
  }
}));

/**
 * GET /api/performance/:symbol/:timeframe
 * Get stock performance for specific timeframe
 */
router.get('/performance/:symbol/:timeframe', asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.params.timeframe.toUpperCase()) as TimeFrame;
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  // Validate timeframe
  const validTimeframes: TimeFrame[] = ['1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];
  if (!validTimeframes.includes(timeFrame)) {
    throw new ValidationError('Invalid timeframe. Valid timeframes: ' + validTimeframes.join(', '));
  }

  try {
    const performance = await getStockPerformance(symbol, timeFrame);
    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    throw new NotFoundError(`Performance data not found for symbol: ${symbol}`);
  }
}));

/**
 * GET /api/summary/:symbol
 * Get detailed company information
 */
router.get('/summary/:symbol', asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  try {
    const profile = await getCompanyProfile(symbol);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    throw new NotFoundError(`Company profile not found for symbol: ${symbol}`);
  }
}));

/**
 * GET /api/popular
 * Get popular/trending stocks
 */
router.get('/popular', asyncHandler(async (req, res) => {
  const popularStocks = await getPopularStocks();
  
  res.json({
    success: true,
    data: popularStocks,
  });
}));

/**
 * GET /api/sectors
 * Get all available sectors
 */
router.get('/sectors', asyncHandler(async (req, res) => {
  const sectors = getAllSectors();
  
  res.json({
    success: true,
    data: sectors,
  });
}));

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Yahoo Finance API is healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/tournaments
 * Create a new tournament
 */
router.post('/tournaments', requireAuth, asyncHandler(async (req, res) => {
  const { name, maxPlayers, startingBalance, timeframe, buyInAmount, tradingRestriction, isPublic } = req.body;
  const userId = req.user.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);

  if (!name || !startingBalance) {
    throw new ValidationError('Tournament name and starting balance are required');
  }

  const tournament = await storage.createTournament({
    name: sanitizeInput(name),
    maxPlayers: maxPlayers || 10,
    startingBalance: parseFloat(startingBalance),
    timeframe: timeframe || '4 weeks',
    buyInAmount: parseFloat(buyInAmount) || 0,
    tradingRestriction: tradingRestriction || 'none',
    isPublic: isPublic !== undefined ? isPublic : true
  }, userId);

  // Award Tournament Creator achievement (rare)
  await storage.awardAchievement({
    userId: userId,
    achievementType: 'tournament_creator',
    achievementTier: 'rare',
    achievementName: 'Tournament Creator',
    achievementDescription: 'Created a tournament',
    earnedAt: new Date(),
    createdAt: new Date()
  });

  // Award Tournament Participant achievement
  await storage.awardAchievement({
    userId: userId,
    achievementType: 'tournament_participant',
    achievementTier: 'common',
    achievementName: 'Tournament Participant',
    achievementDescription: 'Joined a tournament',
    earnedAt: new Date(),
    createdAt: new Date()
  });

  res.json({
    success: true,
    data: tournament,
  });
}));

/**
 * POST /api/tournaments/:code/join
 * Join a tournament by code
 */
router.post('/tournaments/:code/join', requireAuth, asyncHandler(async (req, res) => {
  const code = sanitizeInput(req.params.code.toUpperCase());
  const userId = req.user.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const tournament = await storage.getTournamentByCode(code);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  if (tournament.currentPlayers >= tournament.maxPlayers) {
    throw new ValidationError('Tournament is full');
  }

  try {
    const participant = await storage.joinTournament(tournament.id, userId);

    // Award Tournament Participant achievement
    await storage.awardAchievement({
      userId: userId,
      achievementType: 'tournament_participant',
      achievementTier: 'common',
      achievementName: 'Tournament Participant',
      achievementDescription: 'Joined a tournament',
      earnedAt: new Date(),
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: participant,
    });
  } catch (error: any) {
    if (error.message === 'User is already participating in this tournament') {
      throw new ValidationError('You are already participating in this tournament');
    }
    throw error;
  }
}));

/**
 * GET /api/tournaments
 * Get user's tournaments
 */
router.get('/tournaments', requireAuth, asyncHandler(async (req: any, res: any) => {
  const userId = req.user.id;

  const tournaments = await storage.getUserTournaments(userId);

  res.json({
    success: true,
    data: tournaments,
  });
}));

/**
 * GET /api/tournaments/public
 * Get public tournaments for browsing
 */
router.get('/tournaments/public', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const publicTournaments = await storage.getPublicTournaments();

  res.json({
    success: true,
    data: publicTournaments,
  });
}));

/**
 * GET /api/tournaments/:id/participants
 * Get tournament participants with user names and portfolio values
 */
router.get('/tournaments/:id/participants', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  const participants = await storage.getTournamentParticipants(tournamentId);

  // Calculate portfolio values with current stock prices
  const participantsWithValues = await Promise.all(
    participants.map(async (participant) => {
      let stockValue = 0;
      const stockSymbols = [...new Set(participant.stockPurchases.map((p: any) => p.symbol))];
      
      // Get current prices for all symbols
      const stockPrices: { [symbol: string]: number } = {};
      for (const symbol of stockSymbols) {
        try {
          const { getStockQuote } = await import('../services/yahooFinance');
          const quote = await getStockQuote(symbol);
          stockPrices[symbol] = quote.price;
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          stockPrices[symbol] = 0;
        }
      }

      // Calculate total stock value
      const stockHoldings: { [symbol: string]: { quantity: number; averagePrice: number } } = {};
      
      participant.stockPurchases.forEach((purchase: any) => {
        const symbol = purchase.symbol;
        const quantity = parseInt(purchase.shares);
        const price = parseFloat(purchase.purchasePrice);
        
        if (!stockHoldings[symbol]) {
          stockHoldings[symbol] = { quantity: 0, averagePrice: 0 };
        }
        
        const currentHolding = stockHoldings[symbol];
        const totalQuantity = currentHolding.quantity + quantity;
        const totalCost = (currentHolding.quantity * currentHolding.averagePrice) + (quantity * price);
        
        stockHoldings[symbol] = {
          quantity: totalQuantity,
          averagePrice: totalCost / totalQuantity
        };
      });

      // Calculate current value of all holdings
      Object.entries(stockHoldings).forEach(([symbol, holding]) => {
        const currentPrice = stockPrices[symbol] || 0;
        stockValue += holding.quantity * currentPrice;
      });

      const balance = parseFloat(participant.balance);
      const totalValue = balance + stockValue;

      return {
        ...participant,
        stockValue,
        totalValue,
        stockHoldings: Object.entries(stockHoldings).map(([symbol, holding]) => ({
          symbol,
          quantity: holding.quantity,
          averagePrice: holding.averagePrice,
          currentPrice: stockPrices[symbol] || 0,
          currentValue: holding.quantity * (stockPrices[symbol] || 0)
        }))
      };
    })
  );

  // Sort by total value (highest first)
  participantsWithValues.sort((a, b) => b.totalValue - a.totalValue);

  res.json({
    success: true,
    data: participantsWithValues,
  });
}));

/**
 * GET /api/tournaments/:id/balance
 * Get tournament balance for user
 */
router.get('/tournaments/:id/balance', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  const balance = await storage.getTournamentBalance(tournamentId, userId);

  res.json({
    success: true,
    data: { balance },
  });
}));

/**
 * GET /api/tournaments/:id/purchases
 * Get tournament purchases for user
 */
router.get('/tournaments/:id/purchases', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  const purchases = await storage.getTournamentStockPurchases(tournamentId, userId);

  res.json({
    success: true,
    data: purchases,
  });
}));

/**
 * POST /api/tournaments/:id/purchase
 * Purchase stock in a tournament
 */
router.post('/tournaments/:id/purchase', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  const { symbol, companyName, shares, purchasePrice } = req.body;
  
  if (!symbol || !companyName || !shares || !purchasePrice) {
    throw new ValidationError('All purchase fields are required');
  }

  const totalCost = shares * purchasePrice;

  // Check if tournament is completed (no trading allowed)
  const tournaments = await storage.getAllTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (tournament && tournament.status === 'completed') {
    throw new ValidationError('Cannot trade in completed tournaments');
  }

  // Check if user has enough balance
  const currentBalance = await storage.getTournamentBalance(tournamentId, userId);
  if (currentBalance < totalCost) {
    throw new ValidationError('Insufficient balance for this purchase');
  }

  // Create purchase record
  const purchase = await storage.purchaseTournamentStock(tournamentId, userId, {
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(companyName),
    shares: parseInt(shares),
    purchasePrice: parseFloat(purchasePrice).toString(),
    totalCost: totalCost.toString()
  });

  // Record the trade in trade history
  await storage.recordTrade({
    userId: userId,
    tournamentId: tournamentId,
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(companyName),
    tradeType: 'buy',
    shares: parseInt(shares),
    price: parseFloat(purchasePrice).toString(),
    totalValue: totalCost.toString()
  });

  // Update user balance
  await storage.updateTournamentBalance(tournamentId, userId, currentBalance - totalCost);

  // Award First Trade achievement
  await storage.awardAchievement({
    userId: userId,
    achievementType: 'first_trade',
    achievementTier: 'common',
    achievementName: 'First Trade',
    achievementDescription: 'Made your first trade'
  });

  res.status(201).json({
    success: true,
    data: { purchase },
  });
}));

/**
 * POST /api/tournaments/:id/sell
 * Sell stock in a tournament
 */
router.post('/tournaments/:id/sell', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  const { purchaseId, sharesToSell, currentPrice } = req.body;
  
  if (!purchaseId || !sharesToSell || !currentPrice) {
    throw new ValidationError('Purchase ID, shares to sell, and current price are required');
  }

  // Get the original purchase
  const purchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  const purchase = purchases.find(p => p.id === parseInt(purchaseId));
  
  if (!purchase) {
    throw new ValidationError('Purchase not found');
  }

  const sharesToSellNum = parseInt(sharesToSell);
  if (sharesToSellNum <= 0 || sharesToSellNum > purchase.shares) {
    throw new ValidationError('Invalid number of shares to sell');
  }

  const saleValue = sharesToSellNum * parseFloat(currentPrice);
  
  // Check if tournament is completed (no trading allowed)
  const tournaments = await storage.getAllTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (tournament && tournament.status === 'completed') {
    throw new ValidationError('Cannot trade in completed tournaments');
  }
  
  // Record the sell trade in trade history
  await storage.recordTrade({
    userId: userId,
    tournamentId: tournamentId,
    symbol: purchase.symbol,
    companyName: purchase.companyName,
    tradeType: 'sell',
    shares: sharesToSellNum,
    price: parseFloat(currentPrice),
    totalValue: saleValue
  });
  
  // Get current balance
  const currentBalance = await storage.getTournamentBalance(tournamentId, userId);
  
  // Update balance with sale proceeds
  await storage.updateTournamentBalance(tournamentId, userId, currentBalance + saleValue);

  // If selling all shares, delete the purchase record
  if (sharesToSellNum === purchase.shares) {
    await storage.deleteTournamentPurchase(tournamentId, userId, purchase.id);
  } else {
    // Update the purchase record to reduce shares
    // Note: This would need to be implemented in storage
    // For now, we'll delete and recreate with remaining shares
    await storage.deleteTournamentPurchase(tournamentId, userId, purchase.id);
    
    if (purchase.shares - sharesToSellNum > 0) {
      await storage.purchaseTournamentStock(tournamentId, userId, {
        symbol: purchase.symbol,
        companyName: purchase.companyName,
        shares: purchase.shares - sharesToSellNum,
        purchasePrice: purchase.purchasePrice,
        totalCost: (purchase.shares - sharesToSellNum) * purchase.purchasePrice
      });
    }
  }

  res.json({
    success: true,
    data: { 
      saleValue,
      newBalance: currentBalance + saleValue 
    },
  });
}));





/**
 * GET /api/tournaments/:id/balance
 * Get user's balance in a specific tournament
 */
router.get('/tournaments/:id/balance', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const balance = await storage.getTournamentBalance(tournamentId, userId);

  res.json({
    success: true,
    data: { balance },
  });
}));

/**
 * GET /api/tournaments/:id/purchases
 * Get user's stock purchases in a specific tournament
 */
router.get('/tournaments/:id/purchases', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const purchases = await storage.getTournamentStockPurchases(tournamentId, userId);

  res.json({
    success: true,
    data: purchases,
  });
}));

/**
 * Helper function to calculate trading streak
 */
async function calculateTradingStreak(userId: number): Promise<number> {
  try {
    // Get all trades for the user ordered by date (most recent first)
    const trades = await db.query.tradeHistory.findMany({
      where: (tradeHistory, { eq }) => eq(tradeHistory.userId, userId),
      orderBy: (tradeHistory, { desc }) => [desc(tradeHistory.createdAt)]
    });

    if (trades.length === 0) {
      return 0;
    }

    // Group trades by date
    const tradesByDate = new Map<string, any[]>();
    trades.forEach(trade => {
      const dateStr = trade.createdAt.toISOString().split('T')[0];
      if (!tradesByDate.has(dateStr)) {
        tradesByDate.set(dateStr, []);
      }
      tradesByDate.get(dateStr)!.push(trade);
    });

    // Get all unique trading dates and sort them
    const tradingDates = Array.from(tradesByDate.keys()).sort().reverse(); // Most recent first
    
    if (tradingDates.length === 0) {
      return 0;
    }

    // Calculate streak: count consecutive days starting from the most recent trading day
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Start checking from today going backwards
    const startDate = new Date();
    let currentStreakCount = 0;
    
    for (let i = 0; i < 365; i++) { // Check up to 365 days
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (tradesByDate.has(dateStr)) {
        currentStreakCount++;
      } else {
        // If we've started counting and hit a gap, stop
        if (currentStreakCount > 0) {
          break;
        }
        // If we haven't started counting yet, continue looking backward
      }
    }

    console.log(`Trading streak calculation for user ${userId}:`, {
      totalTrades: trades.length,
      uniqueTradingDays: tradingDates.length,
      mostRecentTradingDay: tradingDates[0],
      calculatedStreak: currentStreakCount,
      today
    });

    return currentStreakCount;
  } catch (error) {
    console.error('Error calculating trading streak:', error);
    return 0;
  }
}

/**
 * Helper function to award streak achievements
 */
async function awardStreakAchievements(userId: number, streak: number) {
  try {
    // 5 day streak - Uncommon
    if (streak >= 5) {
      await storage.awardAchievement({
        userId,
        achievementType: '5_day_streak',
        achievementTier: 'uncommon',
        achievementName: '5 Day Streak',
        achievementDescription: 'Traded for 5 consecutive days'
      });
    }

    // 15 day streak - Rare
    if (streak >= 15) {
      await storage.awardAchievement({
        userId,
        achievementType: '15_day_streak',
        achievementTier: 'rare',
        achievementName: '15 Day Streak',
        achievementDescription: 'Traded for 15 consecutive days'
      });
    }

    // 50 day streak - Epic
    if (streak >= 50) {
      await storage.awardAchievement({
        userId,
        achievementType: '50_day_streak',
        achievementTier: 'epic',
        achievementName: '50 Day Streak',
        achievementDescription: 'Traded for 50 consecutive days'
      });
    }

    // 100 day streak - Legendary
    if (streak >= 100) {
      await storage.awardAchievement({
        userId,
        achievementType: '100_day_streak',
        achievementTier: 'legendary',
        achievementName: '100 Day Streak',
        achievementDescription: 'Traded for 100 consecutive days'
      });
    }

    // 365 day streak - Mythic
    if (streak >= 365) {
      await storage.awardAchievement({
        userId,
        achievementType: '365_day_streak',
        achievementTier: 'mythic',
        achievementName: '365 Day Streak',
        achievementDescription: 'Traded every day for a full year'
      });
    }
  } catch (error) {
    console.error('Error awarding streak achievements:', error);
  }
}

/**
 * GET /api/personal-portfolio
 * Get personal portfolio data
 */
router.get('/personal-portfolio', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await storage.getUser(userId);

  // Calculate trading streak
  const tradingStreak = await calculateTradingStreak(userId);

  // Award streak achievements based on current streak
  await awardStreakAchievements(userId, tradingStreak);

  res.json({
    success: true,
    data: {
      balance: user.personalBalance || 10000,
      portfolioCreatedAt: user.portfolioCreatedAt,
      tradingStreak: tradingStreak
    },
  });
}));

/**
 * GET /api/personal-purchases
 * Get personal stock purchases
 */
router.get('/personal-purchases', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await storage.getUser(userId);

  const purchases = await storage.getPersonalStockPurchases(userId);

  res.json({
    success: true,
    data: purchases,
  });
}));

/**
 * POST /api/personal-portfolio/purchase
 * Purchase stock in personal portfolio
 */
router.post('/personal-portfolio/purchase', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await storage.getUser(userId);

  const { symbol, companyName, shares, purchasePrice } = req.body;
  
  if (!symbol || !companyName || !shares || !purchasePrice) {
    throw new ValidationError('All purchase fields are required');
  }

  const totalCost = shares * purchasePrice;
  const currentBalance = user.personalBalance || 10000;

  // Check if user has enough balance
  if (currentBalance < totalCost) {
    throw new ValidationError('Insufficient balance for this purchase');
  }

  // Create purchase record
  const purchase = await storage.purchasePersonalStock(userId, {
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(companyName),
    shares: parseInt(shares),
    purchasePrice: parseFloat(purchasePrice),
    totalCost: totalCost
  });

  // Record the trade in trade history
  await storage.recordTrade({
    userId: userId,
    tournamentId: null, // null for personal trades
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(companyName),
    tradeType: 'buy',
    shares: parseInt(shares),
    price: parseFloat(purchasePrice),
    totalValue: totalCost
  });

  // Update user balance
  await storage.updateUser(userId, {
    personalBalance: currentBalance - totalCost
  });

  // Award First Trade achievement
  await storage.awardAchievement({
    userId: userId,
    achievementType: 'first_trade',
    achievementTier: 'common',
    achievementName: 'First Trade',
    achievementDescription: 'Made your first trade',
    earnedAt: new Date(),
    createdAt: new Date()
  });

  // Check for portfolio growth achievements
  await checkPersonalPortfolioGrowthAchievements(userId);

  // Check for streak achievements after purchase
  const tradingStreak = await calculateTradingStreak(userId);
  await awardStreakAchievements(userId, tradingStreak);

  res.status(201).json({
    success: true,
    data: { purchase },
  });
}));

/**
 * POST /api/personal-portfolio/sell
 * Sell stock in personal portfolio
 */
router.post('/personal-portfolio/sell', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await storage.getUser(userId);

  const { purchaseId, sharesToSell, currentPrice } = req.body;
  
  if (!purchaseId || !sharesToSell || !currentPrice) {
    throw new ValidationError('Purchase ID, shares to sell, and current price are required');
  }

  // Get the original purchase
  const purchases = await storage.getPersonalStockPurchases(userId);
  const purchase = purchases.find(p => p.id === parseInt(purchaseId));
  
  if (!purchase) {
    throw new ValidationError('Purchase not found');
  }

  const sharesToSellNum = parseInt(sharesToSell);
  if (sharesToSellNum <= 0 || sharesToSellNum > purchase.shares) {
    throw new ValidationError('Invalid number of shares to sell');
  }

  const saleValue = sharesToSellNum * parseFloat(currentPrice);
  const currentBalance = parseFloat(user.personalBalance) || 10000;
  
  // Record the sell trade in trade history
  await storage.recordTrade({
    userId: userId,
    tournamentId: null, // null for personal trades
    symbol: purchase.symbol,
    companyName: purchase.companyName,
    tradeType: 'sell',
    shares: sharesToSellNum,
    price: parseFloat(currentPrice),
    totalValue: saleValue
  });
  
  // Update balance with sale proceeds
  await storage.updateUser(userId, {
    personalBalance: currentBalance + saleValue
  });

  // If selling all shares, delete the purchase record
  if (sharesToSellNum === purchase.shares) {
    await storage.deletePersonalPurchase(userId, purchase.id);
  } else {
    // Update the purchase record to reduce shares
    await storage.deletePersonalPurchase(userId, purchase.id);
    
    if (purchase.shares - sharesToSellNum > 0) {
      const purchasePrice = parseFloat(purchase.purchasePrice);
      await storage.purchasePersonalStock(userId, {
        symbol: purchase.symbol,
        companyName: purchase.companyName,
        shares: purchase.shares - sharesToSellNum,
        purchasePrice: purchasePrice,
        totalCost: (purchase.shares - sharesToSellNum) * purchasePrice
      });
    }
  }

  // Check for portfolio growth achievements after selling
  await checkPersonalPortfolioGrowthAchievements(userId);

  // Check for streak achievements after selling
  const tradingStreak = await calculateTradingStreak(userId);
  await awardStreakAchievements(userId, tradingStreak);

  res.json({
    success: true,
    data: { 
      saleValue,
      newBalance: currentBalance + saleValue 
    },
  });
}));

/**
 * GET /api/tournaments/leaderboard
 * Get tournaments leaderboard data
 */
router.get('/tournaments/leaderboard', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get all tournaments with participants and their portfolio values
  const tournaments = await storage.getAllTournaments();
  const allParticipants = [];
  let activeTournaments = 0;
  
  for (const tournament of tournaments) {
    // Skip expired/completed tournaments
    if (tournament.status === 'completed') {
      continue;
    }
    
    const participants = await storage.getTournamentParticipants(tournament.id);
    
    // Count as active if it has participants
    if (participants.length > 0) {
      activeTournaments++;
    }
    
    for (const participant of participants) {
      // Calculate portfolio value for each participant
      const purchases = await storage.getTournamentStockPurchases(tournament.id, participant.userId);
      let portfolioValue = parseFloat(participant.balance);
      
      // Add current value of all stock holdings
      for (const purchase of purchases) {
        try {
          const currentQuote = await getStockQuote(purchase.symbol);
          const currentValue = purchase.shares * currentQuote.price;
          portfolioValue += currentValue;
        } catch (error) {
          // If stock quote fails, use purchase price as fallback
          portfolioValue += purchase.shares * parseFloat(purchase.purchasePrice);
        }
      }
      
      // Calculate percentage change from tournament's actual starting balance
      const startingBalance = parseFloat(tournament.startingBalance);
      const percentageChange = ((portfolioValue - startingBalance) / startingBalance) * 100;
      
      allParticipants.push({
        ...participant,
        portfolioValue,
        percentageChange,
        tournamentName: tournament.name,
        tournamentId: tournament.id,
        startingBalance
      });
    }
  }
  
  // Sort by percentage change (highest first)
  allParticipants.sort((a, b) => b.percentageChange - a.percentageChange);
  
  // Award special achievement to #1 ranked user
  if (allParticipants.length > 0) {
    const topUser = allParticipants[0];
    try {
      await storage.awardAchievement({
        userId: topUser.userId,
        achievementType: 'tournament_overlord',
        achievementTier: 'special',
        achievementName: 'Tournament Overlord',
        achievementDescription: 'Ranked #1 on tournament leaderboard'
      });
    } catch (error) {
      console.error('Error awarding Tournament Overlord achievement:', error);
    }
  }
  
  // Find user's rank
  const userRank = allParticipants.findIndex(p => p.userId === userId) + 1;
  
  res.json({
    success: true,
    data: {
      rankings: allParticipants.slice(0, 50), // Top 50
      totalTournaments: activeTournaments,
      totalParticipants: allParticipants.length,
      yourRank: userRank || null
    }
  });
}));

/**
 * GET /api/personal/leaderboard
 * Get personal portfolio leaderboard data
 */
router.get('/personal/leaderboard', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get all users with personal portfolios
  const users = await storage.getAllUsers();
  const userPortfolios = [];
  
  for (const user of users) {
    // Calculate portfolio value for all users
    const purchases = await storage.getPersonalStockPurchases(user.id);
    let portfolioValue = parseFloat(user.personalBalance) || 10000;
    
    // Add current value of all stock holdings
    for (const purchase of purchases) {
      try {
        const currentQuote = await getStockQuote(purchase.symbol);
        const currentValue = purchase.shares * currentQuote.price;
        portfolioValue += currentValue;
      } catch (error) {
        // If stock quote fails, use purchase price as fallback
        portfolioValue += purchase.shares * parseFloat(purchase.purchasePrice);
      }
    }
    
    // Calculate percentage change from total deposited amount
    const totalDeposited = parseFloat(user.totalDeposited) || 10000;
    const percentageChange = ((portfolioValue - totalDeposited) / totalDeposited) * 100;
    
    userPortfolios.push({
      ...user,
      portfolioValue,
      percentageChange,
      startingBalance: totalDeposited
    });
  }
  
  // Sort by percentage change (highest first)
  userPortfolios.sort((a, b) => b.percentageChange - a.percentageChange);
  
  // Award special achievement to #1 ranked user
  if (userPortfolios.length > 0) {
    const topUser = userPortfolios[0];
    try {
      await storage.awardAchievement({
        userId: topUser.id,
        achievementType: 'portfolio_emperor',
        achievementTier: 'special',
        achievementName: 'Portfolio Emperor',
        achievementDescription: 'Ranked #1 on personal portfolio leaderboard'
      });
    } catch (error) {
      console.error('Error awarding Portfolio Emperor achievement:', error);
    }
  }
  
  // Find user's rank
  const userRank = userPortfolios.findIndex(p => p.id === userId) + 1;
  
  res.json({
    success: true,
    data: {
      rankings: userPortfolios.slice(0, 50), // Top 50
      totalTraders: userPortfolios.length,
      premiumUsers: userPortfolios.length,
      yourRank: userRank || null
    }
  });
}));

/**
 * GET /api/streak/leaderboard
 * Get trading streak leaderboard data
 */
router.get('/streak/leaderboard', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get all users with personal portfolios
  const users = await storage.getAllUsers();
  const userStreaks = [];
  
  for (const user of users) {
    // Calculate trading streak for all users
    const tradingStreak = await calculateTradingStreak(user.id);
    
    userStreaks.push({
      ...user,
      tradingStreak
    });
  }
  
  // Sort by trading streak (highest first)
  userStreaks.sort((a, b) => b.tradingStreak - a.tradingStreak);
  
  // Award special achievement to #1 ranked user
  if (userStreaks.length > 0) {
    const topUser = userStreaks[0];
    try {
      await storage.awardAchievement({
        userId: topUser.id,
        achievementType: 'streak_master',
        achievementTier: 'special',
        achievementName: 'Streak Master',
        achievementDescription: 'Ranked #1 on trading streak leaderboard'
      });
    } catch (error) {
      console.error('Error awarding Streak Master achievement:', error);
    }
  }
  
  // Find user's rank
  const userRank = userStreaks.findIndex(p => p.id === userId) + 1;
  
  res.json({
    success: true,
    data: {
      rankings: userStreaks.slice(0, 50), // Top 50
      totalTraders: userStreaks.length,
      premiumUsers: userStreaks.length,
      yourRank: userRank || null
    }
  });
}));

/**
 * GET /api/admin/tournaments
 * Get all tournaments for admin management
 */
router.get('/admin/tournaments', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if user is admin (using user ID)
  const user = await storage.getUser(userId);
  if (!user || (user.userId !== 0 && user.userId !== 1 && user.userId !== 2)) {
    throw new ValidationError('Access denied. Admin privileges required.');
  }

  // Get all tournaments
  const allTournaments = await storage.getAllTournaments();
  
  // Filter out completed tournaments
  const activeTournaments = allTournaments.filter(tournament => tournament.status !== 'completed');
  
  // Get participant counts for each tournament and calculate end dates
  const tournamentsWithCounts = await Promise.all(
    activeTournaments.map(async (tournament) => {
      const participants = await storage.getTournamentParticipants(tournament.id);
      
      // Calculate end date based on creation date and timeframe
      const createdAt = new Date(tournament.createdAt);
      
      // Parse timeframe properly for different units (minutes, days, weeks, months)
      const parseTimeframe = (timeframe: string): number => {
        const match = timeframe.match(/(\d+)\s*(minute|minutes|day|days|week|weeks|month|months)/i);
        if (!match) return 28 * 24 * 60 * 60 * 1000; // Default to 4 weeks
        
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        switch (unit) {
          case 'minute':
          case 'minutes':
            return value * 60 * 1000;
          case 'day':
          case 'days':
            return value * 24 * 60 * 60 * 1000;
          case 'week':
          case 'weeks':
            return value * 7 * 24 * 60 * 60 * 1000;
          case 'month':
          case 'months':
            return value * 30 * 24 * 60 * 60 * 1000;
          default:
            return 28 * 24 * 60 * 60 * 1000;
        }
      };
      
      const timeframeMs = parseTimeframe(tournament.timeframe);
      const endDate = new Date(createdAt.getTime() + timeframeMs);
      
      return {
        ...tournament,
        memberCount: participants.length,
        endsAt: endDate.toISOString(), // Add calculated end date
      };
    })
  );

  res.json({
    success: true,
    data: tournamentsWithCounts
  });
}));

/**
 * DELETE /api/admin/tournaments/:id
 * Delete a tournament completely (admin only)
 */
router.delete('/admin/tournaments/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tournamentId = parseInt(req.params.id);

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  // Check if user is admin
  const user = await storage.getUser(userId);
  if (!user || (user.userId !== 0 && user.userId !== 1 && user.userId !== 2)) {
    throw new ValidationError('Access denied. Admin privileges required.');
  }

  // Get the tournament
  const tournaments = await storage.getAllTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  // Delete related data in the correct order (foreign key constraints)
  // Update trade_history to null out tournament_id instead of deleting (preserves user trade count)
  await db.execute(sql`UPDATE trade_history SET tournament_id = NULL WHERE tournament_id = ${tournamentId}`);
  await db.execute(sql`DELETE FROM tournament_stock_purchases WHERE tournament_id = ${tournamentId}`);
  await db.execute(sql`DELETE FROM tournament_participants WHERE tournament_id = ${tournamentId}`);
  await db.execute(sql`DELETE FROM tournaments WHERE id = ${tournamentId}`);

  // Log the admin action
  await storage.createAdminLog({
    adminUserId: userId,
    targetUserId: tournament.creatorId,
    action: 'tournament_deleted',
    oldValue: 'active',
    newValue: 'deleted',
    notes: `Admin deleted tournament "${tournament.name}" (${tournament.code}) completely`
  });

  res.json({
    success: true,
    message: `Tournament "${tournament.name}" has been deleted successfully`
  });
}));

/**
 * GET /api/users/public
 * Get all users with public profile information
 */
router.get('/users/public', asyncHandler(async (req, res) => {
  
  // Get all users with only public information
  const users = await storage.getAllUsers();
  
  const publicUsers = await Promise.all(users.map(async (user) => {
    // Get total trade count from trade history
    const totalTrades = await storage.getUserTradeCount(user.id);
    
    // Get achievement count (this will automatically ensure Welcome achievement exists)
    const achievements = await storage.getUserAchievements(user.id);
    const achievementCount = achievements.length;
    
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
      totalTrades: totalTrades,
      achievementCount: achievementCount,
      // Don't include sensitive information like email, password, balances, etc.
    };
  }));
  
  res.json({
    success: true,
    data: publicUsers
  });
}));

/**
 * GET /api/users/public/:userId
 * Get specific user's public profile information
 */
router.get('/users/public/:userId', asyncHandler(async (req, res) => {
  const targetUserId = parseInt(req.params.userId);
  
  if (isNaN(targetUserId)) {
    throw new ValidationError('Invalid user ID');
  }
  
  // Get the target user
  const targetUser = await storage.getUser(targetUserId);
  
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }
  
  // Get total trade count from trade history
  const totalTrades = await storage.getUserTradeCount(targetUserId);

  // Return only public information
  const publicUser = {
    id: targetUser.id,
    username: targetUser.username,
    displayName: targetUser.displayName,
    subscriptionTier: targetUser.subscriptionTier,
    createdAt: targetUser.createdAt,
    totalTrades: totalTrades,
    // Don't include sensitive information like email, password, balances, etc.
  };
  
  res.json({
    success: true,
    data: publicUser
  });
}));

/**
 * GET /api/tournaments/archived
 * Get archived tournaments for the current user
 */
router.get('/tournaments/archived', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const archivedTournaments = await storage.getArchivedTournaments(userId);
  
  res.json({
    success: true,
    data: archivedTournaments
  });
}));

/**
 * GET /api/achievements/:userId
 * Get user achievements
 */
router.get('/achievements/:userId', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }
  
  const achievements = await storage.getUserAchievements(userId);
  
  res.json({
    success: true,
    data: achievements
  });
}));

/**
 * POST /api/tournaments/check-expiration
 * Check and process expired tournaments (admin only)
 */
router.post('/tournaments/check-expiration', requireAuth, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (!req.user.email.includes('admin')) {
    throw new UnauthorizedError('Admin access required');
  }
  
  const { tournamentExpirationService } = await import('../services/tournamentExpiration');
  await tournamentExpirationService.processExpiredTournaments();
  
  res.json({
    success: true,
    message: 'Expired tournaments processed successfully'
  });
}));

/**
 * PUT /api/user/display-name
 * Update user's display name
 */
router.put('/user/display-name', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { displayName } = req.body;
  
  // Validate display name
  if (displayName && (typeof displayName !== 'string' || displayName.trim().length === 0 || displayName.trim().length > 255)) {
    throw new ValidationError('Display name must be a non-empty string with maximum 255 characters');
  }
  
  // Update user's display name
  const updatedUser = await storage.updateUser(userId, { 
    displayName: displayName ? displayName.trim() : null 
  });
  
  res.json({
    success: true,
    data: {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName,
      email: updatedUser.email,
      subscriptionTier: updatedUser.subscriptionTier,
      createdAt: updatedUser.createdAt
    }
  });
}));

/**
 * POST /api/check-portfolio-growth
 * Manual trigger for portfolio growth achievement check
 */
router.post('/check-portfolio-growth', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Manually trigger portfolio growth check
  await checkPersonalPortfolioGrowthAchievements(userId);

  res.json({
    success: true,
    message: 'Portfolio growth check completed',
  });
}));

// Portfolio history endpoints
router.get('/portfolio-history/:userId', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  const portfolioType = req.query.type as 'personal' | 'tournament' || 'personal';
  const tournamentId = req.query.tournamentId ? parseInt(req.query.tournamentId as string) : undefined;

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const history = await storage.getUserPortfolioHistory(userId, portfolioType, tournamentId);
  
  res.json({
    success: true,
    data: history
  });
}));

router.post('/portfolio-history', requireAuth, asyncHandler(async (req, res) => {
  const { userId, portfolioType, tournamentId, totalValue, cashBalance, stockValue } = req.body;

  if (!userId || !portfolioType || !totalValue || !cashBalance || !stockValue) {
    throw new ValidationError('Missing required fields');
  }

  const record = await storage.recordPortfolioValue({
    userId,
    portfolioType,
    tournamentId: tournamentId || null,
    totalValue: totalValue.toString(),
    cashBalance: cashBalance.toString(),
    stockValue: stockValue.toString()
  });

  res.json({
    success: true,
    data: record
  });
}));

/**
 * GET /api/chat/global
 * Get global chat messages (last 50)
 */
router.get('/chat/global', asyncHandler(async (req, res) => {
  const messages = await storage.getGlobalChatMessages(50);
  
  res.json({
    success: true,
    data: messages
  });
}));

/**
 * POST /api/chat
 * Send a global chat message (authenticated users only)
 */
router.post('/chat', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new ValidationError('Message is required');
  }
  
  if (message.length > 500) {
    throw new ValidationError('Message must be 500 characters or less');
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }
  
  const newMessage = await storage.createGlobalChatMessage({
    userId: user.userId,
    message: message.trim()
  });
  
  // Trigger WebSocket broadcast (this will be handled by the server WebSocket logic)
  // No need to do anything here as the client will refetch after mutation success
  
  res.json({
    success: true,
    data: newMessage
  });
}));

export default router;