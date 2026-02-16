import { tournamentExpirationService } from './tournamentExpiration';

export class TournamentScheduler {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the tournament expiration checker
   * Runs every 5 minutes to check for expired tournaments
   */
  start(): void {
    if (this.intervalId) {
      console.log('Tournament scheduler is already running');
      return;
    }

    console.log('Starting tournament expiration scheduler...');

    // Run immediately on startup
    this.checkExpiredTournaments();

    // Then run every 30 seconds for faster response
    this.intervalId = setInterval(() => {
      this.checkExpiredTournaments();
    }, 30 * 1000); // 30 seconds
  }

  /**
   * Stop the tournament expiration checker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Tournament scheduler stopped');
    }
  }

  /**
   * Check for expired tournaments and process them
   */
  private async checkExpiredTournaments(): Promise<void> {
    try {
      console.log('Checking for expired tournaments...');
      await tournamentExpirationService.processExpiredTournaments();
      console.log('Tournament expiration check completed');
    } catch (error) {
      console.error('Error processing expired tournaments:', error);
    }
  }
}

export const tournamentScheduler = new TournamentScheduler();