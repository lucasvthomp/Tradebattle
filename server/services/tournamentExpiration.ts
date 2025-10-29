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
        console.log(`Starting tournament: ${tournament.name} (ID: ${tournament.id}) - scheduled start time reached`);
        await storage.updateTournamentStatus(tournament.id, 'active', new Date());
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
   * Distribute prize money to the tournament winner and creator
   */
  private async distributePrizeMoney(tournament: any, results: TournamentResult[]): Promise<void> {
    // Only distribute if there are participants and a pot to distribute
    if (results.length === 0 || !tournament.currentPot || Number(tournament.currentPot) <= 0) {
      console.log(`No prize money to distribute for tournament ${tournament.name} (pot: ${tournament.currentPot})`);
      return;
    }

    const winner = results.find(result => result.rank === 1);
    if (!winner) {
      console.log(`No winner found for tournament ${tournament.name}`);
      return;
    }

    const totalPot = Number(tournament.currentPot);
    const winnerAmount = Math.round(totalPot * 0.95 * 100) / 100; // 95% to winner, rounded to nearest cent
    const creatorAmount = Math.round(totalPot * 0.05 * 100) / 100; // 5% to creator, rounded to nearest cent
    
    try {
      // Add 95% of the tournament pot to the winner's siteCash
      await storage.addUserBalance(winner.userId, winnerAmount);
      
      // Add 5% of the tournament pot to the creator's siteCash
      await storage.addUserBalance(tournament.creatorId, creatorAmount);
      
      console.log(`Distributed $${winnerAmount} (95%) to winner user ${winner.userId} (${winner.firstName} ${winner.lastName}) and $${creatorAmount} (5%) to creator user ${tournament.creatorId} for tournament ${tournament.name}`);
    } catch (error) {
      console.error(`Failed to distribute prize money for tournament ${tournament.name}:`, error);
    }
  }

  /**
   * Award achievements based on tournament results
   */
  private async awardTournamentAchievements(tournamentId: number, results: TournamentResult[]): Promise<void> {
    for (const result of results) {
      const { userId, rank } = result;

      // Check for tournament wins to increment counter
      if (rank === 1) {
        // Increment the private win counter
        await storage.incrementTournamentWins(userId);
      }
    }
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