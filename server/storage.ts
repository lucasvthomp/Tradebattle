import {
  users,
  watchlist,
  stockPurchases,
  personalStockPurchases,
  contactSubmissions,
  adminLogs,
  tournaments,
  tournamentParticipants,
  tournamentStockPurchases,
  tradeHistory,
  userAchievements,
  type User,
  type InsertUser,
  type WatchlistItem,
  type InsertWatchlistItem,
  type StockPurchase,
  type InsertStockPurchase,
  type ContactSubmission,
  type InsertContactSubmission,
  type AdminLog,
  type InsertAdminLog,
  type Tournament,
  type InsertTournament,
  type TournamentParticipant,
  type InsertTournamentParticipant,
  type TournamentStockPurchase,
  type InsertTournamentStockPurchase,
  type PersonalStockPurchase,
  type InsertPersonalStockPurchase,
  type TradeHistory,
  type InsertTradeHistory,
  type UserAchievement,
  type InsertUserAchievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, sql, ne } from "drizzle-orm";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'subscriptionTier' | 'premiumUpgradeDate' | 'personalBalance' | 'totalDeposited' | 'portfolioCreatedAt'>>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Watchlist operations
  getUserWatchlist(userId: number): Promise<WatchlistItem[]>;
  addToWatchlist(userId: number, item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: number, id: number): Promise<void>;
  
  // Trading operations
  getUserBalance(userId: number): Promise<number>;
  updateUserBalance(userId: number, newBalance: number): Promise<User>;
  purchaseStock(userId: number, purchase: InsertStockPurchase): Promise<StockPurchase>;
  getUserStockPurchases(userId: number): Promise<StockPurchase[]>;
  deletePurchase(userId: number, purchaseId: number): Promise<void>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Admin logs operations
  getAdminLogs(targetUserId: number): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  
  // Tournament operations
  createTournament(tournament: InsertTournament, creatorId: number): Promise<Tournament>;
  joinTournament(tournamentId: number, userId: number): Promise<TournamentParticipant>;
  getTournamentByCode(code: string): Promise<Tournament | undefined>;
  getUserTournaments(userId: number): Promise<Tournament[]>;
  getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]>;
  
  // Tournament trading operations
  getTournamentBalance(tournamentId: number, userId: number): Promise<number>;
  updateTournamentBalance(tournamentId: number, userId: number, newBalance: number): Promise<TournamentParticipant>;
  purchaseTournamentStock(tournamentId: number, userId: number, purchase: InsertTournamentStockPurchase): Promise<TournamentStockPurchase>;
  getTournamentStockPurchases(tournamentId: number, userId: number): Promise<TournamentStockPurchase[]>;
  deleteTournamentPurchase(tournamentId: number, userId: number, purchaseId: number): Promise<void>;
  
  // Personal portfolio operations
  purchasePersonalStock(userId: number, purchase: InsertPersonalStockPurchase): Promise<PersonalStockPurchase>;
  getPersonalStockPurchases(userId: number): Promise<PersonalStockPurchase[]>;
  deletePersonalPurchase(userId: number, purchaseId: number): Promise<void>;
  
  // Tournament operations
  getAllTournaments(): Promise<Tournament[]>;
  
  // Trade tracking operations
  recordTrade(trade: InsertTradeHistory): Promise<TradeHistory>;
  getUserTradeCount(userId: number): Promise<number>;
  
  // Achievement operations
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  awardAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  hasAchievement(userId: number, achievementType: string, tournamentId?: number): Promise<boolean>;
  
  // Tournament status operations
  updateTournamentStatus(tournamentId: number, status: string, endedAt?: Date): Promise<Tournament>;
  getExpiredTournaments(): Promise<Tournament[]>;
  getWaitingTournaments(): Promise<Tournament[]>;
  getArchivedTournaments(userId: number): Promise<Tournament[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Get the next available userId by finding the highest existing userId and adding 1
    const maxUserIdResult = await db.select({ maxUserId: sql`COALESCE(MAX(user_id), -1)` }).from(users);
    const nextUserId = (maxUserIdResult[0]?.maxUserId || -1) + 1;
    
    // Insert user with automatically assigned userId
    const result = await db.insert(users).values({
      ...userData,
      userId: nextUserId
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'subscriptionTier' | 'premiumUpgradeDate' | 'personalBalance' | 'totalDeposited' | 'portfolioCreatedAt'>>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.userId));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Watchlist operations
  async getUserWatchlist(userId: number): Promise<WatchlistItem[]> {
    return await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.createdAt));
  }

  async addToWatchlist(userId: number, item: InsertWatchlistItem): Promise<WatchlistItem> {
    const result = await db
      .insert(watchlist)
      .values({ ...item, userId })
      .returning();
    return result[0];
  }

  async removeFromWatchlist(userId: number, id: number): Promise<void> {
    await db.delete(watchlist).where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)));
  }

  // Trading operations
  async getUserBalance(userId: number): Promise<number> {
    const result = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
    return result[0] ? parseFloat(result[0].balance) : 0;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User> {
    const result = await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async purchaseStock(userId: number, purchase: InsertStockPurchase): Promise<StockPurchase> {
    const result = await db
      .insert(stockPurchases)
      .values({ ...purchase, userId })
      .returning();
    return result[0];
  }

  async getUserStockPurchases(userId: number): Promise<StockPurchase[]> {
    return await db
      .select()
      .from(stockPurchases)
      .where(eq(stockPurchases.userId, userId))
      .orderBy(desc(stockPurchases.createdAt));
  }

  async deletePurchase(userId: number, purchaseId: number): Promise<void> {
    await db
      .delete(stockPurchases)
      .where(and(eq(stockPurchases.id, purchaseId), eq(stockPurchases.userId, userId)));
  }

  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const result = await db.insert(contactSubmissions).values(submission).returning();
    return result[0];
  }

  // Admin logs operations
  async getAdminLogs(targetUserId: number): Promise<AdminLog[]> {
    return await db
      .select()
      .from(adminLogs)
      .where(eq(adminLogs.targetUserId, targetUserId))
      .orderBy(desc(adminLogs.createdAt));
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const result = await db.insert(adminLogs).values(log).returning();
    return result[0];
  }

  // Tournament operations
  async createTournament(tournament: InsertTournament, creatorId: number): Promise<Tournament> {
    // Generate unique 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const result = await db.insert(tournaments).values({
      ...tournament,
      code,
      creatorId
    }).returning();
    
    // Add creator as first participant with specified starting balance
    await db.insert(tournamentParticipants).values({
      tournamentId: result[0].id,
      userId: creatorId,
      balance: tournament.startingBalance.toString()
    });
    
    return result[0];
  }

  async joinTournament(tournamentId: number, userId: number): Promise<TournamentParticipant> {
    // Get tournament data to set starting balance
    const tournament = await db.select().from(tournaments).where(eq(tournaments.id, tournamentId));
    
    const result = await db.insert(tournamentParticipants).values({
      tournamentId,
      userId,
      balance: tournament[0].startingBalance.toString()
    }).returning();
    
    // Update tournament current players count
    await db.update(tournaments)
      .set({ currentPlayers: sql`${tournaments.currentPlayers} + 1` })
      .where(eq(tournaments.id, tournamentId));
    
    return result[0];
  }

  async getTournamentByCode(code: string): Promise<Tournament | undefined> {
    const result = await db.select().from(tournaments).where(eq(tournaments.code, code));
    return result[0];
  }

  async getUserTournaments(userId: number): Promise<any[]> {
    return await db
      .select({
        tournaments: tournaments,
        balance: tournamentParticipants.balance
      })
      .from(tournaments)
      .innerJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId))
      .where(
        and(
          eq(tournamentParticipants.userId, userId),
          ne(tournaments.status, 'completed')
        )
      )
      .orderBy(desc(tournaments.createdAt));
  }

  async getTournamentParticipants(tournamentId: number): Promise<any[]> {
    try {
      // First, get all participants
      const participants = await db
        .select()
        .from(tournamentParticipants)
        .where(eq(tournamentParticipants.tournamentId, tournamentId))
        .orderBy(asc(tournamentParticipants.joinedAt));

      // Then, get user info and stock purchases for each participant
      const participantsWithDetails = await Promise.all(
        participants.map(async (participant) => {
          // Get user info
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, participant.userId))
            .limit(1);

          // Get stock purchases
          const stockPurchases = await db
            .select()
            .from(tournamentStockPurchases)
            .where(
              and(
                eq(tournamentStockPurchases.userId, participant.userId),
                eq(tournamentStockPurchases.tournamentId, tournamentId)
              )
            );

          return {
            ...participant,
            firstName: user[0]?.firstName || '',
            lastName: user[0]?.lastName || '',
            stockPurchases: stockPurchases || []
          };
        })
      );

      return participantsWithDetails;
    } catch (error) {
      console.error('Error in getTournamentParticipants:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  // Tournament trading operations
  async getTournamentBalance(tournamentId: number, userId: number): Promise<number> {
    const result = await db
      .select({ balance: tournamentParticipants.balance })
      .from(tournamentParticipants)
      .where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId)));
    return result[0] ? parseFloat(result[0].balance) : 0;
  }

  async updateTournamentBalance(tournamentId: number, userId: number, newBalance: number): Promise<TournamentParticipant> {
    const result = await db
      .update(tournamentParticipants)
      .set({ balance: newBalance.toString() })
      .where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId)))
      .returning();
    return result[0];
  }

  async purchaseTournamentStock(tournamentId: number, userId: number, purchase: InsertTournamentStockPurchase): Promise<TournamentStockPurchase> {
    const result = await db
      .insert(tournamentStockPurchases)
      .values({ ...purchase, tournamentId, userId })
      .returning();
    return result[0];
  }

  async getTournamentStockPurchases(tournamentId: number, userId: number): Promise<TournamentStockPurchase[]> {
    return await db
      .select()
      .from(tournamentStockPurchases)
      .where(and(eq(tournamentStockPurchases.tournamentId, tournamentId), eq(tournamentStockPurchases.userId, userId)))
      .orderBy(desc(tournamentStockPurchases.createdAt));
  }

  async deleteTournamentPurchase(tournamentId: number, userId: number, purchaseId: number): Promise<void> {
    await db
      .delete(tournamentStockPurchases)
      .where(and(
        eq(tournamentStockPurchases.id, purchaseId),
        eq(tournamentStockPurchases.tournamentId, tournamentId),
        eq(tournamentStockPurchases.userId, userId)
      ));
  }

  // Personal portfolio operations
  async purchasePersonalStock(userId: number, purchase: InsertPersonalStockPurchase): Promise<PersonalStockPurchase> {
    const result = await db
      .insert(personalStockPurchases)
      .values({ ...purchase, userId })
      .returning();
    return result[0];
  }

  async getPersonalStockPurchases(userId: number): Promise<PersonalStockPurchase[]> {
    return await db
      .select()
      .from(personalStockPurchases)
      .where(eq(personalStockPurchases.userId, userId))
      .orderBy(desc(personalStockPurchases.createdAt));
  }

  async deletePersonalPurchase(userId: number, purchaseId: number): Promise<void> {
    await db
      .delete(personalStockPurchases)
      .where(and(
        eq(personalStockPurchases.id, purchaseId),
        eq(personalStockPurchases.userId, userId)
      ));
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  // Trade tracking operations
  async recordTrade(trade: InsertTradeHistory): Promise<TradeHistory> {
    const result = await db
      .insert(tradeHistory)
      .values(trade)
      .returning();
    return result[0];
  }

  async getUserTradeCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tradeHistory)
      .where(eq(tradeHistory.userId, userId));
    return result[0].count;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
  }

  async awardAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const result = await db
      .insert(userAchievements)
      .values(achievement)
      .returning();
    return result[0];
  }

  async hasAchievement(userId: number, achievementType: string, tournamentId?: number): Promise<boolean> {
    const conditions = [
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementType, achievementType)
    ];
    
    if (tournamentId) {
      conditions.push(eq(userAchievements.tournamentId, tournamentId));
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userAchievements)
      .where(and(...conditions));
    
    return result[0].count > 0;
  }

  async updateTournamentStatus(tournamentId: number, status: string, endedAt?: Date): Promise<Tournament> {
    const updateData: any = { status };
    if (endedAt) {
      updateData.endedAt = endedAt;
    }

    const result = await db
      .update(tournaments)
      .set(updateData)
      .where(eq(tournaments.id, tournamentId))
      .returning();
    return result[0];
  }

  async getExpiredTournaments(): Promise<Tournament[]> {
    const now = new Date();
    // For now, we'll use a simple approach - tournaments that have been active for more than their timeframe
    const results = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, 'active'));
    
    // Filter expired tournaments in JavaScript since SQL interval parsing can be complex
    return results.filter(tournament => {
      const createdAt = new Date(tournament.createdAt);
      const timeframeMs = this.parseTimeframe(tournament.timeframe);
      const expirationDate = new Date(createdAt.getTime() + timeframeMs);
      return now > expirationDate;
    });
  }

  async getWaitingTournaments(): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, 'waiting'));
  }

  private parseTimeframe(timeframe: string): number {
    const match = timeframe.match(/(\d+)\s*(minute|minutes|day|days|week|weeks|month|months)/i);
    if (!match) return 28 * 24 * 60 * 60 * 1000; // Default to 4 weeks in milliseconds
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'minute':
      case 'minutes':
        return value * 60 * 1000; // Convert minutes to milliseconds
      case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      case 'week':
      case 'weeks':
        return value * 7 * 24 * 60 * 60 * 1000; // Convert weeks to milliseconds
      case 'month':
      case 'months':
        return value * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
      default:
        return 28 * 24 * 60 * 60 * 1000; // Default to 4 weeks in milliseconds
    }
  }

  async getArchivedTournaments(userId: number): Promise<Tournament[]> {
    return await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        code: tournaments.code,
        creatorId: tournaments.creatorId,
        maxPlayers: tournaments.maxPlayers,
        currentPlayers: tournaments.currentPlayers,
        startingBalance: tournaments.startingBalance,
        timeframe: tournaments.timeframe,
        status: tournaments.status,
        createdAt: tournaments.createdAt,
        startedAt: tournaments.startedAt,
        endedAt: tournaments.endedAt,
      })
      .from(tournaments)
      .innerJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId))
      .where(
        and(
          eq(tournamentParticipants.userId, userId),
          eq(tournaments.status, 'completed')
        )
      )
      .orderBy(desc(tournaments.endedAt));
  }
}

export const storage = new DatabaseStorage();