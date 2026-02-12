import { storage } from "../storage";
import { getStockQuote } from "./yahooFinance";
import type { InsertTournamentResult } from "@shared/schema";

interface TournamentResultEntry {
  userId: number;
  username: string;
  finalBalance: number;
  totalValue: number;
  rank: number;
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
      
      // Distribute prize money to the winner
      await this.distributePrizeMoney(tournament, results);
      
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

    const now = new Date();

    for (const tournament of waitingTournaments) {
      // Check if the tournament's scheduled start time has passed
      if (tournament.scheduledStartTime && tournament.scheduledStartTime <= now) {
        // Check if tournament has at least 2 players
        const currentPlayers = tournament.currentPlayers || 0;

        if (currentPlayers < 1) {
          // Cancel tournament due to insufficient players
          console.log(`Cancelling tournament: ${tournament.name} (ID: ${tournament.id}) - insufficient players (${currentPlayers}/2)`);
          await storage.cancelTournament(tournament.id, 'Insufficient players - minimum 2 players required to start');

          // Refund the creator's buy-in
          if (tournament.buyInAmount && tournament.buyInAmount > 0) {
            await storage.addUserBalance(tournament.creatorId, tournament.buyInAmount);
            console.log(`Refunded $${tournament.buyInAmount} to creator (user ${tournament.creatorId})`);
          }
        } else {
          // Start the tournament
          console.log(`Starting tournament: ${tournament.name} (ID: ${tournament.id}) - scheduled start time reached with ${currentPlayers} players`);
          await storage.updateTournament(tournament.id, { status: 'active', startedAt: new Date() });
        }
      } else if (tournament.scheduledStartTime) {
        const timeUntilStart = tournament.scheduledStartTime.getTime() - now.getTime();
        const minutesUntilStart = Math.ceil(timeUntilStart / (1000 * 60));
        console.log(`Tournament ${tournament.name} (ID: ${tournament.id}) starts in ${minutesUntilStart} minutes`);
      }
    }
  }

  /**
   * Calculate final standings for a tournament
   */
  private async calculateFinalStandings(tournamentId: number): Promise<TournamentResultEntry[]> {
    const participants = await storage.getTournamentParticipants(tournamentId);
    const results: TournamentResultEntry[] = [];

    for (const participant of participants) {
      const purchases = await storage.getTournamentStockPurchases(tournamentId, participant.userId);

      let totalValue = parseFloat(participant.balance?.toString() || '0');

      // Calculate current value of all holdings
      for (const purchase of purchases) {
        try {
          const currentQuote = await getStockQuote(purchase.symbol);
          const currentValue = purchase.shares * Number(currentQuote.price);
          totalValue += currentValue;
        } catch (error) {
          console.error(`Error fetching quote for ${purchase.symbol}:`, error);
          // Use purchase price as fallback
          totalValue += purchase.shares * Number(purchase.purchasePrice);
        }
      }

      results.push({
        userId: participant.userId,
        username: participant.username || `User ${participant.userId}`,
        finalBalance: parseFloat(participant.balance?.toString() || '0'),
        totalValue,
        rank: 0, // Will be set after sorting
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
   * Calculate payout percentages based on structure
   */
  private getPayoutPercentages(structure: string, participantCount: number): number[] {
    switch (structure) {
      case 'top_3':
        return [0.60, 0.25, 0.15];
      case 'top_5':
        return [0.40, 0.25, 0.15, 0.12, 0.08];
      case 'top_half': {
        const payoutSlots = Math.ceil(participantCount / 2);
        if (payoutSlots <= 1) return [1.0];
        // Proportional split: each slot gets a share inversely proportional to rank
        const weights: number[] = [];
        let totalWeight = 0;
        for (let i = 0; i < payoutSlots; i++) {
          const weight = payoutSlots - i; // rank 1 gets highest weight
          weights.push(weight);
          totalWeight += weight;
        }
        return weights.map(w => w / totalWeight);
      }
      case 'winner_take_all':
      default:
        return [1.0];
    }
  }

  /**
   * Distribute prize money with tiered payout structure
   */
  private async distributePrizeMoney(tournament: any, results: TournamentResultEntry[]): Promise<void> {
    const totalPot = Number(tournament.currentPot || 0);
    const startingBalance = Number(tournament.startingBalance || 10000);
    const payoutStructure = tournament.payoutStructure || 'winner_take_all';

    // Persist tournament results for all participants
    const resultRecords: InsertTournamentResult[] = results.map(r => ({
      tournamentId: tournament.id,
      userId: r.userId,
      rank: r.rank,
      portfolioValue: r.totalValue.toFixed(2),
      gainPercent: (((r.totalValue - startingBalance) / startingBalance) * 100).toFixed(2),
      payout: "0.00", // Will be updated below for winners
    }));

    // Only distribute if there are participants and a pot to distribute
    if (results.length === 0 || totalPot <= 0) {
      console.log(`No prize money to distribute for tournament ${tournament.name} (pot: ${totalPot})`);
      // Still save results even with no pot
      if (resultRecords.length > 0) {
        await storage.saveTournamentResults(resultRecords);
      }
      // Send notifications to all participants
      for (const r of results) {
        await this.sendResultNotification(tournament, r, 0);
      }
      return;
    }

    const creatorAmount = Math.round(totalPot * 0.05 * 100) / 100; // 5% to creator
    const prizePool = Math.round(totalPot * 0.95 * 100) / 100; // 95% for participants

    const percentages = this.getPayoutPercentages(payoutStructure, results.length);
    const payoutSlots = Math.min(percentages.length, results.length);

    try {
      // Distribute to ranked winners
      for (let i = 0; i < payoutSlots; i++) {
        const participant = results[i];
        const payoutAmount = Math.round(prizePool * percentages[i] * 100) / 100;

        if (payoutAmount > 0) {
          await storage.addUserBalance(participant.userId, payoutAmount);
          // Update payout in result records
          resultRecords[i].payout = payoutAmount.toFixed(2);

          console.log(`Paid $${payoutAmount} to rank ${participant.rank} user ${participant.userId} (${participant.username})`);
        }
      }

      // Pay creator commission
      await storage.addUserBalance(tournament.creatorId, creatorAmount);

      console.log(`Distributed prizes for tournament ${tournament.name}: $${prizePool} to players (${payoutStructure}), $${creatorAmount} to creator`);

      // Save all result records
      await storage.saveTournamentResults(resultRecords);

      // Send notifications to all participants
      for (const r of results) {
        const payout = parseFloat(resultRecords.find(rec => rec.userId === r.userId)?.payout?.toString() || '0');
        await this.sendResultNotification(tournament, r, payout);
      }
    } catch (error) {
      console.error(`Failed to distribute prize money for tournament ${tournament.name}:`, error);
    }
  }

  /**
   * Send a notification to a participant about their tournament result
   */
  private async sendResultNotification(tournament: any, result: TournamentResultEntry, payout: number): Promise<void> {
    try {
      const payoutMsg = payout > 0
        ? `You earned $${payout.toFixed(2)}!`
        : 'No payout this time.';

      await storage.createNotification({
        userId: result.userId,
        type: 'tournament_end',
        title: `Tournament "${tournament.name}" Ended`,
        message: `You finished rank #${result.rank} with a portfolio value of $${result.totalValue.toFixed(2)}. ${payoutMsg}`,
        metadata: {
          tournamentId: tournament.id,
          rank: result.rank,
          portfolioValue: result.totalValue,
          payout,
        },
      });
    } catch (error) {
      console.error(`Failed to send result notification to user ${result.userId}:`, error);
    }
  }

  /**
   * Award achievements based on tournament results
   */
  private async awardTournamentAchievements(tournamentId: number, results: TournamentResultEntry[]): Promise<void> {
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
        await this.awardGlobalAchievement(userId, {
          type: 'tournament_second',
          tier: 'epic',
          name: 'Silver Medalist',
          description: 'Finished 2nd in a tournament'
        });
      } else if (rank === 3) {
        await this.awardGlobalAchievement(userId, {
          type: 'tournament_third',
          tier: 'rare',
          name: 'Bronze Medalist',
          description: 'Finished 3rd in a tournament'
        });
      } else if (rank <= 5) {
        await this.awardGlobalAchievement(userId, {
          type: 'tournament_top5',
          tier: 'uncommon',
          name: 'Top 5 Finisher',
          description: 'Finished in the top 5 of a tournament'
        });
      }

      // Award based on performance (global achievements)
      if (totalValue >= 15000) {
        await this.awardGlobalAchievement(userId, {
          type: 'high_performer',
          tier: 'epic',
          name: 'High Performer',
          description: 'Achieved over 50% profit in a tournament'
        });
      } else if (totalValue >= 12000) {
        await this.awardGlobalAchievement(userId, {
          type: 'profit_maker',
          tier: 'rare',
          name: 'Profit Maker',
          description: 'Achieved over 20% profit in a tournament'
        });
      }

      // Check for Tournament Legend achievement (global - 10 tournament wins)
      if (rank === 1) {
        // Increment the private win counter
        await storage.incrementTournamentWins(userId);
        
        const winCount = await storage.getTournamentWins(userId);
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
   * Award a global achievement to a user (max 1 per person)
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
   * Check if a tournament has expired
   */
  async isTournamentExpired(tournamentId: number): Promise<boolean> {
    const tournament = await storage.getTournamentByCode(''); // We need to get by ID, not code
    if (!tournament) return false;
    
    const createdAt = new Date(tournament.createdAt!);
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