import { storage } from "../storage";
import { getStockQuote } from "./yahooFinance";

interface TournamentResult {
  userId: number;
  finalBalance: number;
  totalValue: number;
  rank: number;
  firstName: string;
  lastName: string;
}

export class TournamentExpirationService {
  /**
   * Check for expired tournaments and process them
   */
  async processExpiredTournaments(): Promise<void> {
    // First, start any waiting tournaments that should be active
    await this.startWaitingTournaments();
    
    // Then process expired tournaments
    const expiredTournaments = await storage.getExpiredTournaments();
    
    for (const tournament of expiredTournaments) {
      console.log(`Processing expired tournament: ${tournament.name} (ID: ${tournament.id})`);
      
      // Calculate final standings
      const results = await this.calculateFinalStandings(tournament.id);
      
      // Award achievements based on results
      await this.awardTournamentAchievements(tournament.id, results);
      
      // Mark tournament as completed
      await storage.updateTournamentStatus(tournament.id, 'completed', new Date());
      
      console.log(`Tournament ${tournament.name} completed successfully`);
    }
  }

  /**
   * Start waiting tournaments that should be active
   */
  private async startWaitingTournaments(): Promise<void> {
    const waitingTournaments = await storage.getWaitingTournaments();
    console.log(`Found ${waitingTournaments.length} waiting tournaments`);
    
    for (const tournament of waitingTournaments) {
      // For now, start tournaments immediately when they're created
      // You could add logic here to start based on time, player count, etc.
      console.log(`Starting tournament: ${tournament.name} (ID: ${tournament.id})`);
      await storage.updateTournamentStatus(tournament.id, 'active', new Date());
    }
  }

  /**
   * Calculate final standings for a tournament
   */
  private async calculateFinalStandings(tournamentId: number): Promise<TournamentResult[]> {
    const participants = await storage.getTournamentParticipants(tournamentId);
    const results: TournamentResult[] = [];

    for (const participant of participants) {
      const purchases = await storage.getTournamentStockPurchases(tournamentId, participant.userId);
      
      let totalValue = participant.balance;
      
      // Calculate current value of all holdings
      for (const purchase of purchases) {
        try {
          const currentQuote = await getStockQuote(purchase.symbol);
          const currentValue = purchase.shares * currentQuote.price;
          totalValue += currentValue;
        } catch (error) {
          console.error(`Error fetching quote for ${purchase.symbol}:`, error);
          // Use purchase price as fallback
          totalValue += purchase.shares * purchase.purchasePrice;
        }
      }

      results.push({
        userId: participant.userId,
        finalBalance: participant.balance,
        totalValue,
        rank: 0, // Will be set after sorting
        firstName: participant.firstName,
        lastName: participant.lastName
      });
    }

    // Sort by total value (descending) and assign ranks
    results.sort((a, b) => b.totalValue - a.totalValue);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  }

  /**
   * Award achievements based on tournament results
   */
  private async awardTournamentAchievements(tournamentId: number, results: TournamentResult[]): Promise<void> {
    for (const result of results) {
      const { userId, rank, totalValue } = result;
      
      // Award based on rank
      if (rank === 1) {
        // Award Tournament Champion as global achievement (can only be earned once)
        await this.awardGlobalAchievement(userId, {
          type: 'tournament_winner',
          tier: 'legendary',
          name: 'Tournament Champion',
          description: 'Won 1st place in a tournament'
        });
      } else if (rank === 2) {
        await this.awardAchievement(userId, tournamentId, {
          type: 'tournament_second',
          tier: 'epic',
          name: 'Silver Medalist',
          description: 'Finished 2nd in a tournament'
        });
      } else if (rank === 3) {
        await this.awardAchievement(userId, tournamentId, {
          type: 'tournament_third',
          tier: 'rare',
          name: 'Bronze Medalist',
          description: 'Finished 3rd in a tournament'
        });
      } else if (rank <= 5) {
        await this.awardAchievement(userId, tournamentId, {
          type: 'tournament_top5',
          tier: 'uncommon',
          name: 'Top 5 Finisher',
          description: 'Finished in the top 5 of a tournament'
        });
      }

      // Award based on performance (tournament-specific)
      if (totalValue >= 15000) {
        await this.awardAchievement(userId, tournamentId, {
          type: 'high_performer',
          tier: 'epic',
          name: 'High Performer',
          description: 'Achieved over 50% profit in a tournament'
        });
      } else if (totalValue >= 12000) {
        await this.awardAchievement(userId, tournamentId, {
          type: 'profit_maker',
          tier: 'rare',
          name: 'Profit Maker',
          description: 'Achieved over 20% profit in a tournament'
        });
      }

      // Check for Tournament Legend achievement (global - 10 tournament wins)
      if (rank === 1) {
        const winCount = await this.getTournamentWinCount(userId);
        if (winCount >= 10) {
          await this.awardGlobalAchievement(userId, {
            type: 'tournament_legend',
            tier: 'mythic',
            name: 'Tournament Legend',
            description: 'Won 10 tournaments'
          });
        }
      }

      // Participation achievement is awarded when joining tournaments, not at expiration
    }
  }

  /**
   * Award an achievement to a user for a tournament
   */
  private async awardAchievement(
    userId: number, 
    tournamentId: number, 
    achievement: {
      type: string;
      tier: string;
      name: string;
      description: string;
    }
  ): Promise<void> {
    await storage.awardAchievement({
      userId,
      tournamentId,
      achievementType: achievement.type,
      achievementTier: achievement.tier,
      achievementName: achievement.name,
      achievementDescription: achievement.description
    });
    
    console.log(`Awarded ${achievement.name} to user ${userId} for tournament ${tournamentId}`);
  }

  /**
   * Award a global achievement to a user (not tournament-specific)
   */
  private async awardGlobalAchievement(
    userId: number, 
    achievement: {
      type: string;
      tier: string;
      name: string;
      description: string;
    }
  ): Promise<void> {
    await storage.awardAchievement({
      userId,
      achievementType: achievement.type,
      achievementTier: achievement.tier,
      achievementName: achievement.name,
      achievementDescription: achievement.description
    });
    
    console.log(`Awarded global ${achievement.name} to user ${userId}`);
  }

  /**
   * Get the number of tournament wins for a user
   */
  private async getTournamentWinCount(userId: number): Promise<number> {
    const completedTournaments = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        status: tournaments.status,
        endedAt: tournaments.endedAt
      })
      .from(tournaments)
      .where(eq(tournaments.status, 'completed'));

    let winCount = 0;
    
    for (const tournament of completedTournaments) {
      // Get tournament results for this tournament
      const results = await this.getTournamentResults(tournament.id);
      
      // Check if this user won (rank 1)
      const userResult = results.find(r => r.userId === userId);
      if (userResult && userResult.rank === 1) {
        winCount++;
      }
    }
    
    return winCount;
  }

  /**
   * Check if a tournament has expired
   */
  async isTournamentExpired(tournamentId: number): Promise<boolean> {
    const tournament = await storage.getTournamentByCode(''); // We need to get by ID, not code
    if (!tournament) return false;
    
    const createdAt = new Date(tournament.createdAt);
    const timeframeDays = this.parseTimeframe(tournament.timeframe);
    const expirationDate = new Date(createdAt.getTime() + timeframeDays * 24 * 60 * 60 * 1000);
    
    return new Date() > expirationDate;
  }

  /**
   * Parse timeframe string to days
   */
  private parseTimeframe(timeframe: string): number {
    const match = timeframe.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
    if (!match) return 28; // Default to 4 weeks
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'day':
      case 'days':
        return value;
      case 'week':
      case 'weeks':
        return value * 7;
      case 'month':
      case 'months':
        return value * 30;
      default:
        return 28;
    }
  }
}

export const tournamentExpirationService = new TournamentExpirationService();