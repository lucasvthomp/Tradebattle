import {
  users,
  watchlist,
  stockPurchases,
  contactSubmissions,
  adminLogs,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User>;
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
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User> {
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
}

export const storage = new DatabaseStorage();