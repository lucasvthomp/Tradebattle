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
  const { name, buyInAmount, maxPlayers } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  if (!name || !buyInAmount) {
    throw new ValidationError('Tournament name and buy-in amount are required');
  }

  const tournament = await req.app.locals.storage.createTournament({
    name: sanitizeInput(name),
    buyInAmount: parseFloat(buyInAmount),
    maxPlayers: maxPlayers || 10
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

  const tournament = await req.app.locals.storage.getTournamentByCode(code);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  if (tournament.currentPlayers >= tournament.maxPlayers) {
    throw new ValidationError('Tournament is full');
  }

  const participant = await req.app.locals.storage.joinTournament(tournament.id, userId);

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

  const tournaments = await req.app.locals.storage.getUserTournaments(userId);

  res.json({
    success: true,
    data: tournaments,
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

  const balance = await req.app.locals.storage.getTournamentBalance(tournamentId, userId);

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

  const purchases = await req.app.locals.storage.getTournamentStockPurchases(tournamentId, userId);

  res.json({
    success: true,
    data: purchases,
  });
}));

export default router;