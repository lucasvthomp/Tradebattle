import {
  users,
  studies,
  news,
  watchlist,
  stockPurchases,
  contactSubmissions,
  researchInsights,
  adminLogs,
  partners,
  researchRequests,
  partnerConversations,
  chatMessages,
  researchPublications,
  type User,
  type InsertUser,
  type Study,
  type InsertStudy,
  type News,
  type InsertNews,
  type WatchlistItem,
  type InsertWatchlistItem,
  type StockPurchase,
  type InsertStockPurchase,
  type ContactSubmission,
  type InsertContactSubmission,
  type ResearchInsight,
  type InsertResearchInsight,
  type UpdateUserSubscription,
  type AdminLog,
  type InsertAdminLog,
  type Partner,
  type InsertPartner,
  type ResearchRequest,
  type InsertResearchRequest,
  type PartnerConversation,
  type InsertPartnerConversation,
  type ChatMessage,
  type InsertChatMessage,
  type ResearchPublication,
  type InsertResearchPublication,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User>;
  updateUserSubscription(id: number, subscription: UpdateUserSubscription): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
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
  
  // Trading operations
  getUserBalance(userId: number): Promise<number>;
  updateUserBalance(userId: number, newBalance: number): Promise<User>;
  purchaseStock(userId: number, purchase: InsertStockPurchase): Promise<StockPurchase>;
  getUserStockPurchases(userId: number): Promise<StockPurchase[]>;
  deletePurchase(userId: number, purchaseId: number): Promise<void>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Research insights operations
  getActiveInsights(): Promise<ResearchInsight[]>;
  createInsight(insight: InsertResearchInsight): Promise<ResearchInsight>;
  
  // Admin logs operations
  getAdminLogs(targetUserId: number): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  
  // Partner operations
  getPartners(): Promise<Partner[]>;
  getPartner(userId: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(userId: number, updates: Partial<Pick<Partner, 'specialization' | 'isActive'>>): Promise<Partner>;
  
  // Research requests operations
  getResearchRequests(): Promise<ResearchRequest[]>;
  getResearchRequestsByPartner(partnerUserId: number): Promise<ResearchRequest[]>;
  getResearchRequestsByClient(clientUserId: number): Promise<ResearchRequest[]>;
  createResearchRequest(request: InsertResearchRequest): Promise<ResearchRequest>;
  updateResearchRequest(id: number, updates: Partial<Pick<ResearchRequest, 'partnerUserId' | 'status' | 'priority'>>): Promise<ResearchRequest>;
  
  // Partner conversations operations
  getConversations(partnerUserId: number, clientUserId: number): Promise<PartnerConversation[]>;
  createConversation(conversation: InsertPartnerConversation): Promise<PartnerConversation>;
  markConversationAsRead(id: number): Promise<void>;
  
  // Chat messages operations
  getChatMessages(conversationId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessageAsRead(id: number): Promise<void>;
  getUserConversations(userId: number): Promise<{conversationId: string, otherUser: User, lastMessage: ChatMessage}[]>;
  
  // Research publications operations
  getResearchPublications(isPublished?: boolean): Promise<ResearchPublication[]>;
  getResearchPublicationsByAuthor(authorId: number): Promise<ResearchPublication[]>;
  createResearchPublication(publication: InsertResearchPublication & { authorId: number }): Promise<ResearchPublication>;
  updateResearchPublication(id: number, updates: Partial<Pick<ResearchPublication, 'title' | 'content' | 'summary' | 'category' | 'tags' | 'isPublished'>>): Promise<ResearchPublication>;
  deleteResearchPublication(id: number): Promise<void>;
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
    // Hash the password before storing
    const { hashPassword } = await import("./auth");
    const hashedPassword = await hashPassword(userData.password);
    
    // Get the highest userId to assign the next one
    const [maxUserIdResult] = await db.select({ 
      maxUserId: sql<number>`COALESCE(MAX(${users.userId}), -1)` 
    }).from(users);
    
    const nextUserId = (maxUserIdResult?.maxUserId ?? -1) + 1;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        userId: nextUserId
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSubscription(id: number, subscription: UpdateUserSubscription): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionTier: subscription.subscriptionTier,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(users.id);
    return allUsers;
  }

  async deleteUser(id: number): Promise<void> {
    // First delete related watchlist items
    await db.delete(watchlist).where(eq(watchlist.userId, id));
    
    // Then delete the user
    await db.delete(users).where(eq(users.id, id));
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

  // Trading operations
  async getUserBalance(userId: number): Promise<number> {
    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));
    return user ? parseFloat(user.balance) : 0;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async purchaseStock(userId: number, purchase: InsertStockPurchase): Promise<StockPurchase> {
    const [stockPurchase] = await db
      .insert(stockPurchases)
      .values({ ...purchase, userId })
      .returning();
    return stockPurchase;
  }

  async getUserStockPurchases(userId: number): Promise<StockPurchase[]> {
    return await db
      .select()
      .from(stockPurchases)
      .where(eq(stockPurchases.userId, userId))
      .orderBy(desc(stockPurchases.purchaseDate));
  }

  async deletePurchase(userId: number, purchaseId: number): Promise<void> {
    await db.delete(stockPurchases)
      .where(
        and(
          eq(stockPurchases.id, purchaseId),
          eq(stockPurchases.userId, userId)
        )
      );
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

  // Admin logs operations
  async getAdminLogs(targetUserId: number): Promise<AdminLog[]> {
    const logs = await db
      .select()
      .from(adminLogs)
      .where(eq(adminLogs.targetUserId, targetUserId))
      .orderBy(desc(adminLogs.createdAt));
    return logs;
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [createdLog] = await db
      .insert(adminLogs)
      .values(log)
      .returning();
    return createdLog;
  }

  // Partner operations
  async getPartners(): Promise<Partner[]> {
    const allPartners = await db
      .select()
      .from(partners)
      .orderBy(partners.createdAt);
    return allPartners;
  }

  async getPartner(userId: number): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.userId, userId));
    return partner;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [createdPartner] = await db
      .insert(partners)
      .values(partner)
      .returning();
    return createdPartner;
  }

  async updatePartner(userId: number, updates: Partial<Pick<Partner, 'specialization' | 'isActive'>>): Promise<Partner> {
    const [updatedPartner] = await db
      .update(partners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(partners.userId, userId))
      .returning();
    return updatedPartner;
  }

  // Research requests operations
  async getResearchRequests(): Promise<ResearchRequest[]> {
    const requests = await db
      .select()
      .from(researchRequests)
      .orderBy(desc(researchRequests.createdAt));
    return requests;
  }

  async getResearchRequestsByPartner(partnerUserId: number): Promise<ResearchRequest[]> {
    const requests = await db
      .select()
      .from(researchRequests)
      .where(eq(researchRequests.partnerUserId, partnerUserId))
      .orderBy(desc(researchRequests.createdAt));
    return requests;
  }

  async getResearchRequestsByClient(clientUserId: number): Promise<ResearchRequest[]> {
    const requests = await db
      .select()
      .from(researchRequests)
      .where(eq(researchRequests.clientUserId, clientUserId))
      .orderBy(desc(researchRequests.createdAt));
    return requests;
  }

  async createResearchRequest(request: InsertResearchRequest): Promise<ResearchRequest> {
    const [createdRequest] = await db
      .insert(researchRequests)
      .values(request)
      .returning();
    return createdRequest;
  }

  async updateResearchRequest(id: number, updates: Partial<Pick<ResearchRequest, 'partnerUserId' | 'status' | 'priority'>>): Promise<ResearchRequest> {
    const [updatedRequest] = await db
      .update(researchRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(researchRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Partner conversations operations
  async getConversations(partnerUserId: number, clientUserId: number): Promise<PartnerConversation[]> {
    const conversations = await db
      .select()
      .from(partnerConversations)
      .where(
        and(
          eq(partnerConversations.partnerUserId, partnerUserId),
          eq(partnerConversations.clientUserId, clientUserId)
        )
      )
      .orderBy(partnerConversations.createdAt);
    return conversations;
  }

  async createConversation(conversation: InsertPartnerConversation): Promise<PartnerConversation> {
    const [createdConversation] = await db
      .insert(partnerConversations)
      .values(conversation)
      .returning();
    return createdConversation;
  }

  async markConversationAsRead(id: number): Promise<void> {
    await db
      .update(partnerConversations)
      .set({ isRead: true })
      .where(eq(partnerConversations.id, id));
  }

  // Chat messages operations
  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async markChatMessageAsRead(id: number): Promise<void> {
    await db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.id, id));
  }

  async getUserConversations(userId: number): Promise<{conversationId: string, otherUser: User, lastMessage: ChatMessage}[]> {
    const conversations = await db
      .select()
      .from(chatMessages)
      .where(or(eq(chatMessages.senderUserId, userId), eq(chatMessages.receiverUserId, userId)))
      .orderBy(desc(chatMessages.createdAt));

    const uniqueConversations = new Map<string, ChatMessage>();
    
    for (const message of conversations) {
      if (!uniqueConversations.has(message.conversationId)) {
        uniqueConversations.set(message.conversationId, message);
      }
    }

    const result = [];
    for (const [conversationId, lastMessage] of uniqueConversations) {
      const otherUserId = lastMessage.senderUserId === userId ? lastMessage.receiverUserId : lastMessage.senderUserId;
      const otherUser = await this.getUser(otherUserId);
      if (otherUser) {
        result.push({ conversationId, otherUser, lastMessage });
      }
    }

    return result;
  }

  // Research publications operations
  async getResearchPublications(isPublished?: boolean): Promise<ResearchPublication[]> {
    const query = db.select().from(researchPublications);
    
    if (isPublished !== undefined) {
      return await query.where(eq(researchPublications.isPublished, isPublished)).orderBy(desc(researchPublications.createdAt));
    }
    
    return await query.orderBy(desc(researchPublications.createdAt));
  }

  async getResearchPublicationsByAuthor(authorId: number): Promise<ResearchPublication[]> {
    return await db
      .select()
      .from(researchPublications)
      .where(eq(researchPublications.authorId, authorId))
      .orderBy(desc(researchPublications.createdAt));
  }

  async createResearchPublication(publicationData: InsertResearchPublication & { authorId: number }): Promise<ResearchPublication> {
    const [publication] = await db
      .insert(researchPublications)
      .values({
        ...publicationData,
        publishedAt: publicationData.isPublished ? new Date() : null,
      })
      .returning();
    return publication;
  }

  async updateResearchPublication(id: number, updates: Partial<Pick<ResearchPublication, 'title' | 'content' | 'summary' | 'category' | 'tags' | 'isPublished'>>): Promise<ResearchPublication> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    if (updates.isPublished !== undefined) {
      updateData.publishedAt = updates.isPublished ? new Date() : null;
    }

    const [publication] = await db
      .update(researchPublications)
      .set(updateData)
      .where(eq(researchPublications.id, id))
      .returning();
    return publication;
  }

  async deleteResearchPublication(id: number): Promise<void> {
    await db.delete(researchPublications).where(eq(researchPublications.id, id));
  }
}

export const storage = new DatabaseStorage();
