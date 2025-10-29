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
import { getExchangeRate, convertCurrency, getAllExchangeRates } from '../services/exchangeRates.js';
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
 * Get historical price data with query parameter timeframe
 */
router.get('/historical/:symbol', asyncHandler(async (req: any, res: any) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.query.timeframe as string || '1M') as TimeFrame;
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  // Validate timeframe
  const validTimeframes: TimeFrame[] = ['1H', '1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];
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
 * GET /api/historical/:symbol/:timeframe
 * Get historical price data with path parameter timeframe
 */
router.get('/historical/:symbol/:timeframe', asyncHandler(async (req: any, res: any) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.params.timeframe.toUpperCase()) as TimeFrame;
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  // Validate timeframe
  const validTimeframes: TimeFrame[] = ['1H', '1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];
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
  const validTimeframes: TimeFrame[] = ['1H', '1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];
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
  const { 
    name, 
    maxPlayers, 
    tournamentType, 
    startingBalance, 
    duration, 
    scheduledStartTime,
    buyInAmount, 
    tradingRestriction, 
    isPublic 
  } = req.body;
  const userId = req.user.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);

  if (!name || !startingBalance) {
    throw new ValidationError('Tournament name and starting balance are required');
  }

  const buyIn = parseFloat(buyInAmount) || 0;
  
  // The buy-in deduction will be handled by the storage layer

  const startTime = scheduledStartTime ? new Date(scheduledStartTime) : new Date();
  const tournament = await storage.createTournament({
    name: sanitizeInput(name),
    maxPlayers: maxPlayers || 10,
    tournamentType: tournamentType || 'stocks',
    startingBalance: parseFloat(startingBalance),
    timeframe: duration || '1 week',
    scheduledStartTime: startTime,
    buyInAmount: buyIn,
    currentPot: 0, // Will be set by storage layer after buy-in deduction
    tradingRestriction: tradingRestriction || 'none',
    isPublic: isPublic !== undefined ? isPublic : true
  }, userId);

  // If scheduled start time is now or in the past, activate the tournament immediately
  const now = new Date();
  if (startTime <= now) {
    await storage.updateTournamentStatus(tournament.id, 'active', now);
  }

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
 * POST /api/tournaments/:id/start-early
 * Start a private tournament early (creator only)
 */
router.post('/tournaments/:id/start-early', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  
  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  // Check if user is the creator
  if (tournament.creatorId !== userId) {
    throw new ValidationError('Only tournament creators can start tournaments early');
  }

  // Check if tournament is private
  if (tournament.isPublic) {
    throw new ValidationError('Only private tournaments can be started early');
  }

  // Check if tournament hasn't started yet
  if (tournament.status !== 'waiting') {
    throw new ValidationError('Tournament has already started or ended');
  }

  // Check minimum participants
  if (tournament.currentPlayers < 2) {
    throw new ValidationError('Need at least 2 participants to start tournament');
  }

  // Start the tournament
  await storage.updateTournament(tournamentId, {
    status: 'active',
    startedAt: new Date()
  });

  res.json({
    success: true,
    message: 'Tournament started successfully'
  });
}));

/**
 * DELETE /api/tournaments/:id/cancel
 * Cancel a private tournament (creator only, before it starts)
 */
router.delete('/tournaments/:id/cancel', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  
  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  // Check if user is the creator
  if (tournament.creatorId !== userId) {
    throw new ValidationError('Only tournament creators can cancel tournaments');
  }

  // Check if tournament is private
  if (tournament.isPublic) {
    throw new ValidationError('Only private tournaments can be cancelled');
  }

  // Check if tournament hasn't started yet
  if (tournament.status !== 'waiting') {
    throw new ValidationError('Cannot cancel tournaments that have already started');
  }

  // Delete the tournament and all related data
  await storage.deleteTournament(tournamentId);

  res.json({
    success: true,
    message: 'Tournament cancelled successfully'
  });
}));

/**
 * DELETE /api/tournaments/:id/participants/:participantId
 * Kick a participant from a private tournament (creator only, before it starts)
 */
router.delete('/tournaments/:id/participants/:participantId', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const participantId = parseInt(req.params.participantId);
  const userId = req.user.id;
  
  if (isNaN(tournamentId) || isNaN(participantId)) {
    throw new ValidationError('Invalid tournament or participant ID');
  }

  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  // Check if user is the creator
  if (tournament.creatorId !== userId) {
    throw new ValidationError('Only tournament creators can kick participants');
  }

  // Check if tournament is private
  if (tournament.isPublic) {
    throw new ValidationError('Cannot kick participants from public tournaments');
  }

  // Check if tournament hasn't started yet
  if (tournament.status !== 'waiting') {
    throw new ValidationError('Cannot kick participants from tournaments that have already started');
  }

  // Cannot kick the creator
  if (participantId === userId) {
    throw new ValidationError('Tournament creators cannot kick themselves');
  }

  // Remove participant
  await storage.removeTournamentParticipant(tournamentId, participantId);

  res.json({
    success: true,
    message: 'Participant removed successfully'
  });
}));

/**
 * POST /api/tournaments/code/:code/join
 * Join a tournament by code
 */
router.post('/tournaments/code/:code/join', requireAuth, asyncHandler(async (req, res) => {
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
 * POST /api/tournaments/:id/join
 * Join a tournament by ID
 */
router.post('/tournaments/:id/join', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const tournament = await storage.getTournamentById(tournamentId);
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
 * GET /api/tournaments/:id/leaderboard
 * Get tournament leaderboard with rankings and portfolio values
 */
router.get('/tournaments/:id/leaderboard', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  
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
      const portfolioValue = balance + stockValue;

      return {
        userId: participant.userId,
        firstName: participant.firstName,
        username: participant.username,
        portfolioValue,
        balance,
        stockValue
      };
    })
  );

  // Sort by portfolio value (highest first)
  participantsWithValues.sort((a, b) => b.portfolioValue - a.portfolioValue);

  res.json({
    success: true,
    participants: participantsWithValues,
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
 * GET /api/portfolio/tournament/:id
 * Get tournament portfolio for user
 */
router.get('/portfolio/tournament/:id', requireAuth, asyncHandler(async (req, res) => {
  console.log('Tournament portfolio route hit, user:', req.user);
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  // Get tournament stock purchases
  const purchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  
  // Group purchases by symbol and calculate holdings
  const stockHoldings: { [symbol: string]: { 
    symbol: string;
    companyName: string;
    shares: number; 
    averagePurchasePrice: number;
    totalCost: number;
    currentPrice?: number;
    currentValue?: number;
    profitLoss?: number;
    profitLossPercent?: number;
  } } = {};
  
  // Process all purchases to calculate holdings
  for (const purchase of purchases) {
    const symbol = purchase.symbol;
    const shares = purchase.shares;
    const purchasePrice = parseFloat(purchase.purchasePrice);
    const totalCost = parseFloat(purchase.totalCost);
    
    if (!stockHoldings[symbol]) {
      stockHoldings[symbol] = {
        symbol,
        companyName: purchase.companyName,
        shares: 0,
        averagePurchasePrice: 0,
        totalCost: 0
      };
    }
    
    const holding = stockHoldings[symbol];
    const newTotalShares = holding.shares + shares;
    const newTotalCost = holding.totalCost + totalCost;
    
    stockHoldings[symbol] = {
      ...holding,
      shares: newTotalShares,
      totalCost: newTotalCost,
      averagePurchasePrice: newTotalCost / newTotalShares
    };
  }
  
  // Get current prices and calculate profit/loss
  for (const holding of Object.values(stockHoldings)) {
    try {
      const quote = await getStockQuote(holding.symbol);
      holding.currentPrice = quote.price;
      holding.currentValue = holding.shares * quote.price;
      holding.profitLoss = holding.currentValue - holding.totalCost;
      holding.profitLossPercent = (holding.profitLoss / holding.totalCost) * 100;
    } catch (error) {
      console.error(`Error fetching quote for ${holding.symbol}:`, error);
      // Fallback to purchase price
      holding.currentPrice = holding.averagePurchasePrice;
      holding.currentValue = holding.shares * holding.averagePurchasePrice;
      holding.profitLoss = 0;
      holding.profitLossPercent = 0;
    }
  }

  res.json({
    success: true,
    data: Object.values(stockHoldings)
  });
}));

/**
 * POST /api/tournaments/:id/sell
 * Sell stock in a tournament
 */
router.post('/tournaments/:id/sell', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const { symbol, sharesToSell, currentPrice } = req.body;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  if (!symbol || !sharesToSell || !currentPrice) {
    throw new ValidationError('Symbol, shares to sell, and current price are required');
  }

  const sharesToSellNum = parseInt(sharesToSell);
  if (isNaN(sharesToSellNum) || sharesToSellNum <= 0) {
    throw new ValidationError('Invalid number of shares to sell');
  }

  // Check if tournament is completed (no trading allowed)
  const tournaments = await storage.getAllTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (tournament && tournament.status === 'completed') {
    throw new ValidationError('Cannot trade in completed tournaments');
  }

  // Get user's tournament stock purchases for this symbol
  const allPurchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  const symbolPurchases = allPurchases.filter(p => p.symbol === symbol);
  
  if (symbolPurchases.length === 0) {
    throw new ValidationError('No holdings found for this stock');
  }

  // Calculate total shares owned
  const totalShares = symbolPurchases.reduce((sum, purchase) => sum + purchase.shares, 0);
  
  if (sharesToSellNum > totalShares) {
    throw new ValidationError(`Cannot sell ${sharesToSellNum} shares. You only own ${totalShares} shares.`);
  }

  // Calculate sale value
  const saleValue = sharesToSellNum * parseFloat(currentPrice);

  // Get current balance
  const currentBalance = await storage.getTournamentBalance(tournamentId, userId);

  // Process the sale by removing shares (FIFO - First In, First Out)
  let remainingToSell = sharesToSellNum;
  
  for (const purchase of symbolPurchases) {
    if (remainingToSell <= 0) break;
    
    if (purchase.shares <= remainingToSell) {
      // Sell all shares from this purchase
      remainingToSell -= purchase.shares;
      await storage.deleteTournamentPurchase(tournamentId, userId, purchase.id);
    } else {
      // Partially sell shares from this purchase
      const newShares = purchase.shares - remainingToSell;
      const purchasePrice = parseFloat(purchase.purchasePrice);
      
      // Delete the old record and create a new one with remaining shares
      await storage.deleteTournamentPurchase(tournamentId, userId, purchase.id);
      await storage.purchaseTournamentStock(tournamentId, userId, {
        symbol: purchase.symbol,
        companyName: purchase.companyName,
        shares: newShares,
        purchasePrice: purchasePrice,
        totalCost: newShares * purchasePrice
      });
      
      remainingToSell = 0;
    }
  }

  // Update tournament balance
  await storage.updateTournamentBalance(tournamentId, userId, currentBalance + saleValue);

  // Record the trade in trade history
  const firstPurchase = symbolPurchases[0]; // Get company name from first purchase
  await storage.recordTrade({
    userId: userId,
    tournamentId: tournamentId,
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(firstPurchase.companyName),
    tradeType: 'sell',
    shares: sharesToSellNum,
    price: parseFloat(currentPrice).toString(),
    totalValue: saleValue.toString()
  });

  res.json({
    success: true,
    data: { 
      saleValue,
      newBalance: currentBalance + saleValue,
      sharesSold: sharesToSellNum
    },
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
 * GET /api/leaderboard/total-wagered
 * Get leaderboard by total amount wagered across all tournaments
 */
router.get('/leaderboard/total-wagered', requireAuth, asyncHandler(async (req, res) => {
  // Get all tournament participants
  const participants = await storage.getAllTournamentParticipants();

  // Group by user and sum their total wagered amounts
  const userWagers = new Map();

  for (const participant of participants) {
    const current = userWagers.get(participant.userId) || {
      userId: participant.userId,
      username: participant.username || 'Unknown User',
      totalWagered: 0,
      tournamentCount: 0
    };

    current.totalWagered += participant.buyInAmount || 0;
    current.tournamentCount += 1;
    userWagers.set(participant.userId, current);
  }

  // Convert to array and sort by total wagered
  const rankings = Array.from(userWagers.values())
    .sort((a, b) => b.totalWagered - a.totalWagered);

  res.json({
    success: true,
    data: {
      rankings: rankings.slice(0, 50)
    }
  });
}));

/**
 * GET /api/leaderboard/highest-wager
 * Get tournaments with the highest buy-in amounts
 */
router.get('/leaderboard/highest-wager', requireAuth, asyncHandler(async (req, res) => {
  const tournaments = await storage.getAllTournaments();

  // Filter tournaments with buy-ins and sort by buy-in amount
  const rankings = tournaments
    .filter(t => t.buyInAmount && t.buyInAmount > 0)
    .sort((a, b) => b.buyInAmount - a.buyInAmount)
    .map(t => ({
      id: t.id,
      name: t.name,
      buyInAmount: t.buyInAmount,
      currentPlayers: t.currentPlayers || 0,
      maxPlayers: t.maxPlayers || 0,
      status: t.status
    }));

  res.json({
    success: true,
    data: {
      rankings: rankings.slice(0, 50)
    }
  });
}));

/**
 * GET /api/leaderboard/most-growth
 * Get participants with the most growth (percentage) in any tournament
 */
router.get('/leaderboard/most-growth', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all tournament participants
  const participants = await storage.getAllTournamentParticipants();

  // Calculate growth for each participant
  const participantGrowth = await Promise.all(participants.map(async participant => {
    const portfolioValue = await storage.calculatePortfolioValue(
      participant.userId,
      participant.tournamentId
    );

    const startingBalance = participant.startingBalance || 10000;
    const percentageChange = ((portfolioValue - startingBalance) / startingBalance) * 100;

    // Get tournament info
    const tournament = await storage.getTournamentById(participant.tournamentId);

    return {
      id: participant.id,
      userId: participant.userId,
      username: participant.username || 'Unknown User',
      tournamentId: participant.tournamentId,
      tournamentName: tournament?.name || 'Unknown Tournament',
      startingBalance,
      portfolioValue,
      percentageChange
    };
  }));

  // Sort by percentage change (highest first)
  const rankings = participantGrowth
    .sort((a, b) => b.percentageChange - a.percentageChange);

  // Find user's rank
  const userRank = rankings.findIndex(p => p.userId === userId) + 1;

  res.json({
    success: true,
    data: {
      rankings: rankings.slice(0, 50),
      yourRank: userRank || null
    }
  });
}));

/**
 * GET /api/admin/users
 * Get all users for admin management
 */
router.get('/admin/users', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Check if user is admin
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required'
    });
  }

  const users = await storage.getAllUsers();
  res.json(users);
}));

/**
 * PATCH /api/admin/users/:userId/username
 * Update user username (admin only)
 */
router.patch('/admin/users/:userId/username', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { username } = req.body;
  
  // Check if user is admin
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  
  await storage.updateUserUsername(targetUserId, username.trim());
  res.json({ success: true, message: 'Username updated successfully' });
}));

/**
 * PATCH /api/admin/users/:userId/balance
 * Update user balance (admin only)
 */
router.patch('/admin/users/:userId/balance', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { amount, operation } = req.body;
  
  // Check if user is admin
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }
  
  if (!['add', 'remove'].includes(operation)) {
    return res.status(400).json({ error: 'Operation must be add or remove' });
  }
  
  await storage.adminUpdateUserBalance(targetUserId, amount, operation);
  res.json({ success: true, message: 'Balance updated successfully' });
}));

/**
 * PATCH /api/admin/users/:userId/note
 * Update user admin note (admin only)
 */
router.patch('/admin/users/:userId/note', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { note } = req.body;
  
  // Check if user is admin
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  await storage.updateUserAdminNote(targetUserId, note || '');
  res.json({ success: true, message: 'Admin note updated successfully' });
}));

/**
 * PATCH /api/admin/users/:userId/ban
 * Ban user (admin only)
 */
router.patch('/admin/users/:userId/ban', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  
  // Check if user is admin
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  await storage.banUser(targetUserId);
  res.json({ success: true, message: 'User banned successfully' });
}));

/**
 * GET /api/admin/tournaments
 * Get all tournaments for admin management
 */
router.get('/admin/tournaments', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if user is admin (using subscription tier)
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
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
    // Get achievement count (this will automatically ensure Welcome achievement exists)
    const achievements = await storage.getUserAchievements(user.id);
    const achievementCount = achievements.length;
    
    return {
      id: user.id,
      username: user.username,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
      totalTrades: user.totalTrades || 0,
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
 * PATCH /api/profile/picture
 * Update user profile picture
 */
router.patch('/profile/picture', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { profilePicture } = req.body;

  if (!profilePicture) {
    throw new ValidationError('Profile picture data is required');
  }

  // Validate base64 image
  if (!profilePicture.startsWith('data:image/')) {
    throw new ValidationError('Invalid image format');
  }

  await storage.updateProfilePicture(userId, profilePicture);

  res.json({
    success: true,
    message: 'Profile picture updated successfully'
  });
}));

/**
 * GET /api/chat/global
 * Get global chat messages
 */
router.get('/chat/global', requireAuth, asyncHandler(async (req, res) => {
  const messages = await storage.getChatMessages();
  res.json({
    success: true,
    data: messages
  });
}));

/**
 * POST /api/chat/global
 * Send message to global chat
 */
router.post('/chat/global', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ValidationError('Message is required');
  }

  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: message.trim(),
    tournamentId: null
  });

  res.json({
    success: true,
    data: chatMessage
  });
}));

/**
 * GET /api/chat/global
 * Get global chat messages
 */
router.get('/chat/global', requireAuth, asyncHandler(async (req, res) => {
  const messages = await storage.getChatMessages(null); // null for global chat
  res.json({
    success: true,
    data: messages
  });
}));

/**
 * POST /api/chat/global
 * Send message to global chat
 */
router.post('/chat/global', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ValidationError('Message is required');
  }

  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: message.trim(),
    tournamentId: null // null for global chat
  });

  res.json({
    success: true,
    data: chatMessage
  });
}));

/**
 * GET /api/chat/tournament/:tournamentId
 * Get tournament-specific chat messages
 */
router.get('/chat/tournament/:tournamentId', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.tournamentId);
  
  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const messages = await storage.getChatMessages(tournamentId);
  res.json({
    success: true,
    data: messages
  });
}));

/**
 * POST /api/chat/tournament/:tournamentId
 * Send message to tournament chat
 */
router.post('/chat/tournament/:tournamentId', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tournamentId = parseInt(req.params.tournamentId);
  const { message } = req.body;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  if (!message || !message.trim()) {
    throw new ValidationError('Message is required');
  }

  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: message.trim(),
    tournamentId
  });

  res.json({
    success: true,
    data: chatMessage
  });
}));

/**
 * GET /api/exchange-rates/:baseCurrency
 * Get exchange rates for all supported currencies
 */
router.get('/exchange-rates/:baseCurrency', asyncHandler(async (req, res) => {
  const { baseCurrency } = req.params;
  
  if (!baseCurrency) {
    throw new ValidationError('Base currency is required');
  }
  
  const rates = await getAllExchangeRates(baseCurrency.toUpperCase());
  
  res.json({
    success: true,
    data: {
      baseCurrency: baseCurrency.toUpperCase(),
      rates,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * GET /api/exchange-rate/:from/:to
 * Get specific exchange rate between two currencies
 */
router.get('/exchange-rate/:from/:to', asyncHandler(async (req, res) => {
  const { from, to } = req.params;
  
  if (!from || !to) {
    throw new ValidationError('Both from and to currencies are required');
  }
  
  const rate = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
  
  res.json({
    success: true,
    data: {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * POST /api/convert-currency
 * Convert amount from one currency to another
 */
router.post('/convert-currency', asyncHandler(async (req, res) => {
  const { amount, from, to } = req.body;
  
  if (!amount || !from || !to) {
    throw new ValidationError('Amount, from currency, and to currency are required');
  }
  
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) {
    throw new ValidationError('Invalid amount');
  }
  
  const convertedAmount = await convertCurrency(amountNum, from.toUpperCase(), to.toUpperCase());
  const rate = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
  
  res.json({
    success: true,
    data: {
      originalAmount: amountNum,
      convertedAmount,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      timestamp: new Date().toISOString()
    }
  });
}));

export default router;