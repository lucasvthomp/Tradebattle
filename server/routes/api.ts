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

const router = Router();

/**
 * GET /api/quote/:symbol
 * Fetch current stock quote data
 */
router.get('/quote/:symbol', asyncHandler(async (req, res) => {
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
router.get('/search/:query', asyncHandler(async (req, res) => {
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
router.get('/historical/:symbol', asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.query.timeframe as string || '1M') as TimeFrame;
  
  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  // Validate timeframe
  const validTimeframes: TimeFrame[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];
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
  const validTimeframes: TimeFrame[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];
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
router.post('/tournaments', asyncHandler(async (req, res) => {
  const { name, buyInAmount, maxPlayers, startingCash } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  if (!name || !buyInAmount || !startingCash) {
    throw new ValidationError('Tournament name, buy-in amount, and starting cash are required');
  }

  const tournament = await storage.createTournament({
    name: sanitizeInput(name),
    buyInAmount: parseFloat(buyInAmount),
    maxPlayers: maxPlayers || 10,
    startingCash: parseFloat(startingCash)
  }, userId);

  res.json({
    success: true,
    data: tournament,
  });
}));

/**
 * POST /api/tournaments/:code/join
 * Join a tournament by code
 */
router.post('/tournaments/:code/join', asyncHandler(async (req, res) => {
  const code = sanitizeInput(req.params.code.toUpperCase());
  const userId = req.user?.id;
  
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

  const participant = await storage.joinTournament(tournament.id, userId);

  res.json({
    success: true,
    data: participant,
  });
}));

/**
 * GET /api/tournaments
 * Get user's tournaments
 */
router.get('/tournaments', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const tournaments = await storage.getUserTournaments(userId);

  res.json({
    success: true,
    data: tournaments,
  });
}));

/**
 * GET /api/tournaments/:id/participants
 * Get tournament participants with user names and portfolio values
 */
router.get('/tournaments/:id/participants', asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

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
router.get('/tournaments/:id/balance', asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

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
router.get('/tournaments/:id/purchases', asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

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
router.post('/tournaments/:id/purchase', asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const { symbol, companyName, shares, purchasePrice } = req.body;
  
  if (!symbol || !companyName || !shares || !purchasePrice) {
    throw new ValidationError('All purchase fields are required');
  }

  const totalCost = shares * purchasePrice;

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
    purchasePrice: parseFloat(purchasePrice),
    totalCost: totalCost
  });

  // Update user balance
  await storage.updateTournamentBalance(tournamentId, userId, currentBalance - totalCost);

  res.status(201).json({
    success: true,
    data: { purchase },
  });
}));

/**
 * POST /api/tournaments/:id/sell
 * Sell stock in a tournament
 */
router.post('/tournaments/:id/sell', asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

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
 * POST /api/user/upgrade-premium
 * Upgrade user to premium subscription
 */
router.post('/user/upgrade-premium', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  // Update user subscription tier to premium
  const updatedUser = await storage.updateUser(userId, {
    subscriptionTier: 'premium',
    personalBalance: 10000,
    portfolioCreatedAt: new Date()
  });

  res.json({
    success: true,
    data: updatedUser,
  });
}));

/**
 * GET /api/personal-portfolio
 * Get personal portfolio data
 */
router.get('/personal-portfolio', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);
  
  if (!user || user.subscriptionTier !== 'premium') {
    throw new ValidationError('Premium subscription required');
  }

  res.json({
    success: true,
    data: {
      balance: user.personalBalance || 10000,
      portfolioCreatedAt: user.portfolioCreatedAt
    },
  });
}));

/**
 * GET /api/personal-purchases
 * Get personal stock purchases
 */
router.get('/personal-purchases', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);
  
  if (!user || user.subscriptionTier !== 'premium') {
    throw new ValidationError('Premium subscription required');
  }

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
router.post('/personal-portfolio/purchase', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);
  
  if (!user || user.subscriptionTier !== 'premium') {
    throw new ValidationError('Premium subscription required');
  }

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

  // Update user balance
  await storage.updateUser(userId, {
    personalBalance: currentBalance - totalCost
  });

  res.status(201).json({
    success: true,
    data: { purchase },
  });
}));

/**
 * POST /api/personal-portfolio/sell
 * Sell stock in personal portfolio
 */
router.post('/personal-portfolio/sell', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);
  
  if (!user || user.subscriptionTier !== 'premium') {
    throw new ValidationError('Premium subscription required');
  }

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
router.get('/tournaments/leaderboard', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }
  
  // Get all tournaments with participants and their portfolio values
  const tournaments = await storage.getAllTournaments();
  const allParticipants = [];
  let activeTournaments = 0;
  
  for (const tournament of tournaments) {
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
      
      // Calculate percentage change from starting balance
      const startingBalance = 10000; // Standard tournament starting balance
      const percentageChange = ((portfolioValue - startingBalance) / startingBalance) * 100;
      
      allParticipants.push({
        ...participant,
        portfolioValue,
        percentageChange,
        tournamentName: tournament.name,
        tournamentId: tournament.id
      });
    }
  }
  
  // Sort by percentage change (highest first)
  allParticipants.sort((a, b) => b.percentageChange - a.percentageChange);
  
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
router.get('/personal/leaderboard', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }
  
  // Get all users with personal portfolios
  const users = await storage.getAllUsers();
  const userPortfolios = [];
  
  for (const user of users) {
    // Skip users without personal portfolios
    if (!user.portfolioCreatedAt) continue;
    
    // Calculate portfolio value
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
    
    userPortfolios.push({
      ...user,
      portfolioValue,
      initialBalance: 10000 // Standard starting balance
    });
  }
  
  // Sort by portfolio value (highest first)
  userPortfolios.sort((a, b) => b.portfolioValue - a.portfolioValue);
  
  // Find user's rank
  const userRank = userPortfolios.findIndex(p => p.id === userId) + 1;
  
  // Count premium users
  const premiumUsers = userPortfolios.filter(p => p.subscriptionTier === 'premium').length;
  
  res.json({
    success: true,
    data: {
      rankings: userPortfolios.slice(0, 50), // Top 50
      totalTraders: userPortfolios.length,
      premiumUsers,
      yourRank: userRank || null
    }
  });
}));

export default router;