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
import { getKeyStats } from '../services/keyStats.js';
import {
  asyncHandler,
  validateSymbol,
  sanitizeInput,
  ValidationError,
  NotFoundError,
  UnauthorizedError
} from '../utils/errorHandler.js';
import { storage } from '../storage.js';
import { db } from '../db.js';
import { tournaments, tournamentParticipants, tradeHistory } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '../auth.js';
import { containsProfanity, censorProfanity } from '../utils/profanityFilter.js';

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
  } catch (error: any) {
    console.error(`Quote fetch failed for ${symbol}:`, error?.message);
    res.status(502).json({
      success: false,
      error: `Unable to fetch quote for ${symbol}. Yahoo Finance may be temporarily unavailable.`,
    });
  }
}));

/**
 * GET /api/search/:query
 * Search for stock symbols by company name
 * Query params:
 *   - tournamentId: Filter results by tournament type (crypto vs stock)
 */
router.get('/search/:query', asyncHandler(async (req: any, res: any) => {
  const query = sanitizeInput(req.params.query);
  const tournamentId = req.query.tournamentId;

  if (!query || query.length < 2) {
    throw new ValidationError('Query must be at least 2 characters long');
  }

  let results = await searchStocks(query);

  // Filter by tournament type if specified
  if (tournamentId) {
    const tournament = await storage.getTournamentById(parseInt(tournamentId));
    if (tournament && tournament.tournamentType) {
      const { isCryptoSymbol } = await import('../services/yahooFinance.js');
      results = results.filter((result: any) => {
        const isCrypto = isCryptoSymbol(result.symbol);
        return tournament.tournamentType === 'crypto' ? isCrypto : !isCrypto;
      });
    }
  }

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
  } catch (error: any) {
    console.error(`Profile fetch failed for ${symbol}:`, error?.message);
    res.status(502).json({
      success: false,
      error: `Unable to fetch profile for ${symbol}. Yahoo Finance may be temporarily unavailable.`,
    });
  }
}));

/**
 * GET /api/key-stats/:symbol
 * Get extended key statistics for a stock
 */
router.get('/key-stats/:symbol', asyncHandler(async (req: any, res: any) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());

  if (!validateSymbol(symbol)) {
    throw new ValidationError('Invalid symbol format');
  }

  try {
    const stats = await getKeyStats(symbol);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    throw new NotFoundError(`Key stats not found for symbol: ${symbol}`);
  }
}));

/**
 * GET /api/popular
 * Get popular/trending stocks
 * Query params:
 *   - tournamentId: Filter results by tournament type (crypto vs stock)
 */
router.get('/popular', asyncHandler(async (req, res) => {
  const tournamentId = req.query.tournamentId;
  let popularStocks: any[] = await getPopularStocks();

  // Filter by tournament type if specified
  if (tournamentId) {
    const tournament = await storage.getTournamentById(parseInt(tournamentId as string));
    if (tournament && tournament.tournamentType) {
      const { isCryptoSymbol } = await import('../services/yahooFinance.js');

      // If crypto tournament, show popular cryptos; if stock tournament, show popular stocks
      if (tournament.tournamentType === 'crypto') {
        // Replace with popular crypto list
        popularStocks = [
          { symbol: 'BTC-USD', name: 'Bitcoin' },
          { symbol: 'ETH-USD', name: 'Ethereum' },
          { symbol: 'BNB-USD', name: 'Binance Coin' },
          { symbol: 'SOL-USD', name: 'Solana' },
          { symbol: 'XRP-USD', name: 'Ripple' },
          { symbol: 'ADA-USD', name: 'Cardano' },
          { symbol: 'DOGE-USD', name: 'Dogecoin' },
          { symbol: 'MATIC-USD', name: 'Polygon' },
          { symbol: 'DOT-USD', name: 'Polkadot' },
          { symbol: 'AVAX-USD', name: 'Avalanche' }
        ];
      } else {
        // Filter out any crypto symbols from popular stocks
        popularStocks = popularStocks.filter((stock: any) =>
          !isCryptoSymbol(stock.symbol)
        );
      }
    }
  }

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
    isPublic,
    payoutStructure
  } = req.body;
  const userId = req.user.id;

  console.log('[Tournament Creation] Request body:', JSON.stringify(req.body, null, 2));

  if (!userId) {
    throw new ValidationError('User not authenticated');
  }

  const user = await storage.getUser(userId);
  if (user?.tournamentRestricted) {
    throw new ValidationError('Your account is restricted from creating or joining tournaments.');
  }
  console.log('[Tournament Creation] User:', userId, 'Balance:', user?.siteCash);

  if (!name || !startingBalance) {
    throw new ValidationError('Tournament name and starting balance are required');
  }

  const buyIn = parseFloat(buyInAmount) || 0;
  console.log('[Tournament Creation] Buy-in amount:', buyIn);

  // The buy-in deduction will be handled by the storage layer

  const startTime = scheduledStartTime ? new Date(scheduledStartTime) : new Date();

  // Enforce minimum 1-minute start delay (prevents backdated tournaments)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  if (startTime < oneMinuteAgo) {
    throw new ValidationError('Tournament start time cannot be in the past');
  }

  console.log('[Tournament Creation] Start time:', startTime);

  const validPayoutStructures = ['winner_take_all', 'top_3', 'top_5', 'top_half'];
  const tournamentData = {
    name: sanitizeInput(name),
    maxPlayers: maxPlayers || 10,
    tournamentType: tournamentType || 'stocks',
    startingBalance: parseFloat(startingBalance).toString(),
    timeframe: duration || '1 week',
    scheduledStartTime: startTime,
    buyInAmount: buyIn.toString(),
    tradingRestriction: tradingRestriction || 'none',
    isPublic: isPublic !== undefined ? isPublic : true,
    payoutStructure: validPayoutStructures.includes(payoutStructure) ? payoutStructure : 'winner_take_all'
  };

  console.log('[Tournament Creation] Tournament data:', JSON.stringify(tournamentData, null, 2));

  let tournament = await storage.createTournament(tournamentData, userId);

  // If scheduled start time is now or in the past, activate the tournament immediately
  const now = new Date();
  if (startTime <= now) {
    console.log('[Tournament Creation] Activating tournament immediately');
    tournament = await storage.updateTournament(tournament.id, {
      status: 'active',
      startedAt: now
    });
  }

  // Award achievements (wrapped in try-catch to prevent tournament creation failure)
  try {
    // Award Tournament Creator achievement (rare)
    await storage.awardAchievement({
      userId: userId,
      achievementType: 'tournament_creator',
      achievementTier: 'rare',
      achievementName: 'Tournament Creator',
      achievementDescription: 'Created a tournament'
    });

    // Award Tournament Participant achievement
    await storage.awardAchievement({
      userId: userId,
      achievementType: 'tournament_participant',
      achievementTier: 'common',
      achievementName: 'Tournament Participant',
      achievementDescription: 'Joined a tournament'
    });
  } catch (error) {
    console.error('Failed to award achievements:', error);
    // Continue despite achievement failure
  }

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

  // Check if tournament hasn't started yet
  if (tournament.status !== 'waiting') {
    throw new ValidationError('Tournament has already started or ended');
  }

  // Allow starting with any number of participants for testing purposes
  // Minimum participant check removed temporarily

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
 * GET /api/tournaments/code/:code
 * Look up a tournament by code (for preview before joining)
 */
router.get('/tournaments/code/:code', requireAuth, asyncHandler(async (req, res) => {
  const code = sanitizeInput(req.params.code.toUpperCase());
  const userId = req.user.id;

  const tournament = await storage.getTournamentByCode(code);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  // Check if user is already a participant
  const participantUserIds = await storage.getTournamentParticipantUserIds(tournament.id);
  const alreadyJoined = participantUserIds.includes(userId);

  // Get participant previews
  const participantPreviews = await storage.getTournamentParticipantPreviews(tournament.id);

  res.json({
    success: true,
    data: {
      ...tournament,
      alreadyJoined,
      participantPreviews,
      participantUserIds
    }
  });
}));

/**
 * POST /api/tournaments/:id/invite
 * Invite friends to a tournament
 */
router.post('/tournaments/:id/invite', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const { friendIds } = req.body;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  if (!Array.isArray(friendIds) || friendIds.length === 0) {
    throw new ValidationError('friendIds must be a non-empty array');
  }

  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError('Tournament not found');
  }

  // Check if tournament is in waiting status
  if (tournament.status !== 'waiting') {
    throw new ValidationError('Can only invite to waiting tournaments');
  }

  // Check if user is creator or participant
  const participantUserIds = await storage.getTournamentParticipantUserIds(tournament.id);
  if (tournament.creatorId !== userId && !participantUserIds.includes(userId)) {
    throw new ValidationError('Only tournament participants can send invites');
  }

  const inviter = await storage.getUser(userId);
  if (!inviter) {
    throw new ValidationError('User not found');
  }

  // Create notifications for each friend
  let invitedCount = 0;
  for (const friendId of friendIds) {
    // Skip if friend is already a participant
    if (participantUserIds.includes(friendId)) {
      continue;
    }

    await storage.createNotification({
      userId: friendId,
      type: 'tournament_invite',
      title: 'Tournament Invitation',
      message: `${inviter.username} invited you to join "${tournament.name}"`,
      metadata: {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        tournamentCode: tournament.code,
        inviterId: userId,
        inviterUsername: inviter.username,
        invitedBy: userId,
        invitedByUsername: inviter.username
      }
    });
    invitedCount++;
  }

  res.json({
    success: true,
    invited: invitedCount
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

  const joinUser = await storage.getUser(userId);
  if (joinUser?.tournamentRestricted) {
    throw new ValidationError('Your account is restricted from creating or joining tournaments.');
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
      achievementDescription: 'Joined a tournament'
    });

    // Notify tournament creator that someone joined via invite
    const joiner = await storage.getUser(userId);
    if (joiner && tournament.creatorId !== userId) {
      await storage.createNotification({
        userId: tournament.creatorId,
        type: 'tournament_invite_accepted',
        title: 'Tournament Invite Accepted',
        message: `${joiner.username} joined your tournament "${tournament.name}"`,
        metadata: {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          joinerId: userId,
          joinerUsername: joiner.username
        }
      });
    }

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

  const joinUser = await storage.getUser(userId);
  if (joinUser?.tournamentRestricted) {
    throw new ValidationError('Your account is restricted from creating or joining tournaments.');
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
      achievementDescription: 'Joined a tournament'
    });

    // Notify tournament creator that someone joined
    const joiner = await storage.getUser(userId);
    if (joiner && tournament.creatorId !== userId) {
      await storage.createNotification({
        userId: tournament.creatorId,
        type: 'tournament_invite_accepted',
        title: 'New Tournament Participant',
        message: `${joiner.username} joined your tournament "${tournament.name}"`,
        metadata: {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          joinerId: userId,
          joinerUsername: joiner.username
        }
      });
    }

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

  const userTournaments = await storage.getUserTournaments(userId);

  // Attach participant previews to each tournament
  const tournamentsWithPreviews = await Promise.all(
    userTournaments.map(async (tournament: any) => {
      const participantPreviews = await storage.getTournamentParticipantPreviews(tournament.id);
      const participantUserIds = await storage.getTournamentParticipantUserIds(tournament.id);
      return { ...tournament, participantPreviews, participantUserIds };
    })
  );

  res.json({
    success: true,
    data: tournamentsWithPreviews,
  });
}));

/**
 * GET /api/tournaments/public
 * Get public tournaments for browsing
 */
router.get('/tournaments/public', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const publicTournaments = await storage.getPublicTournaments();

  // Attach participant previews and user IDs to each tournament
  const tournamentsWithPreviews = await Promise.all(
    publicTournaments.map(async (tournament: any) => {
      const participantPreviews = await storage.getTournamentParticipantPreviews(tournament.id);
      const participantUserIds = await storage.getTournamentParticipantUserIds(tournament.id);
      return { ...tournament, participantPreviews, participantUserIds };
    })
  );

  res.json({
    success: true,
    data: tournamentsWithPreviews,
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
      const stockSymbols = [...new Set<string>(participant.stockPurchases.map((p: any) => p.symbol))];

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
      const stockSymbols = [...new Set<string>(participant.stockPurchases.map((p: any) => p.symbol))];

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
 * GET /api/tournaments/:id/trades
 * Get current user's trade history for a tournament
 */
router.get('/tournaments/:id/trades', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const trades = await storage.getUserTournamentTrades(userId, tournamentId);

  res.json({
    success: true,
    data: trades,
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
  const { symbol, sharesToSell } = req.body;

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  if (!symbol || !sharesToSell) {
    throw new ValidationError('Symbol and shares to sell are required');
  }

  const sharesToSellNum = parseInt(sharesToSell);
  if (isNaN(sharesToSellNum) || sharesToSellNum <= 0) {
    throw new ValidationError('Invalid number of shares to sell');
  }

  // Check if tournament is completed (no trading allowed)
  const tournament = await storage.getTournamentById(tournamentId);
  if (tournament && tournament.status === 'completed') {
    throw new ValidationError('Cannot trade in completed tournaments');
  }

  // Check if market is open for stock tournaments (blitz bypasses market hours)
  if (tournament && tournament.tournamentType !== 'crypto' && tournament.tournamentType !== 'blitz') {
    const { isMarketOpen } = await import('../../shared/marketHours');
    if (!isMarketOpen()) {
      throw new ValidationError('Stock market is closed. Trading is available Mon-Fri 9:30 AM - 4:00 PM ET.');
    }
  }

  const cleanSymbol = sanitizeInput(symbol).toUpperCase();

  // Get user's tournament stock purchases for this symbol
  const allPurchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  const symbolPurchases = allPurchases.filter(p => p.symbol === cleanSymbol);

  if (symbolPurchases.length === 0) {
    throw new ValidationError('No holdings found for this stock');
  }

  // Calculate total shares owned
  const totalShares = symbolPurchases.reduce((sum, purchase) => sum + purchase.shares, 0);

  if (sharesToSellNum > totalShares) {
    throw new ValidationError(`Cannot sell ${sharesToSellNum} shares. You only own ${totalShares} shares.`);
  }

  // SECURITY: Never trust a client-supplied price. Fetch the authoritative
  // sale price server-side so a manipulated request cannot sell above market.
  let executionPrice: number;
  try {
    const quote = await getStockQuote(cleanSymbol);
    executionPrice = Math.round(Number(quote.price) * 100) / 100;
  } catch (err: any) {
    throw new ValidationError(`Unable to fetch a current price for ${cleanSymbol}. Please try again.`);
  }
  if (!isFinite(executionPrice) || executionPrice <= 0) {
    throw new ValidationError('Received an invalid market price. Please try again.');
  }

  // Execute the sale atomically with true FIFO lot consumption, balance
  // credit, and trade record all in one transaction.
  let result;
  try {
    result = await storage.executeTournamentSell({
      tournamentId,
      userId,
      symbol: cleanSymbol,
      companyName: sanitizeInput(symbolPurchases[0].companyName),
      sharesToSell: sharesToSellNum,
      price: executionPrice,
    });
  } catch (err: any) {
    if (err?.message === 'INSUFFICIENT_SHARES') {
      throw new ValidationError(`Cannot sell ${sharesToSellNum} shares. You do not own that many.`);
    }
    if (err?.message === 'NOT_A_PARTICIPANT') {
      throw new ValidationError('You are not a participant in this tournament');
    }
    throw err;
  }

  res.json({
    success: true,
    data: {
      saleValue: result.saleValue,
      newBalance: result.newBalance,
      sharesSold: result.sharesSold
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

  const { symbol, companyName, shares } = req.body;

  if (!symbol || !companyName || !shares) {
    throw new ValidationError('Symbol, company name, and shares are required');
  }

  const sharesNum = parseInt(shares);
  if (isNaN(sharesNum) || sharesNum <= 0) {
    throw new ValidationError('Invalid number of shares');
  }

  // Check if tournament is completed (no trading allowed)
  const tournament = await storage.getTournamentById(tournamentId);
  if (tournament && tournament.status === 'completed') {
    throw new ValidationError('Cannot trade in completed tournaments');
  }

  // Check if market is open for stock tournaments (blitz bypasses market hours)
  if (tournament && tournament.tournamentType !== 'crypto' && tournament.tournamentType !== 'blitz') {
    const { isMarketOpen } = await import('../../shared/marketHours');
    if (!isMarketOpen()) {
      throw new ValidationError('Stock market is closed. Trading is available Mon-Fri 9:30 AM - 4:00 PM ET.');
    }
  }

  // SECURITY: Never trust a client-supplied price. Fetch the authoritative
  // price server-side so a manipulated request cannot buy below market.
  const cleanSymbol = sanitizeInput(symbol).toUpperCase();
  let executionPrice: number;
  try {
    const quote = await getStockQuote(cleanSymbol);
    executionPrice = Math.round(Number(quote.price) * 100) / 100;
  } catch (err: any) {
    throw new ValidationError(`Unable to fetch a current price for ${cleanSymbol}. Please try again.`);
  }
  if (!isFinite(executionPrice) || executionPrice <= 0) {
    throw new ValidationError('Received an invalid market price. Please try again.');
  }

  const totalCost = Math.round(sharesNum * executionPrice * 100) / 100;

  // Execute the buy atomically (balance check + debit + holding + trade record).
  let result;
  try {
    result = await storage.executeTournamentBuy({
      tournamentId,
      userId,
      symbol: cleanSymbol,
      companyName: sanitizeInput(companyName),
      shares: sharesNum,
      price: executionPrice,
      totalCost,
    });
  } catch (err: any) {
    if (err?.message === 'INSUFFICIENT_BALANCE') {
      throw new ValidationError('Insufficient balance for this purchase');
    }
    if (err?.message === 'NOT_A_PARTICIPANT') {
      throw new ValidationError('You are not a participant in this tournament');
    }
    throw err;
  }

  // Award First Trade achievement (non-critical, outside the money transaction)
  await storage.awardAchievement({
    userId: userId,
    achievementType: 'first_trade',
    achievementTier: 'common',
    achievementName: 'First Trade',
    achievementDescription: 'Made your first trade'
  });

  res.status(201).json({
    success: true,
    data: { purchase: result.purchase, newBalance: result.newBalance },
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
    const tradingStreak = await storage.getUserTradingStreak(user.id);

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
    .filter(t => t.buyInAmount && parseFloat(t.buyInAmount) > 0)
    .sort((a, b) => parseFloat(b.buyInAmount) - parseFloat(a.buyInAmount))
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
 * GET /api/leaderboard/most-active
 * Get leaderboard by total trade count
 */
router.get('/leaderboard/most-active', requireAuth, asyncHandler(async (req, res) => {
  const allUsers = await storage.getAllUsers();

  const rankings = allUsers
    .filter(u => (u.totalTrades || 0) > 0)
    .sort((a, b) => (b.totalTrades || 0) - (a.totalTrades || 0))
    .slice(0, 50)
    .map(u => ({
      userId: u.id,
      username: u.username,
      totalTrades: u.totalTrades || 0,
    }));

  res.json({
    success: true,
    data: {
      rankings
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

  const trimmedUsername = username?.trim();
  if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters' });
  }

  if (!/^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(trimmedUsername)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and at most one underscore' });
  }

  if (containsProfanity(trimmedUsername)) {
    return res.status(400).json({ error: 'Username contains inappropriate language' });
  }

  await storage.updateUserUsername(targetUserId, trimmedUsername);
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
 * PATCH /api/admin/users/:userId/unban
 * Unban a user (admin only)
 */
router.patch('/admin/users/:userId/unban', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);

  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await storage.unbanUser(targetUserId);
  await storage.createAdminLog({
    adminUserId: userId,
    targetUserId,
    action: 'user_unbanned',
    oldValue: 'banned',
    newValue: 'unbanned',
    notes: `Admin unbanned user ${targetUserId}`
  });
  res.json({ success: true, message: 'User unbanned successfully' });
}));

/**
 * PATCH /api/admin/users/:userId/freeze-withdrawal
 * Toggle withdrawal freeze (admin only)
 */
router.patch('/admin/users/:userId/freeze-withdrawal', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { frozen } = req.body;

  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await storage.toggleWithdrawalFrozen(targetUserId, frozen);
  await storage.createAdminLog({
    adminUserId: userId,
    targetUserId,
    action: 'withdrawal_freeze_toggle',
    oldValue: (!frozen).toString(),
    newValue: frozen.toString(),
    notes: `Admin ${frozen ? 'froze' : 'unfroze'} withdrawals for user ${targetUserId}`
  });
  res.json({ success: true, message: `Withdrawals ${frozen ? 'frozen' : 'unfrozen'} successfully` });
}));

/**
 * PATCH /api/admin/users/:userId/freeze-deposit
 * Toggle deposit freeze (admin only)
 */
router.patch('/admin/users/:userId/freeze-deposit', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { frozen } = req.body;

  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await storage.toggleDepositFrozen(targetUserId, frozen);
  await storage.createAdminLog({
    adminUserId: userId,
    targetUserId,
    action: 'deposit_freeze_toggle',
    oldValue: (!frozen).toString(),
    newValue: frozen.toString(),
    notes: `Admin ${frozen ? 'froze' : 'unfroze'} deposits for user ${targetUserId}`
  });
  res.json({ success: true, message: `Deposits ${frozen ? 'frozen' : 'unfrozen'} successfully` });
}));

/**
 * PATCH /api/admin/users/:userId/restrict-tournament
 * Toggle tournament restriction (admin only)
 */
router.patch('/admin/users/:userId/restrict-tournament', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { restricted } = req.body;

  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await storage.toggleTournamentRestricted(targetUserId, restricted);
  await storage.createAdminLog({
    adminUserId: userId,
    targetUserId,
    action: 'tournament_restriction_toggle',
    oldValue: (!restricted).toString(),
    newValue: restricted.toString(),
    notes: `Admin ${restricted ? 'restricted' : 'unrestricted'} tournament access for user ${targetUserId}`
  });
  res.json({ success: true, message: `Tournament access ${restricted ? 'restricted' : 'restored'} successfully` });
}));

/**
 * GET /api/admin/stats
 * Get aggregated site diagnostics (admin only)
 */
router.get('/admin/stats', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const stats = await storage.getAdminStats();
  res.json({ success: true, data: stats });
}));

/**
 * GET /api/admin/tournaments
 * Get all tournaments for admin management
 */
router.get('/admin/tournaments', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if user is admin (using subscription tier or username)
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
      const createdAt = new Date(tournament.createdAt ?? Date.now());

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
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
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
 * GET /api/users/public/:userId
 * Get specific user's public profile information
 */
router.get('/users/public/:userId', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID'
    });
  }

  const user = await storage.getUser(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get additional stats
  const achievements = await storage.getUserAchievements(user.id);
  const achievementCount = achievements.length;
  const tournamentCount = await storage.getUserTournamentCount(user.id);
  const tradingStreak = await storage.getUserTradingStreak(user.id);

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
      totalTrades: user.totalTrades || 0,
      achievementCount,
      tournamentCount,
      tradingStreak,
      lastActivity: user.lastActivity,
    }
  });
}));

/**
 * GET /api/users/public
 * Get all users with public profile information
 */
router.get('/users/public', asyncHandler(async (req, res) => {

  // Get all users with only public information
  const users = await storage.getAllUsers();

  // If no users found, return empty array
  if (!users || users.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }

  const publicUsers = await Promise.all(users.map(async (user) => {
    try {
      // Get achievement count (this will automatically ensure Welcome achievement exists)
      const achievements = await storage.getUserAchievements(user.id);
      const achievementCount = achievements.length;
      const tournamentCount = await storage.getUserTournamentCount(user.id);
      const tradingStreak = await storage.getUserTradingStreak(user.id);

      return {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
        totalTrades: user.totalTrades || 0,
        achievementCount: achievementCount,
        tournamentCount,
        tradingStreak,
        lastActivity: user.lastActivity,
      };
    } catch (error) {
      console.error(`Failed to fetch data for user ${user.id}:`, error);
      return {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
        totalTrades: user.totalTrades || 0,
        achievementCount: 0,
        tournamentCount: 0,
        tradingStreak: 0,
        lastActivity: user.lastActivity,
      };
    }
  }));

  res.json({
    success: true,
    data: publicUsers
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
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
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

  // Return updated user data
  const updatedUser = await storage.getUser(userId);

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    user: updatedUser
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

  const censoredMessage = censorProfanity(message.trim());

  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: censoredMessage,
    tournamentId: null
  });

  // Detect mentions in the format @username (supports alphanumeric and underscores)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = Array.from(censoredMessage.matchAll(mentionRegex), m => m[1]);

  // Create notifications for mentioned users
  if (mentions.length > 0) {
    const uniqueMentions = [...new Set(mentions)];
    await Promise.all(
      uniqueMentions.map(async (mentionedUsername) => {
        const mentionedUser = await storage.getUserByUsername(mentionedUsername);
        if (mentionedUser && mentionedUser.id !== userId) {
          await storage.createNotification({
            userId: mentionedUser.id,
            type: 'chat_mention',
            title: 'You were mentioned',
            message: `${user.username} mentioned you in global chat`,
            metadata: {
              messageId: chatMessage.id,
              chatType: 'global',
              tournamentId: null,
              mentionedBy: userId,
              mentionedByUsername: user.username,
              mentionerUsername: user.username,
              mentionerId: userId
            }
          });
        }
      })
    );
  }

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
 * GET /api/chat/tournament/:tournamentId/message/:messageId/context
 * Get messages around a specific message (for mention notifications)
 */
router.get('/chat/tournament/:tournamentId/message/:messageId/context', requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.tournamentId);
  const messageId = parseInt(req.params.messageId);

  if (isNaN(tournamentId) || isNaN(messageId)) {
    throw new ValidationError('Invalid tournament or message ID');
  }

  const allMessages = await storage.getChatMessages(tournamentId);
  const messageIndex = allMessages.findIndex((msg: any) => msg.id === messageId);

  if (messageIndex === -1) {
    throw new NotFoundError('Message not found');
  }

  // Get 10 messages before and 10 after
  const startIndex = Math.max(0, messageIndex - 10);
  const endIndex = Math.min(allMessages.length, messageIndex + 11);
  const contextMessages = allMessages.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      messages: contextMessages,
      highlightId: messageId
    }
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

  const censoredMessage = censorProfanity(message.trim());

  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: censoredMessage,
    tournamentId
  });

  // Detect mentions in the format @username (supports alphanumeric and underscores)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = Array.from(censoredMessage.matchAll(mentionRegex), m => m[1]);

  // Create notifications for mentioned users
  if (mentions.length > 0) {
    const tournament = await storage.getTournamentById(tournamentId);
    const uniqueMentions = [...new Set(mentions)];
    await Promise.all(
      uniqueMentions.map(async (mentionedUsername) => {
        const mentionedUser = await storage.getUserByUsername(mentionedUsername);
        if (mentionedUser && mentionedUser.id !== userId) {
          await storage.createNotification({
            userId: mentionedUser.id,
            type: 'chat_mention',
            title: 'You were mentioned',
            message: `${user.username} mentioned you in ${tournament?.name || 'tournament chat'}`,
            metadata: {
              messageId: chatMessage.id,
              chatType: 'tournament',
              tournamentId,
              mentionedBy: userId,
              mentionedByUsername: user.username,
              mentionerUsername: user.username,
              mentionerId: userId
            }
          });
        }
      })
    );
  }

  res.json({
    success: true,
    data: chatMessage
  });
}));

/**
 * GET /api/chat/context/:messageId
 * Get chat message with surrounding context
 */
router.get('/chat/context/:messageId', requireAuth, asyncHandler(async (req, res) => {
  const messageId = parseInt(req.params.messageId);
  const before = parseInt(req.query.before as string) || 10;
  const after = parseInt(req.query.after as string) || 10;

  if (isNaN(messageId)) {
    throw new ValidationError('Invalid message ID');
  }

  const targetMessage = await storage.getChatMessageById(messageId);
  if (!targetMessage) {
    throw new NotFoundError('Message not found');
  }

  const context = await storage.getChatMessagesContext(messageId, before, after);

  res.json({
    success: true,
    data: {
      targetMessage,
      messagesBefore: context.messagesBefore,
      messagesAfter: context.messagesAfter
    }
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

/**
 * POST /api/tips
 * Send a tip to another user
 */
router.post('/tips', requireAuth, asyncHandler(async (req, res) => {
  const senderId = req.user.id;
  const { recipientId, amount } = req.body;

  if (!recipientId || !amount) {
    throw new ValidationError('Recipient ID and amount are required');
  }

  const tipAmount = parseFloat(amount);
  if (isNaN(tipAmount) || tipAmount <= 0) {
    throw new ValidationError('Invalid tip amount');
  }

  // Get sender's balance
  const sender = await storage.getUserById(senderId);
  if (!sender) {
    throw new NotFoundError('Sender not found');
  }

  const senderBalance = parseFloat(sender.siteCash);
  if (senderBalance < tipAmount) {
    throw new ValidationError('Insufficient balance');
  }

  // Get recipient
  const recipient = await storage.getUserById(recipientId);
  if (!recipient) {
    throw new NotFoundError('Recipient not found');
  }

  // Prevent tipping yourself
  if (senderId === recipientId) {
    throw new ValidationError('You cannot tip yourself');
  }

  // Perform the transfer
  await storage.transferBalance(senderId, recipientId, tipAmount);

  res.json({
    success: true,
    message: `Successfully sent ${tipAmount} to ${recipient.username}`
  });
}));

// ============ Friend System Endpoints ============

/**
 * POST /api/friends/request
 * Send a friend request
 */
router.post('/friends/request', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addresseeId } = req.body;

  if (!addresseeId) {
    throw new ValidationError('Addressee ID is required');
  }

  const friendship = await storage.sendFriendRequest(userId, parseInt(addresseeId));
  res.json({ success: true, data: friendship });
}));

/**
 * POST /api/friends/:id/accept
 * Accept a friend request
 */
router.post('/friends/:id/accept', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const friendshipId = parseInt(req.params.id);

  if (isNaN(friendshipId)) {
    throw new ValidationError('Invalid friendship ID');
  }

  const friendship = await storage.acceptFriendRequest(friendshipId, userId);
  res.json({ success: true, data: friendship });
}));

/**
 * POST /api/friends/:id/decline
 * Decline a friend request
 */
router.post('/friends/:id/decline', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const friendshipId = parseInt(req.params.id);

  if (isNaN(friendshipId)) {
    throw new ValidationError('Invalid friendship ID');
  }

  const friendship = await storage.declineFriendRequest(friendshipId, userId);
  res.json({ success: true, data: friendship });
}));

/**
 * DELETE /api/friends/:id
 * Remove a friend or cancel a friend request
 */
router.delete('/friends/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const friendshipId = parseInt(req.params.id);

  if (isNaN(friendshipId)) {
    throw new ValidationError('Invalid friendship ID');
  }

  await storage.removeFriend(friendshipId, userId);
  res.json({ success: true, message: 'Friend removed successfully' });
}));

/**
 * GET /api/friends
 * Get accepted friends list
 */
router.get('/friends', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const friends = await storage.getFriends(userId);
  res.json({ success: true, data: friends });
}));

/**
 * GET /api/friends/pending
 * Get incoming pending friend requests
 */
router.get('/friends/pending', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const requests = await storage.getPendingFriendRequests(userId);
  res.json({ success: true, data: requests });
}));

/**
 * GET /api/friends/sent
 * Get outgoing sent friend requests
 */
router.get('/friends/sent', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const requests = await storage.getSentFriendRequests(userId);
  res.json({ success: true, data: requests });
}));

/**
 * GET /api/friends/status/:userId
 * Get friendship status with a specific user
 */
router.get('/friends/status/:userId', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);

  if (isNaN(targetUserId)) {
    throw new ValidationError('Invalid user ID');
  }

  const friendship = await storage.getFriendship(userId, targetUserId);

  if (!friendship) {
    return res.json({ success: true, data: { status: 'none' } });
  }

  if (friendship.status === 'accepted') {
    return res.json({ success: true, data: { status: 'accepted', friendshipId: friendship.id } });
  }

  if (friendship.status === 'pending') {
    if (friendship.requesterId === userId) {
      return res.json({ success: true, data: { status: 'pending_sent', friendshipId: friendship.id } });
    }
    return res.json({ success: true, data: { status: 'pending_received', friendshipId: friendship.id } });
  }

  return res.json({ success: true, data: { status: 'none' } });
}));

/**
 * GET /api/tournaments/:id/results
 * Get tournament results (final standings and payouts)
 */
router.get('/tournaments/:id/results', asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);

  if (isNaN(tournamentId)) {
    throw new ValidationError('Invalid tournament ID');
  }

  const results = await storage.getTournamentResults(tournamentId);
  const tournament = await storage.getTournamentById(tournamentId);

  if (!tournament) {
    throw new ValidationError('Tournament not found');
  }

  // Fetch usernames for each result
  const enrichedResults = await Promise.all(
    results.map(async (result) => {
      const user = await storage.getUser(result.userId);
      return {
        ...result,
        username: user?.username || `User ${result.userId}`,
        finalBalance: parseFloat(result.portfolioValue?.toString() || '0'),
        profit: parseFloat(result.portfolioValue?.toString() || '0') - parseFloat(tournament.startingBalance?.toString() || '10000'),
      };
    })
  );

  // Extract top 3
  const topThree = enrichedResults.slice(0, 3);
  const winner = topThree[0];

  res.json({
    success: true,
    data: {
      winner: winner || {
        username: "Unknown",
        finalBalance: 0,
        profit: 0,
        rank: 1,
      },
      topThree,
      totalParticipants: enrichedResults.length,
      allResults: enrichedResults,
    },
  });
}));

/**
 * GET /api/admin/promo-codes
 * Get all promo codes (admin only)
 */
router.get('/admin/promo-codes', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const codes = await storage.getAllPromoCodes();
  res.json({ success: true, data: codes });
}));

/**
 * POST /api/admin/promo-codes
 * Create a new promo code (admin only)
 */
router.post('/admin/promo-codes', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { code, rewardAmount, usageType, maxUses, expiresAt } = req.body;

  if (!code || !rewardAmount || !usageType) {
    throw new ValidationError('Code, reward amount, and usage type are required');
  }

  const promoCode = await storage.createPromoCode({
    code: code.trim().toUpperCase(),
    rewardType: 'sitecash',
    rewardAmount: parseFloat(rewardAmount).toString(),
    usageType,
    maxUses: maxUses ? parseInt(maxUses) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isActive: true,
    createdBy: userId,
  });

  res.json({ success: true, data: promoCode });
}));

/**
 * PATCH /api/admin/promo-codes/:id
 * Update a promo code (admin only)
 */
router.patch('/admin/promo-codes/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const codeId = parseInt(req.params.id);
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (isNaN(codeId)) {
    throw new ValidationError('Invalid promo code ID');
  }

  const updates: any = {};
  if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
  if (req.body.maxUses !== undefined) updates.maxUses = req.body.maxUses;
  if (req.body.expiresAt !== undefined) updates.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
  if (req.body.rewardAmount !== undefined) updates.rewardAmount = parseFloat(req.body.rewardAmount).toString();

  const updated = await storage.updatePromoCode(codeId, updates);
  res.json({ success: true, data: updated });
}));

/**
 * DELETE /api/admin/promo-codes/:id
 * Delete a promo code (admin only)
 */
router.delete('/admin/promo-codes/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const codeId = parseInt(req.params.id);
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (isNaN(codeId)) {
    throw new ValidationError('Invalid promo code ID');
  }

  await storage.deletePromoCode(codeId);
  res.json({ success: true, message: 'Promo code deleted' });
}));

/**
 * POST /api/admin/promo-codes/seed
 * Seed the legacy hardcoded codes into DB (admin only, idempotent)
 */
router.post('/admin/promo-codes/seed', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const legacyCodes = [
    { code: 'WELCOME500', rewardAmount: '500.00' },
    { code: 'STARTER1000', rewardAmount: '1000.00' },
    { code: 'BIGBOOST2500', rewardAmount: '2500.00' },
    { code: 'MEGABOOST5000', rewardAmount: '5000.00' },
    { code: 'FREEMONEY', rewardAmount: '100.00' },
  ];

  let created = 0;
  let skipped = 0;

  for (const legacy of legacyCodes) {
    const existing = await storage.getPromoCode(legacy.code);
    if (existing) {
      skipped++;
      continue;
    }

    await storage.createPromoCode({
      code: legacy.code,
      rewardType: 'sitecash',
      rewardAmount: legacy.rewardAmount,
      usageType: 'once_per_user',
      maxUses: null,
      expiresAt: null,
      isActive: true,
      createdBy: userId,
    });
    created++;
  }

  res.json({ success: true, message: `Seeded ${created} codes, skipped ${skipped} existing` });
}));

export default router;
