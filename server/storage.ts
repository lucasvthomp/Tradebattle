import {
  users,
  studies,
  news,
  watchlist,
  contactSubmissions,
  researchInsights,
  type User,
  type InsertUser,
  type Study,
  type InsertStudy,
  type News,
  type InsertNews,
  type WatchlistItem,
  type InsertWatchlistItem,
  type ContactSubmission,
  type InsertContactSubmission,
  type ResearchInsight,
  type InsertResearchInsight,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Studies operations
  getStudies(): Promise<Study[]>;
  getFeaturedStudies(): Promise<Study[]>;
  getStudy(id: number): Promise<Study | undefined>;
  createStudy(study: InsertStudy & { authorId: number }): Promise<Study>;
  
  // News operations
  getNews(): Promise<News[]>;
  getNewsByCategory(category: string): Promise<News[]>;
  getBreakingNews(): Promise<News[]>;
  createNews(news: InsertNews & { authorId: number }): Promise<News>;
  
  // Watchlist operations
  getUserWatchlist(userId: number): Promise<WatchlistItem[]>;
  addToWatchlist(userId: number, item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: number, id: number): Promise<void>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Research insights operations
  getActiveInsights(): Promise<ResearchInsight[]>;
  createInsight(insight: InsertResearchInsight): Promise<ResearchInsight>;
}

export class DatabaseStorage implements IStorage {
  // User operations for email/password auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Studies operations
  async getStudies(): Promise<Study[]> {
    return await db
      .select()
      .from(studies)
      .orderBy(desc(studies.publishedAt));
  }

  async getFeaturedStudies(): Promise<Study[]> {
    return await db
      .select()
      .from(studies)
      .where(eq(studies.featured, true))
      .orderBy(desc(studies.publishedAt));
  }

  async getStudy(id: number): Promise<Study | undefined> {
    const [study] = await db
      .select()
      .from(studies)
      .where(eq(studies.id, id));
    return study;
  }

  async createStudy(studyData: InsertStudy & { authorId: number }): Promise<Study> {
    const [study] = await db
      .insert(studies)
      .values(studyData)
      .returning();
    return study;
  }

  // News operations
  async getNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .orderBy(desc(news.publishedAt));
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(eq(news.category, category))
      .orderBy(desc(news.publishedAt));
  }

  async getBreakingNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(eq(news.priority, "breaking"))
      .orderBy(desc(news.publishedAt));
  }

  async createNews(newsData: InsertNews & { authorId: number }): Promise<News> {
    const [newsItem] = await db
      .insert(news)
      .values(newsData)
      .returning();
    return newsItem;
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
    const [watchlistItem] = await db
      .insert(watchlist)
      .values({ ...item, userId })
      .returning();
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, id: number): Promise<void> {
    await db
      .delete(watchlist)
      .where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)));
  }

  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contactSubmission] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return contactSubmission;
  }

  // Research insights operations
  async getActiveInsights(): Promise<ResearchInsight[]> {
    return await db
      .select()
      .from(researchInsights)
      .where(eq(researchInsights.isActive, true))
      .orderBy(desc(researchInsights.createdAt));
  }

  async createInsight(insight: InsertResearchInsight): Promise<ResearchInsight> {
    const [researchInsight] = await db
      .insert(researchInsights)
      .values(insight)
      .returning();
    return researchInsight;
  }
}

export const storage = new DatabaseStorage();
