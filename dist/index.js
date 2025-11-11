var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/chatSchema.ts
import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var chatMessages, insertChatMessageSchema, selectChatMessageSchema;
var init_chatSchema = __esm({
  "shared/chatSchema.ts"() {
    "use strict";
    chatMessages = pgTable("chat_messages", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      username: varchar("username", { length: 15 }).notNull(),
      profilePicture: text("profile_picture"),
      // Base64 encoded profile picture or URL
      message: text("message").notNull(),
      tournamentId: integer("tournament_id"),
      // null for global chat, specific ID for tournament chat
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertChatMessageSchema = createInsertSchema(chatMessages);
    selectChatMessageSchema = createInsertSchema(chatMessages);
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminLogs: () => adminLogs,
  chatMessages: () => chatMessages,
  contactSubmissions: () => contactSubmissions,
  insertAdminLogSchema: () => insertAdminLogSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertContactSchema: () => insertContactSchema,
  insertCreatorRewardSchema: () => insertCreatorRewardSchema,
  insertPersonalStockPurchaseSchema: () => insertPersonalStockPurchaseSchema,
  insertPortfolioHistorySchema: () => insertPortfolioHistorySchema,
  insertStockPurchaseSchema: () => insertStockPurchaseSchema,
  insertTournamentParticipantSchema: () => insertTournamentParticipantSchema,
  insertTournamentSchema: () => insertTournamentSchema,
  insertTournamentStockPurchaseSchema: () => insertTournamentStockPurchaseSchema,
  insertTradeHistorySchema: () => insertTradeHistorySchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserSchema: () => insertUserSchema,
  insertWatchlistSchema: () => insertWatchlistSchema,
  loginSchema: () => loginSchema,
  personalStockPurchases: () => personalStockPurchases,
  portfolioHistory: () => portfolioHistory,
  registerSchema: () => registerSchema,
  registrationSchema: () => registrationSchema,
  selectChatMessageSchema: () => selectChatMessageSchema,
  sessions: () => sessions,
  stockPurchases: () => stockPurchases,
  tournamentCreatorRewards: () => tournamentCreatorRewards,
  tournamentParticipants: () => tournamentParticipants,
  tournamentStockPurchases: () => tournamentStockPurchases,
  tournaments: () => tournaments,
  tradeHistory: () => tradeHistory,
  userAchievements: () => userAchievements,
  usernameSchema: () => usernameSchema,
  users: () => users,
  watchlist: () => watchlist
});
import {
  pgTable as pgTable2,
  text as text2,
  varchar as varchar2,
  timestamp as timestamp2,
  jsonb,
  index,
  serial as serial2,
  boolean,
  integer as integer2,
  numeric,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
import { z } from "zod";
var sessions, users, watchlist, stockPurchases, personalStockPurchases, portfolioHistory, contactSubmissions, adminLogs, tournaments, tournamentParticipants, tournamentStockPurchases, userAchievements, tournamentCreatorRewards, insertWatchlistSchema, insertStockPurchaseSchema, insertContactSchema, insertAdminLogSchema, insertTournamentSchema, insertCreatorRewardSchema, insertTournamentParticipantSchema, insertTournamentStockPurchaseSchema, insertPersonalStockPurchaseSchema, insertPortfolioHistorySchema, tradeHistory, insertTradeHistorySchema, insertUserAchievementSchema, usernameSchema, insertUserSchema, loginSchema, registrationSchema, registerSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    init_chatSchema();
    sessions = pgTable2(
      "sessions",
      {
        sid: varchar2("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp2("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable2("users", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").unique(),
      // New field for admin identification (Lucas=0, Murilo=1)
      email: varchar2("email", { length: 255 }).unique().notNull(),
      username: varchar2("username", { length: 15 }).unique().notNull(),
      // 3-15 characters, letters/numbers/underscores only
      profilePicture: text2("profile_picture"),
      // Base64 encoded profile picture or URL
      lastUsernameChange: timestamp2("last_username_change"),
      // Track when username was last changed (for 2-week restriction)
      password: varchar2("password", { length: 255 }).notNull(),
      // hashed password
      country: varchar2("country", { length: 100 }),
      // User's country
      language: varchar2("language", { length: 50 }).default("English"),
      // User's preferred language
      currency: varchar2("currency", { length: 10 }).default("USD"),
      // User's preferred currency
      balance: numeric("balance", { precision: 15, scale: 2 }).default("10000.00").notNull(),
      // Starting balance of $10,000 - DEPRECATED, use siteCash instead
      siteCash: numeric("site_cash", { precision: 15, scale: 2 }).default("10000.00").notNull(),
      // Main site balance for tournaments and header display
      subscriptionTier: varchar2("subscription_tier", { length: 50 }).default("free").notNull(),
      // free, administrator
      premiumUpgradeDate: timestamp2("premium_upgrade_date"),
      // Deprecated - kept for data compatibility
      personalBalance: numeric("personal_balance", { precision: 15, scale: 2 }).default("10000.00").notNull(),
      // Personal portfolio balance
      totalDeposited: numeric("total_deposited", { precision: 15, scale: 2 }).default("10000.00").notNull(),
      // Total amount deposited into personal account
      personalPortfolioStartDate: timestamp2("personal_portfolio_start_date"),
      // When user started personal portfolio
      tournamentWins: integer2("tournament_wins").default(0).notNull(),
      // Private counter for tournament wins
      totalTrades: integer2("total_trades").default(0).notNull(),
      // Total number of buy/sell trades made by user
      adminNote: text2("admin_note").default(""),
      // Admin notes for user management
      banned: boolean("banned").default(false),
      // User banned status
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    watchlist = pgTable2("watchlist", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      symbol: varchar2("symbol").notNull(),
      companyName: varchar2("company_name").notNull(),
      notes: text2("notes"),
      createdAt: timestamp2("created_at").defaultNow()
    });
    stockPurchases = pgTable2("stock_purchases", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      symbol: varchar2("symbol").notNull(),
      companyName: varchar2("company_name").notNull(),
      shares: integer2("shares").notNull(),
      purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
      totalCost: numeric("total_cost", { precision: 15, scale: 2 }).notNull(),
      purchaseDate: timestamp2("purchase_date").defaultNow().notNull(),
      createdAt: timestamp2("created_at").defaultNow()
    });
    personalStockPurchases = pgTable2("personal_stock_purchases", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      symbol: varchar2("symbol").notNull(),
      companyName: varchar2("company_name").notNull(),
      shares: integer2("shares").notNull(),
      purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
      totalCost: numeric("total_cost", { precision: 15, scale: 2 }).notNull(),
      purchaseDate: timestamp2("purchase_date").defaultNow().notNull(),
      createdAt: timestamp2("created_at").defaultNow()
    });
    portfolioHistory = pgTable2("portfolio_history", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      portfolioType: varchar2("portfolio_type").notNull(),
      // 'personal' or 'tournament'
      tournamentId: integer2("tournament_id"),
      // null for personal portfolio
      totalValue: numeric("total_value", { precision: 15, scale: 2 }).notNull(),
      cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }).notNull(),
      stockValue: numeric("stock_value", { precision: 15, scale: 2 }).notNull(),
      recordedAt: timestamp2("recorded_at").defaultNow().notNull()
    });
    contactSubmissions = pgTable2("contact_submissions", {
      id: serial2("id").primaryKey(),
      name: varchar2("name").notNull(),
      email: varchar2("email").notNull(),
      subject: varchar2("subject").notNull(),
      message: text2("message").notNull(),
      status: varchar2("status").default("new"),
      // new, read, replied
      createdAt: timestamp2("created_at").defaultNow()
    });
    adminLogs = pgTable2("admin_logs", {
      id: serial2("id").primaryKey(),
      adminUserId: integer2("admin_user_id").references(() => users.id).notNull(),
      targetUserId: integer2("target_user_id").references(() => users.id).notNull(),
      action: varchar2("action").notNull(),
      // subscription_change, role_change, account_suspension, etc.
      oldValue: text2("old_value"),
      newValue: text2("new_value"),
      notes: text2("notes"),
      createdAt: timestamp2("created_at").defaultNow()
    });
    tournaments = pgTable2("tournaments", {
      id: serial2("id").primaryKey(),
      name: varchar2("name").notNull(),
      code: varchar2("code", { length: 8 }).unique().notNull(),
      // 8-character unique code
      creatorId: integer2("creator_id").references(() => users.id).notNull(),
      maxPlayers: integer2("max_players").default(10).notNull(),
      currentPlayers: integer2("current_players").default(1).notNull(),
      startingBalance: numeric("starting_balance", { precision: 15, scale: 2 }).default("10000.00").notNull(),
      timeframe: varchar2("timeframe").default("4 weeks").notNull(),
      // Tournament duration
      status: varchar2("status").default("waiting"),
      // waiting, active, completed, cancelled
      cancellationReason: text2("cancellation_reason"),
      // Reason if tournament was cancelled
      buyInAmount: numeric("buy_in_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
      // Real money buy-in amount
      currentPot: numeric("current_pot", { precision: 15, scale: 2 }).default("0.00").notNull(),
      // Total accumulated buy-ins
      tradingRestriction: varchar2("trading_restriction", { length: 50 }).default("none").notNull(),
      // Trading category restrictions
      tournamentType: varchar2("tournament_type", { length: 20 }).default("stocks").notNull(),
      // 'stocks' or 'crypto'
      isPublic: boolean("is_public").default(true).notNull(),
      // Public/private tournament setting
      scheduledStartTime: timestamp2("scheduled_start_time"),
      // When tournament is scheduled to start
      createdAt: timestamp2("created_at").defaultNow(),
      startedAt: timestamp2("started_at"),
      endedAt: timestamp2("ended_at")
    });
    tournamentParticipants = pgTable2("tournament_participants", {
      id: serial2("id").primaryKey(),
      tournamentId: integer2("tournament_id").references(() => tournaments.id).notNull(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      balance: numeric("balance", { precision: 15, scale: 2 }).default("10000.00").notNull(),
      joinedAt: timestamp2("joined_at").defaultNow()
    }, (table) => ({
      // Unique constraint: user can only participate in each tournament once
      uniqueUserTournament: unique("unique_user_tournament").on(table.tournamentId, table.userId)
    }));
    tournamentStockPurchases = pgTable2("tournament_stock_purchases", {
      id: serial2("id").primaryKey(),
      tournamentId: integer2("tournament_id").references(() => tournaments.id).notNull(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      symbol: varchar2("symbol").notNull(),
      companyName: varchar2("company_name").notNull(),
      shares: integer2("shares").notNull(),
      purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
      totalCost: numeric("total_cost", { precision: 15, scale: 2 }).notNull(),
      purchaseDate: timestamp2("purchase_date").defaultNow().notNull(),
      createdAt: timestamp2("created_at").defaultNow()
    });
    userAchievements = pgTable2("user_achievements", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").references(() => users.id).notNull(),
      achievementType: varchar2("achievement_type").notNull(),
      // 'tournament_winner', 'tournament_top3', 'first_trade', etc.
      achievementTier: varchar2("achievement_tier").notNull(),
      // 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
      achievementName: varchar2("achievement_name").notNull(),
      achievementDescription: text2("achievement_description").notNull(),
      earnedAt: timestamp2("earned_at").defaultNow().notNull(),
      createdAt: timestamp2("created_at").defaultNow()
    }, (table) => ({
      // Unique constraint: user can only have one of each achievement type globally
      uniqueUserAchievement: unique("unique_user_achievement").on(table.userId, table.achievementType)
    }));
    tournamentCreatorRewards = pgTable2("tournament_creator_rewards", {
      id: serial2("id").primaryKey(),
      tournamentId: integer2("tournament_id").references(() => tournaments.id).notNull(),
      creatorId: integer2("creator_id").references(() => users.id).notNull(),
      totalJackpot: numeric("total_jackpot", { precision: 15, scale: 2 }).notNull(),
      // Total buy-in amount collected
      creatorReward: numeric("creator_reward", { precision: 15, scale: 2 }).notNull(),
      // 5% of total jackpot
      participantCount: integer2("participant_count").notNull(),
      // Number of participants who paid buy-in
      rewardPaid: boolean("reward_paid").default(false).notNull(),
      // Whether reward has been distributed
      calculatedAt: timestamp2("calculated_at").defaultNow().notNull(),
      paidAt: timestamp2("paid_at"),
      createdAt: timestamp2("created_at").defaultNow()
    });
    insertWatchlistSchema = createInsertSchema2(watchlist).pick({
      symbol: true,
      companyName: true,
      notes: true
    });
    insertStockPurchaseSchema = createInsertSchema2(stockPurchases).pick({
      symbol: true,
      companyName: true,
      shares: true,
      purchasePrice: true,
      totalCost: true
    });
    insertContactSchema = createInsertSchema2(contactSubmissions).pick({
      name: true,
      email: true,
      subject: true,
      message: true
    });
    insertAdminLogSchema = createInsertSchema2(adminLogs).pick({
      adminUserId: true,
      targetUserId: true,
      action: true,
      oldValue: true,
      newValue: true,
      notes: true
    });
    insertTournamentSchema = createInsertSchema2(tournaments).pick({
      name: true,
      maxPlayers: true,
      startingBalance: true,
      timeframe: true,
      buyInAmount: true,
      tradingRestriction: true,
      isPublic: true,
      tournamentType: true,
      scheduledStartTime: true
    });
    insertCreatorRewardSchema = createInsertSchema2(tournamentCreatorRewards).pick({
      tournamentId: true,
      creatorId: true,
      totalJackpot: true,
      creatorReward: true,
      participantCount: true
    });
    insertTournamentParticipantSchema = createInsertSchema2(tournamentParticipants).pick({
      tournamentId: true,
      userId: true
    });
    insertTournamentStockPurchaseSchema = createInsertSchema2(tournamentStockPurchases).pick({
      tournamentId: true,
      symbol: true,
      companyName: true,
      shares: true,
      purchasePrice: true,
      totalCost: true
    });
    insertPersonalStockPurchaseSchema = createInsertSchema2(personalStockPurchases).pick({
      symbol: true,
      companyName: true,
      shares: true,
      purchasePrice: true,
      totalCost: true
    });
    insertPortfolioHistorySchema = createInsertSchema2(portfolioHistory).pick({
      userId: true,
      portfolioType: true,
      tournamentId: true,
      totalValue: true,
      cashBalance: true,
      stockValue: true
    });
    tradeHistory = pgTable2("trade_history", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull().references(() => users.id),
      tournamentId: integer2("tournament_id").references(() => tournaments.id),
      // null for personal trades
      symbol: text2("symbol").notNull(),
      companyName: text2("company_name").notNull(),
      tradeType: text2("trade_type").notNull(),
      // 'buy' or 'sell'
      shares: integer2("shares").notNull(),
      price: numeric("price", { precision: 10, scale: 2 }).notNull(),
      totalValue: numeric("total_value", { precision: 10, scale: 2 }).notNull(),
      tradeDate: timestamp2("trade_date").defaultNow().notNull(),
      createdAt: timestamp2("created_at").defaultNow().notNull()
    });
    insertTradeHistorySchema = createInsertSchema2(tradeHistory).pick({
      userId: true,
      tournamentId: true,
      symbol: true,
      companyName: true,
      tradeType: true,
      shares: true,
      price: true,
      totalValue: true
    });
    insertUserAchievementSchema = createInsertSchema2(userAchievements).pick({
      userId: true,
      achievementType: true,
      achievementTier: true,
      achievementName: true,
      achievementDescription: true
    });
    usernameSchema = z.string().min(3, "Username must be at least 3 characters").max(15, "Username must be no more than 15 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");
    insertUserSchema = createInsertSchema2(users).pick({
      email: true,
      username: true,
      password: true,
      userId: true,
      country: true,
      language: true,
      currency: true
    }).extend({
      username: usernameSchema
    });
    loginSchema = z.object({
      username: usernameSchema,
      password: z.string().min(6, "Password must be at least 6 characters")
    });
    registrationSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      username: usernameSchema,
      password: z.string().min(6, "Password must be at least 6 characters"),
      country: z.string().optional(),
      language: z.string().default("English"),
      currency: z.string().default("USD")
    });
    registerSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      username: usernameSchema,
      password: z.string().min(6, "Password must be at least 6 characters"),
      country: z.string().optional(),
      language: z.string().default("English"),
      currency: z.string().default("USD")
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq, desc, asc, and, or, sql, ne, isNull } from "drizzle-orm";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
var scryptAsync, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    scryptAsync = promisify(scrypt);
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
      }
      async createUser(userData) {
        try {
          const hashedPassword = await hashPassword(userData.password);
          let attempts = 0;
          const maxAttempts = 5;
          while (attempts < maxAttempts) {
            try {
              const result = await db.transaction(async (tx) => {
                const maxUserIdResult = await tx.select({
                  maxUserId: sql`COALESCE(MAX(user_id), -1)`
                }).from(users);
                const maxUserId = maxUserIdResult[0]?.maxUserId ?? -1;
                const nextUserId = maxUserId + 1;
                console.log(`Attempting to create user with userId: ${nextUserId} (max was: ${maxUserId})`);
                return await tx.insert(users).values({
                  ...userData,
                  password: hashedPassword,
                  userId: nextUserId
                }).returning();
              });
              const newUser = result[0];
              try {
                await this.awardAchievement({
                  userId: newUser.id,
                  achievementType: "welcome",
                  achievementTier: "common",
                  achievementName: "Welcome",
                  achievementDescription: "Joined the platform"
                });
              } catch (achievementError) {
                console.error("Error awarding welcome achievement:", achievementError);
              }
              return newUser;
            } catch (error) {
              if (error?.code === "23505" && error?.constraint === "users_user_id_unique") {
                attempts++;
                console.log(`Duplicate userId detected, retrying... (attempt ${attempts}/${maxAttempts})`);
                if (attempts >= maxAttempts) {
                  throw new Error("Failed to create user after maximum retry attempts");
                }
                await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
                continue;
              }
              throw error;
            }
          }
          throw new Error("Failed to create user: maximum attempts reached");
        } catch (error) {
          console.error("Error in createUser:", error);
          throw error;
        }
      }
      async updateUser(id, updates) {
        if (updates.username) {
          const currentUser = await this.getUser(id);
          if (currentUser?.lastUsernameChange) {
            const twoWeeksAgo = /* @__PURE__ */ new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            if (new Date(currentUser.lastUsernameChange) > twoWeeksAgo) {
              throw new Error("Username can only be changed once every two weeks");
            }
          }
          updates.lastUsernameChange = /* @__PURE__ */ new Date();
        }
        const result = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return result[0];
      }
      async getUserById(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async addUserBalance(userId, amount) {
        const result = await db.update(users).set({
          siteCash: sql`${users.siteCash} + ${amount.toString()}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId)).returning();
        return result[0];
      }
      async subtractUserBalance(userId, amount) {
        const result = await db.update(users).set({
          siteCash: sql`${users.siteCash} - ${amount.toString()}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId)).returning();
        return result[0];
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(asc(users.userId));
      }
      async deleteUser(id) {
        await db.delete(users).where(eq(users.id, id));
      }
      async updateProfilePicture(userId, profilePicture) {
        await db.update(users).set({ profilePicture, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      }
      // Watchlist operations
      async getUserWatchlist(userId) {
        return await db.select().from(watchlist).where(eq(watchlist.userId, userId)).orderBy(desc(watchlist.createdAt));
      }
      async addToWatchlist(userId, item) {
        const result = await db.insert(watchlist).values({ ...item, userId }).returning();
        return result[0];
      }
      async removeFromWatchlist(userId, id) {
        await db.delete(watchlist).where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)));
      }
      // Trading operations
      async getUserBalance(userId) {
        const result = await db.select({ siteCash: users.siteCash }).from(users).where(eq(users.id, userId));
        return result[0] ? parseFloat(result[0].siteCash) : 0;
      }
      async updateUserBalance(userId, newBalance) {
        const result = await db.update(users).set({ siteCash: newBalance.toString() }).where(eq(users.id, userId)).returning();
        return result[0];
      }
      async incrementTradeCount(userId) {
        await db.update(users).set({ totalTrades: sql`${users.totalTrades} + 1` }).where(eq(users.id, userId));
      }
      async purchaseStock(userId, purchase) {
        const result = await db.insert(stockPurchases).values({ ...purchase, userId }).returning();
        return result[0];
      }
      async getUserStockPurchases(userId) {
        return await db.select().from(stockPurchases).where(eq(stockPurchases.userId, userId)).orderBy(desc(stockPurchases.createdAt));
      }
      async deletePurchase(userId, purchaseId) {
        await db.delete(stockPurchases).where(and(eq(stockPurchases.id, purchaseId), eq(stockPurchases.userId, userId)));
      }
      // Contact operations
      async createContactSubmission(submission) {
        const result = await db.insert(contactSubmissions).values(submission).returning();
        return result[0];
      }
      // Admin logs operations
      async getAdminLogs(targetUserId) {
        return await db.select().from(adminLogs).where(eq(adminLogs.targetUserId, targetUserId)).orderBy(desc(adminLogs.createdAt));
      }
      async createAdminLog(log2) {
        const result = await db.insert(adminLogs).values(log2).returning();
        return result[0];
      }
      // Tournament operations
      async createTournament(tournament, creatorId) {
        console.log("[Storage] createTournament called with:", JSON.stringify(tournament, null, 2), "Creator:", creatorId);
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        console.log("[Storage] Generated code:", code);
        const buyInAmount = Number(tournament.buyInAmount || 0);
        console.log("[Storage] Buy-in amount:", buyInAmount);
        if (buyInAmount > 0) {
          console.log("[Storage] Processing buy-in...");
          const user = await db.select().from(users).where(eq(users.id, creatorId)).limit(1);
          if (!user[0]) {
            throw new Error("Creator not found");
          }
          const currentSiteCash = Number(user[0].siteCash || 0);
          console.log("[Storage] Creator site cash:", currentSiteCash);
          if (currentSiteCash < buyInAmount) {
            throw new Error(`Insufficient site cash to create tournament. You need ${buyInAmount.toFixed(2)} but only have ${currentSiteCash.toFixed(2)}`);
          }
          await db.update(users).set({ siteCash: (currentSiteCash - buyInAmount).toString() }).where(eq(users.id, creatorId));
          console.log("[Storage] Deducted buy-in from creator");
          try {
            await db.insert(adminLogs).values({
              adminUserId: creatorId,
              targetUserId: creatorId,
              action: "tournament_creator_buyin",
              oldValue: currentSiteCash.toString(),
              newValue: (currentSiteCash - buyInAmount).toString(),
              notes: `Buy-in deducted for creating tournament: ${tournament.name} ($${buyInAmount.toFixed(2)})`
            });
          } catch (logError2) {
            console.error("[Storage] WARNING: Failed to log transaction:", logError2);
          }
        }
        const insertValues = {
          ...tournament,
          code,
          creatorId,
          currentPot: buyInAmount.toString()
          // Set initial pot to creator's buy-in
        };
        console.log("[Storage] Inserting tournament with values:", JSON.stringify(insertValues, null, 2));
        let result;
        try {
          result = await db.insert(tournaments).values(insertValues).returning();
          console.log("[Storage] Tournament created successfully:", result[0].id);
        } catch (error) {
          console.error("[Storage] ERROR creating tournament:", error);
          throw error;
        }
        try {
          await db.insert(tournamentParticipants).values({
            tournamentId: result[0].id,
            userId: creatorId,
            balance: (tournament.startingBalance || "10000.00").toString()
          });
          console.log("[Storage] Added creator as participant");
        } catch (error) {
          console.error("[Storage] ERROR adding participant:", error);
          throw error;
        }
        return result[0];
      }
      async joinTournament(tournamentId, userId) {
        const existingParticipant = await db.select().from(tournamentParticipants).where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId))).limit(1);
        if (existingParticipant.length > 0) {
          throw new Error("User is already participating in this tournament");
        }
        const tournament = await db.select().from(tournaments).where(eq(tournaments.id, tournamentId));
        if (!tournament[0]) {
          throw new Error("Tournament not found");
        }
        const buyInAmount = Number(tournament[0].buyInAmount || 0);
        if (buyInAmount > 0) {
          const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          if (!user[0]) {
            throw new Error("User not found");
          }
          const currentSiteCash = Number(user[0].siteCash || 0);
          if (currentSiteCash < buyInAmount) {
            throw new Error(`Insufficient site cash. You need ${buyInAmount.toFixed(2)} but only have ${currentSiteCash.toFixed(2)}`);
          }
          await db.update(users).set({ siteCash: (currentSiteCash - buyInAmount).toString() }).where(eq(users.id, userId));
          await db.update(tournaments).set({ currentPot: sql`${tournaments.currentPot} + ${buyInAmount.toString()}` }).where(eq(tournaments.id, tournamentId));
        }
        const result = await db.insert(tournamentParticipants).values({
          tournamentId,
          userId,
          balance: (tournament[0]?.startingBalance || "10000.00").toString()
        }).returning();
        await db.update(tournaments).set({ currentPlayers: sql`${tournaments.currentPlayers} + 1` }).where(eq(tournaments.id, tournamentId));
        return result[0];
      }
      async getTournamentByCode(code) {
        const result = await db.select().from(tournaments).where(eq(tournaments.code, code));
        return result[0];
      }
      async getUserTournaments(userId) {
        const results = await db.select({
          tournament: tournaments,
          balance: tournamentParticipants.balance
        }).from(tournaments).innerJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId)).where(
          and(
            eq(tournamentParticipants.userId, userId),
            ne(tournaments.status, "completed"),
            ne(tournaments.status, "cancelled")
          )
        ).orderBy(desc(tournaments.createdAt));
        return results.map((result) => ({
          ...result.tournament,
          userBalance: result.balance
        }));
      }
      async getTournamentParticipants(tournamentId) {
        try {
          const participants = await db.select().from(tournamentParticipants).where(eq(tournamentParticipants.tournamentId, tournamentId)).orderBy(asc(tournamentParticipants.joinedAt));
          const participantsWithDetails = await Promise.all(
            participants.map(async (participant) => {
              const user = await db.select().from(users).where(eq(users.id, participant.userId)).limit(1);
              const stockPurchases2 = await db.select().from(tournamentStockPurchases).where(
                and(
                  eq(tournamentStockPurchases.userId, participant.userId),
                  eq(tournamentStockPurchases.tournamentId, tournamentId)
                )
              );
              return {
                ...participant,
                username: user[0]?.username || `User ${participant.userId}`,
                email: user[0]?.email || "",
                stockPurchases: stockPurchases2 || []
              };
            })
          );
          return participantsWithDetails;
        } catch (error) {
          console.error("Error in getTournamentParticipants:", error);
          return [];
        }
      }
      // Tournament trading operations
      async getTournamentBalance(tournamentId, userId) {
        const result = await db.select({ balance: tournamentParticipants.balance }).from(tournamentParticipants).where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId)));
        return result[0] ? parseFloat(result[0].balance) : 0;
      }
      async updateTournamentBalance(tournamentId, userId, newBalance) {
        const result = await db.update(tournamentParticipants).set({ balance: newBalance.toString() }).where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId))).returning();
        return result[0];
      }
      async purchaseTournamentStock(tournamentId, userId, purchase) {
        const result = await db.insert(tournamentStockPurchases).values({ ...purchase, tournamentId, userId }).returning();
        return result[0];
      }
      async getTournamentStockPurchases(tournamentId, userId) {
        return await db.select().from(tournamentStockPurchases).where(and(eq(tournamentStockPurchases.tournamentId, tournamentId), eq(tournamentStockPurchases.userId, userId))).orderBy(desc(tournamentStockPurchases.createdAt));
      }
      async deleteTournamentPurchase(tournamentId, userId, purchaseId) {
        await db.delete(tournamentStockPurchases).where(and(
          eq(tournamentStockPurchases.id, purchaseId),
          eq(tournamentStockPurchases.tournamentId, tournamentId),
          eq(tournamentStockPurchases.userId, userId)
        ));
      }
      // Personal portfolio operations
      async purchasePersonalStock(userId, purchase) {
        const result = await db.insert(personalStockPurchases).values({ ...purchase, userId }).returning();
        return result[0];
      }
      async getPersonalStockPurchases(userId) {
        return await db.select().from(personalStockPurchases).where(eq(personalStockPurchases.userId, userId)).orderBy(desc(personalStockPurchases.createdAt));
      }
      async deletePersonalPurchase(userId, purchaseId) {
        await db.delete(personalStockPurchases).where(and(
          eq(personalStockPurchases.id, purchaseId),
          eq(personalStockPurchases.userId, userId)
        ));
      }
      async getAllTournaments() {
        return await db.select().from(tournaments);
      }
      async getPublicTournaments() {
        return await db.select().from(tournaments).where(and(
          eq(tournaments.isPublic, true),
          ne(tournaments.status, "completed"),
          ne(tournaments.status, "cancelled")
        ));
      }
      // Trade tracking operations
      async recordTrade(trade) {
        const result = await db.insert(tradeHistory).values(trade).returning();
        await this.incrementTradeCount(trade.userId);
        return result[0];
      }
      async getUserTradeCount(userId) {
        const result = await db.select({ count: sql`count(*)` }).from(tradeHistory).where(eq(tradeHistory.userId, userId));
        return result[0].count;
      }
      async getUserAchievements(userId) {
        await this.ensureWelcomeAchievement(userId);
        return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId)).orderBy(desc(userAchievements.earnedAt));
      }
      async awardAchievement(achievement) {
        const result = await db.insert(userAchievements).values(achievement).onConflictDoNothing().returning();
        if (result.length === 0) {
          const existing = await db.select().from(userAchievements).where(
            and(
              eq(userAchievements.userId, achievement.userId),
              eq(userAchievements.achievementType, achievement.achievementType)
            )
          ).limit(1);
          return existing[0];
        }
        return result[0];
      }
      async awardAchievementByParams(userId, achievementType, tier, name, description) {
        return await this.awardAchievement({
          userId,
          achievementType,
          achievementTier: tier,
          achievementName: name,
          achievementDescription: description
        });
      }
      async hasAchievement(userId, achievementType) {
        const result = await db.select({ count: sql`count(*)` }).from(userAchievements).where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementType, achievementType)
          )
        );
        return result[0].count > 0;
      }
      async updateTournamentStatus(tournamentId, status, endedAt) {
        const updateData = { status };
        if (endedAt) {
          updateData.endedAt = endedAt;
        }
        const result = await db.update(tournaments).set(updateData).where(eq(tournaments.id, tournamentId)).returning();
        return result[0];
      }
      async cancelTournament(tournamentId, reason) {
        const result = await db.update(tournaments).set({
          status: "cancelled",
          cancellationReason: reason,
          endedAt: /* @__PURE__ */ new Date()
        }).where(eq(tournaments.id, tournamentId)).returning();
        return result[0];
      }
      async getExpiredTournaments() {
        const now = /* @__PURE__ */ new Date();
        const results = await db.select().from(tournaments).where(eq(tournaments.status, "active"));
        return results.filter((tournament) => {
          const createdAt = tournament.createdAt ? new Date(tournament.createdAt) : /* @__PURE__ */ new Date();
          const timeframeMs = this.parseTimeframe(tournament.timeframe);
          const expirationDate = new Date(createdAt.getTime() + timeframeMs);
          return now > expirationDate;
        });
      }
      // Tournament management methods
      async getTournamentById(id) {
        const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
        return result[0] || null;
      }
      async updateTournament(id, updates) {
        const result = await db.update(tournaments).set(updates).where(eq(tournaments.id, id)).returning();
        return result[0];
      }
      async deleteTournament(id) {
        await db.delete(tournamentStockPurchases).where(eq(tournamentStockPurchases.tournamentId, id));
        await db.delete(tournamentParticipants).where(eq(tournamentParticipants.tournamentId, id));
        await db.delete(tournaments).where(eq(tournaments.id, id));
      }
      async removeTournamentParticipant(tournamentId, participantId) {
        await db.delete(tournamentParticipants).where(
          and(
            eq(tournamentParticipants.tournamentId, tournamentId),
            eq(tournamentParticipants.userId, participantId)
          )
        );
      }
      async getWaitingTournaments() {
        return await db.select().from(tournaments).where(eq(tournaments.status, "waiting"));
      }
      parseTimeframe(timeframe) {
        const match = timeframe.match(/(\d+)\s*(minute|minutes|day|days|week|weeks|month|months)/i);
        if (!match) return 28 * 24 * 60 * 60 * 1e3;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
          case "minute":
          case "minutes":
            return value * 60 * 1e3;
          // Convert minutes to milliseconds
          case "day":
          case "days":
            return value * 24 * 60 * 60 * 1e3;
          // Convert days to milliseconds
          case "week":
          case "weeks":
            return value * 7 * 24 * 60 * 60 * 1e3;
          // Convert weeks to milliseconds
          case "month":
          case "months":
            return value * 30 * 24 * 60 * 60 * 1e3;
          // Convert months to milliseconds
          default:
            return 28 * 24 * 60 * 60 * 1e3;
        }
      }
      async getArchivedTournaments(userId) {
        const userTournaments = await db.select().from(tournaments).innerJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId)).where(
          and(
            eq(tournamentParticipants.userId, userId),
            or(
              eq(tournaments.status, "completed"),
              eq(tournaments.status, "cancelled")
            )
          )
        ).orderBy(desc(tournaments.endedAt));
        const tournamentsWithParticipants = await Promise.all(
          userTournaments.map(async (tournamentData) => {
            const tournament = tournamentData.tournaments;
            const participantData = await db.select().from(tournamentParticipants).innerJoin(users, eq(tournamentParticipants.userId, users.id)).where(eq(tournamentParticipants.tournamentId, tournament.id));
            const stockPurchases2 = await db.select().from(tournamentStockPurchases).where(eq(tournamentStockPurchases.tournamentId, tournament.id));
            const participants = await Promise.all(
              participantData.map(async (p) => {
                const userPurchases = stockPurchases2.filter((sp) => sp.userId === p.users.id);
                let portfolioValue = Number(p.tournament_participants.balance);
                for (const purchase of userPurchases) {
                  const stockValue = Number(purchase.shares) * Number(purchase.purchasePrice);
                  portfolioValue = Number(portfolioValue) + Number(stockValue);
                }
                return {
                  userId: p.users.id,
                  name: p.users.username,
                  finalBalance: p.tournament_participants.balance,
                  portfolioValue,
                  position: 0
                  // Will be set after sorting
                };
              })
            );
            participants.sort((a, b) => Number(b.portfolioValue) - Number(a.portfolioValue));
            participants.forEach((p, index2) => {
              p.position = index2 + 1;
            });
            return {
              ...tournament,
              participants
            };
          })
        );
        return tournamentsWithParticipants;
      }
      // Ensure user has Welcome achievement
      async ensureWelcomeAchievement(userId) {
        const hasWelcome = await this.hasAchievement(userId, "welcome");
        if (!hasWelcome) {
          await this.awardAchievement({
            userId,
            achievementType: "welcome",
            achievementTier: "common",
            achievementName: "Welcome",
            achievementDescription: "Joined the platform"
          });
        }
      }
      async incrementTournamentWins(userId) {
        await db.update(users).set({
          tournamentWins: sql`${users.tournamentWins} + 1`
        }).where(eq(users.id, userId));
      }
      async getTournamentWins(userId) {
        const result = await db.select({ tournamentWins: users.tournamentWins }).from(users).where(eq(users.id, userId)).limit(1);
        return result[0]?.tournamentWins || 0;
      }
      // Portfolio history operations
      async recordPortfolioValue(record) {
        const result = await db.insert(portfolioHistory).values(record).returning();
        return result[0];
      }
      async getUserPortfolioHistory(userId, portfolioType, tournamentId) {
        let query = db.select().from(portfolioHistory).where(and(
          eq(portfolioHistory.userId, userId),
          eq(portfolioHistory.portfolioType, portfolioType)
        ));
        if (portfolioType === "tournament" && tournamentId) {
          query = db.select().from(portfolioHistory).where(and(
            eq(portfolioHistory.userId, userId),
            eq(portfolioHistory.portfolioType, portfolioType),
            eq(portfolioHistory.tournamentId, tournamentId)
          ));
        }
        return await query.orderBy(asc(portfolioHistory.recordedAt));
      }
      // Admin user management operations
      async updateUserUsername(userId, username) {
        await db.update(users).set({ username }).where(eq(users.id, userId));
      }
      async adminUpdateUserBalance(userId, amount, operation) {
        const user = await this.getUser(userId);
        if (!user) throw new Error("User not found");
        const currentBalance = parseFloat(user.personalBalance) || 0;
        const newBalance = operation === "add" ? currentBalance + amount : Math.max(0, currentBalance - amount);
        await db.update(users).set({ personalBalance: newBalance.toString() }).where(eq(users.id, userId));
      }
      async updateUserAdminNote(userId, note) {
        await db.update(users).set({ adminNote: note }).where(eq(users.id, userId));
      }
      async banUser(userId) {
        await db.update(users).set({ banned: true }).where(eq(users.id, userId));
      }
      // Chat operations
      async getChatMessages(tournamentId) {
        return await db.select().from(chatMessages).where(tournamentId ? eq(chatMessages.tournamentId, tournamentId) : isNull(chatMessages.tournamentId)).orderBy(asc(chatMessages.createdAt)).limit(100);
      }
      async createChatMessage(message) {
        const result = await db.insert(chatMessages).values(message).returning();
        return result[0];
      }
      async transferBalance(senderId, recipientId, amount) {
        const sender = await this.getUserById(senderId);
        const recipient = await this.getUserById(recipientId);
        if (!sender || !recipient) {
          throw new Error("User not found");
        }
        const senderBalance = parseFloat(sender.siteCash);
        const recipientBalance = parseFloat(recipient.siteCash);
        await db.update(users).set({ siteCash: (senderBalance - amount).toString() }).where(eq(users.id, senderId));
        await db.update(users).set({ siteCash: (recipientBalance + amount).toString() }).where(eq(users.id, recipientId));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/services/yahooFinance.ts
var yahooFinance_exports = {};
__export(yahooFinance_exports, {
  calculatePercentChange: () => calculatePercentChange,
  clearExpiredCache: () => clearExpiredCache,
  getAllSectors: () => getAllSectors,
  getCompanyProfile: () => getCompanyProfile,
  getDateRange: () => getDateRange,
  getHistoricalData: () => getHistoricalData,
  getMultipleQuotes: () => getMultipleQuotes,
  getPopularStocks: () => getPopularStocks,
  getStockPerformance: () => getStockPerformance,
  getStockQuote: () => getStockQuote,
  searchStocks: () => searchStocks
});
import yahooFinance from "yahoo-finance2";
function getDateRange(timeFrame) {
  const now = /* @__PURE__ */ new Date();
  const today = now.toISOString().split("T")[0];
  const getDaysAgo = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };
  const getYearStart = () => {
    return `${now.getFullYear()}-01-02`;
  };
  const getYearsAgo = (years) => {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date.toISOString().split("T")[0];
  };
  switch (timeFrame) {
    case "1H":
      return {
        period1: getDaysAgo(1),
        // Get 1 day ago for 1 hour of data
        period2: today,
        interval: "1m"
        // Use 1-minute intervals for 1H timeframe
      };
    case "1D":
      return {
        period1: getDaysAgo(2),
        // Get 2 days ago to ensure we get at least 1 trading day
        period2: today,
        interval: "5m"
        // Use 5-minute intervals for better reliability
      };
    case "5D":
      return {
        period1: getDaysAgo(7),
        // Get 7 days ago to ensure we have 5 trading days
        period2: today,
        interval: "30m"
        // Use 30-minute intervals for 5D timeframe
      };
    case "1W":
      return {
        period1: getDaysAgo(8),
        // Get 8 days ago to ensure we have 1 week of trading data
        period2: today,
        interval: "1d"
        // Daily intervals
      };
    case "1M":
      return {
        period1: getDaysAgo(30),
        period2: today,
        interval: "1d"
        // Daily intervals
      };
    case "3M":
      return {
        period1: getDaysAgo(90),
        period2: today,
        interval: "1d"
        // Daily intervals
      };
    case "6M":
      return {
        period1: getDaysAgo(180),
        period2: today,
        interval: "1d"
        // Daily intervals
      };
    case "YTD":
      return {
        period1: getYearStart(),
        period2: today,
        interval: "1d"
        // Daily intervals
      };
    case "1Y":
      return {
        period1: getYearsAgo(1),
        period2: today,
        interval: "1d"
        // Daily intervals
      };
    case "5Y":
      return {
        period1: getYearsAgo(5),
        period2: today,
        interval: "1wk"
        // Weekly intervals for longer timeframes
      };
    default:
      throw new Error(`Unsupported timeframe: ${timeFrame}`);
  }
}
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}
function setCachedData(key, data, ttl) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}
function getSectorFallback(symbol) {
  const sectorMap = {
    // Technology
    "AAPL": "Technology",
    "MSFT": "Technology",
    "NVDA": "Technology",
    "AMD": "Technology",
    "INTC": "Technology",
    "CRM": "Technology",
    "ADBE": "Technology",
    "ORCL": "Technology",
    "IBM": "Technology",
    "UBER": "Technology",
    "LYFT": "Technology",
    "ZOOM": "Technology",
    "PLTR": "Technology",
    "SNOW": "Technology",
    "SQ": "Technology",
    "SHOP": "Technology",
    "TWLO": "Technology",
    "OKTA": "Technology",
    "DOCU": "Technology",
    "ZM": "Technology",
    "CRWD": "Technology",
    "NET": "Technology",
    "DDOG": "Technology",
    "MDB": "Technology",
    "WDAY": "Technology",
    "NOW": "Technology",
    "TEAM": "Technology",
    "ATLASSIAN": "Technology",
    "SALESFORCE": "Technology",
    "SERVICENOW": "Technology",
    "WORKDAY": "Technology",
    // Communication Services
    "GOOGL": "Communication Services",
    "GOOG": "Communication Services",
    "META": "Communication Services",
    "NFLX": "Communication Services",
    "DIS": "Communication Services",
    "SPOT": "Communication Services",
    "TWTR": "Communication Services",
    "SNAP": "Communication Services",
    "PINS": "Communication Services",
    "ROKU": "Communication Services",
    "T": "Communication Services",
    "VZ": "Communication Services",
    "CMCSA": "Communication Services",
    "CHTR": "Communication Services",
    "TMUS": "Communication Services",
    "DISH": "Communication Services",
    "SIRI": "Communication Services",
    "WBD": "Communication Services",
    // Consumer Discretionary
    "AMZN": "Consumer Discretionary",
    "TSLA": "Consumer Discretionary",
    "HD": "Consumer Discretionary",
    "NKE": "Consumer Discretionary",
    "SBUX": "Consumer Discretionary",
    "LOW": "Consumer Discretionary",
    "TJX": "Consumer Discretionary",
    "BKNG": "Consumer Discretionary",
    "MCD": "Consumer Discretionary",
    "CMG": "Consumer Discretionary",
    "LULU": "Consumer Discretionary",
    "ABNB": "Consumer Discretionary",
    "GM": "Consumer Discretionary",
    "F": "Consumer Discretionary",
    "RIVN": "Consumer Discretionary",
    "LCID": "Consumer Discretionary",
    "YUM": "Consumer Discretionary",
    "QSR": "Consumer Discretionary",
    "DKNG": "Consumer Discretionary",
    "ETSY": "Consumer Discretionary",
    "EBAY": "Consumer Discretionary",
    // Consumer Staples
    "PEP": "Consumer Staples",
    "KO": "Consumer Staples",
    "WMT": "Consumer Staples",
    "PG": "Consumer Staples",
    "COST": "Consumer Staples",
    "KHC": "Consumer Staples",
    "CL": "Consumer Staples",
    "GIS": "Consumer Staples",
    "K": "Consumer Staples",
    "CPB": "Consumer Staples",
    "CAG": "Consumer Staples",
    "HSY": "Consumer Staples",
    "MDLZ": "Consumer Staples",
    "KMB": "Consumer Staples",
    "CLX": "Consumer Staples",
    "SJM": "Consumer Staples",
    "TAP": "Consumer Staples",
    "STZ": "Consumer Staples",
    // Healthcare
    "JNJ": "Healthcare",
    "UNH": "Healthcare",
    "PFE": "Healthcare",
    "ABT": "Healthcare",
    "TMO": "Healthcare",
    "DHR": "Healthcare",
    "BMY": "Healthcare",
    "LLY": "Healthcare",
    "AMGN": "Healthcare",
    "GILD": "Healthcare",
    "REGN": "Healthcare",
    "VRTX": "Healthcare",
    "BIIB": "Healthcare",
    "ILMN": "Healthcare",
    "ISRG": "Healthcare",
    "SYK": "Healthcare",
    "BSX": "Healthcare",
    "MDT": "Healthcare",
    "EW": "Healthcare",
    "DXCM": "Healthcare",
    "MRNA": "Healthcare",
    "BNTX": "Healthcare",
    "ZTS": "Healthcare",
    "IDEXX": "Healthcare",
    // Financial Services
    "JPM": "Financial Services",
    "BAC": "Financial Services",
    "WFC": "Financial Services",
    "C": "Financial Services",
    "GS": "Financial Services",
    "MS": "Financial Services",
    "V": "Financial Services",
    "MA": "Financial Services",
    "PYPL": "Financial Services",
    "AXP": "Financial Services",
    "BRK.A": "Financial Services",
    "BRK.B": "Financial Services",
    "USB": "Financial Services",
    "TFC": "Financial Services",
    "PNC": "Financial Services",
    "COF": "Financial Services",
    "SCHW": "Financial Services",
    "BLK": "Financial Services",
    "SPGI": "Financial Services",
    "ICE": "Financial Services",
    "CME": "Financial Services",
    // Energy
    "XOM": "Energy",
    "CVX": "Energy",
    "COP": "Energy",
    "EOG": "Energy",
    "SLB": "Energy",
    "PSX": "Energy",
    "VLO": "Energy",
    "MPC": "Energy",
    "OXY": "Energy",
    "KMI": "Energy",
    "WMB": "Energy",
    "ENB": "Energy",
    "TRP": "Energy",
    "EPD": "Energy",
    "ET": "Energy",
    "MPLX": "Energy",
    "DVN": "Energy",
    "FANG": "Energy",
    "PXD": "Energy",
    "CNQ": "Energy",
    // Industrials
    "UAL": "Industrials",
    "AAL": "Industrials",
    "DAL": "Industrials",
    "LUV": "Industrials",
    "BA": "Industrials",
    "HON": "Industrials",
    "UPS": "Industrials",
    "FDX": "Industrials",
    "LMT": "Industrials",
    "RTX": "Industrials",
    "NOC": "Industrials",
    "GD": "Industrials",
    "CAT": "Industrials",
    "DE": "Industrials",
    "MMM": "Industrials",
    "GE": "Industrials",
    "EMR": "Industrials",
    "ITW": "Industrials",
    "PH": "Industrials",
    "TDG": "Industrials",
    "CTAS": "Industrials",
    "VRSK": "Industrials",
    "PCAR": "Industrials",
    "NSC": "Industrials",
    // Materials
    "LIN": "Materials",
    "APD": "Materials",
    "SHW": "Materials",
    "FCX": "Materials",
    "NEM": "Materials",
    "CTVA": "Materials",
    "DD": "Materials",
    "DOW": "Materials",
    "PPG": "Materials",
    "ECL": "Materials",
    "FMC": "Materials",
    "ALB": "Materials",
    "CF": "Materials",
    "MOS": "Materials",
    "IFF": "Materials",
    "PKG": "Materials",
    "AMCR": "Materials",
    "IP": "Materials",
    "WRK": "Materials",
    "BALL": "Materials",
    // Utilities
    "NEE": "Utilities",
    "DUK": "Utilities",
    "SO": "Utilities",
    "D": "Utilities",
    "AEP": "Utilities",
    "EXC": "Utilities",
    "XEL": "Utilities",
    "SRE": "Utilities",
    "PEG": "Utilities",
    "ED": "Utilities",
    "AWK": "Utilities",
    "ATO": "Utilities",
    "WEC": "Utilities",
    "DTE": "Utilities",
    "PPL": "Utilities",
    "CMS": "Utilities",
    // Real Estate
    "PLD": "Real Estate",
    "AMT": "Real Estate",
    "CCI": "Real Estate",
    "EQIX": "Real Estate",
    "WELL": "Real Estate",
    "SPG": "Real Estate",
    "PSA": "Real Estate",
    "O": "Real Estate",
    "CBRE": "Real Estate",
    "DLR": "Real Estate",
    "BXP": "Real Estate",
    "ARE": "Real Estate",
    "VTR": "Real Estate",
    "ESS": "Real Estate",
    "MAA": "Real Estate",
    "UDR": "Real Estate",
    // Cryptocurrency & Blockchain
    "COIN": "Financial Services",
    "MSTR": "Technology",
    "RIOT": "Technology",
    "MARA": "Technology",
    "HUT": "Technology",
    "BTBT": "Technology",
    "CAN": "Technology",
    "BITF": "Technology",
    // Popular ETFs (assign broad sectors)
    "SPY": "Diversified",
    "QQQ": "Technology",
    "IWM": "Diversified",
    "VTI": "Diversified",
    "VOO": "Diversified",
    "VEA": "Diversified",
    "VWO": "Diversified",
    "BND": "Fixed Income",
    "AGG": "Fixed Income",
    "TLT": "Fixed Income",
    "GLD": "Commodities",
    "SLV": "Commodities",
    "USO": "Energy",
    "XLE": "Energy",
    "XLF": "Financial Services",
    "XLK": "Technology",
    "XLV": "Healthcare",
    "XLI": "Industrials",
    "XLY": "Consumer Discretionary",
    "XLP": "Consumer Staples",
    "XLU": "Utilities",
    "XLB": "Materials",
    "XLRE": "Real Estate",
    "XLC": "Communication Services"
  };
  return sectorMap[symbol] || "Technology";
}
function getAllSectors() {
  return [
    "Technology",
    "Communication Services",
    "Consumer Discretionary",
    "Consumer Staples",
    "Healthcare",
    "Financial Services",
    "Energy",
    "Industrials",
    "Materials",
    "Utilities",
    "Real Estate",
    "Consumer Defensive",
    "Consumer Cyclical",
    "Basic Materials",
    "Diversified",
    "Fixed Income",
    "Commodities"
  ];
}
async function getStockQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  try {
    const [result, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: ["assetProfile", "summaryProfile"]
      }).catch(() => null)
      // Don't fail if summary is not available
    ]);
    if (!result || !result.regularMarketPrice) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }
    let previousClosePrice = result.regularMarketPreviousClose;
    let currentPrice = result.regularMarketPrice;
    try {
      const threeDaysAgo = /* @__PURE__ */ new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const historicalData = await yahooFinance.chart(symbol, {
        period1: threeDaysAgo,
        period2: /* @__PURE__ */ new Date(),
        interval: "1d"
        // Daily intervals
      });
      if (historicalData && historicalData.quotes && historicalData.quotes.length >= 2) {
        const previousDayQuote = historicalData.quotes[historicalData.quotes.length - 2];
        if (previousDayQuote && previousDayQuote.close) {
          previousClosePrice = previousDayQuote.close;
        }
      }
    } catch (historicalError) {
      console.log(`Could not fetch historical data for ${symbol}, using regular market previous close`);
    }
    const change = currentPrice - previousClosePrice;
    const percentChange = change / previousClosePrice * 100;
    const quote = {
      symbol: result.symbol || symbol,
      price: currentPrice,
      change,
      percentChange,
      previousClose: previousClosePrice,
      volume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || 0,
      currency: result.currency || "USD",
      sector: summary?.summaryProfile?.sector || summary?.assetProfile?.sector || getSectorFallback(symbol),
      industry: summary?.summaryProfile?.industry || summary?.assetProfile?.industry || void 0
    };
    setCachedData(cacheKey, quote, CACHE_TTL.QUOTE);
    return quote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`Failed to fetch quote for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function searchStocks(query) {
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  try {
    const result = await yahooFinance.search(query);
    if (!result || !result.quotes) {
      return [];
    }
    const searchResults = await Promise.all(
      result.quotes.filter((item) => item.symbol && item.shortname).slice(0, 10).map(async (item) => {
        let sector = item.sector;
        let industry = item.industry;
        if (!sector) {
          try {
            const summary = await yahooFinance.quoteSummary(item.symbol, {
              modules: ["assetProfile", "summaryProfile"]
            });
            sector = summary?.summaryProfile?.sector || summary?.assetProfile?.sector;
            industry = summary?.summaryProfile?.industry || summary?.assetProfile?.industry;
          } catch (error) {
            sector = getSectorFallback(item.symbol);
          }
        }
        return {
          symbol: item.symbol,
          name: item.shortname || item.longname || item.symbol,
          exchange: item.exchange || "N/A",
          type: item.typeDisp || "Stock",
          sector: sector || getSectorFallback(item.symbol),
          industry: industry || void 0
        };
      })
    );
    setCachedData(cacheKey, searchResults, CACHE_TTL.SEARCH);
    return searchResults;
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    throw new Error(`Failed to search for ${query}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function getHistoricalData(symbol, timeFrame = "1M") {
  const cacheKey = `historical_${symbol}_${timeFrame}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  try {
    if (timeFrame === "1D") {
      try {
        const getLastTradingDay = () => {
          const now = /* @__PURE__ */ new Date();
          const dayOfWeek = now.getDay();
          if (dayOfWeek === 0) {
            const friday = new Date(now);
            friday.setDate(now.getDate() - 2);
            return friday;
          } else if (dayOfWeek === 6) {
            const friday = new Date(now);
            friday.setDate(now.getDate() - 1);
            return friday;
          } else if (dayOfWeek === 1) {
            const currentHour = now.getHours();
            if (currentHour < 9 || currentHour === 9 && now.getMinutes() < 30) {
              const friday = new Date(now);
              friday.setDate(now.getDate() - 3);
              return friday;
            }
          }
          return now;
        };
        const lastTradingDay = getLastTradingDay();
        const sevenDaysAgo = new Date(lastTradingDay);
        sevenDaysAgo.setDate(lastTradingDay.getDate() - 7);
        const nextDay = new Date(lastTradingDay);
        nextDay.setDate(lastTradingDay.getDate() + 1);
        const chartResult = await yahooFinance.chart(symbol, {
          period1: sevenDaysAgo.toISOString().split("T")[0],
          period2: nextDay.toISOString().split("T")[0],
          interval: "5m",
          includePrePost: false
        });
        if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
          const targetDateStr = lastTradingDay.toISOString().split("T")[0];
          const intradayData = chartResult.quotes.filter((quote) => {
            const quoteDate = new Date(quote.date);
            const quoteDateStr = quoteDate.toISOString().split("T")[0];
            const quoteDayOfWeek = quoteDate.getDay();
            if (quoteDayOfWeek === 0 || quoteDayOfWeek === 6) {
              return false;
            }
            const quoteHour = quoteDate.getUTCHours();
            const quoteMinute = quoteDate.getUTCMinutes();
            const utcTime = quoteHour + quoteMinute / 60;
            const isMarketHours = utcTime >= 13.5 && utcTime <= 20;
            return quoteDateStr === targetDateStr && quote.close !== null && quote.close !== void 0 && isMarketHours;
          }).map((quote) => ({
            date: Math.floor(quote.date.getTime() / 1e3),
            // Convert to Unix timestamp
            open: quote.open || quote.close || 0,
            high: quote.high || quote.close || 0,
            low: quote.low || quote.close || 0,
            close: quote.close || 0,
            volume: quote.volume || 0
          }));
          if (intradayData.length > 0) {
            setCachedData(cacheKey, intradayData, CACHE_TTL.HISTORICAL_MINUTE);
            return intradayData;
          }
        }
      } catch (error) {
        console.log(`1D chart data failed for ${symbol}, trying historical fallback`);
      }
      try {
        const fiveDaysAgo = /* @__PURE__ */ new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const historicalResult = await yahooFinance.historical(symbol, {
          period1: fiveDaysAgo.toISOString().split("T")[0],
          period2: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          interval: "1d",
          events: "history"
        });
        if (historicalResult && Array.isArray(historicalResult) && historicalResult.length > 0) {
          const recentData = historicalResult.slice(-2).map((item) => ({
            date: item.date.toISOString().split("T")[0],
            open: item.open || item.close || 0,
            high: item.high || item.close || 0,
            low: item.low || item.close || 0,
            close: item.close || 0,
            volume: item.volume || 0
          }));
          setCachedData(cacheKey, recentData, CACHE_TTL.HISTORICAL_MINUTE);
          return recentData;
        }
      } catch (error) {
        console.log(`Historical fallback also failed for ${symbol}`);
      }
    }
    const { period1, period2, interval } = getDateRange(timeFrame);
    const result = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval,
      events: "history"
    });
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error(`No historical data found for symbol: ${symbol}`);
    }
    const historicalData = result.filter((item) => item.close !== null && item.close !== void 0).map((item) => ({
      date: item.date.toISOString().split("T")[0],
      open: item.open || item.close || 0,
      high: item.high || item.close || 0,
      low: item.low || item.close || 0,
      close: item.close || 0,
      volume: item.volume || 0
    }));
    const cacheTTL = timeFrame === "1D" ? CACHE_TTL.HISTORICAL_MINUTE : timeFrame === "5D" ? CACHE_TTL.HISTORICAL_30MIN : CACHE_TTL.HISTORICAL;
    setCachedData(cacheKey, historicalData, cacheTTL);
    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function calculatePercentChange(currentPrice, previousPrice) {
  if (previousPrice === 0) return 0;
  return (currentPrice - previousPrice) / previousPrice * 100;
}
async function getStockPerformance(symbol, timeFrame) {
  const cacheKey = `performance_${symbol}_${timeFrame}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  try {
    const [currentQuote, historicalData] = await Promise.all([
      getStockQuote(symbol),
      getHistoricalData(symbol, timeFrame)
    ]);
    if (!historicalData || historicalData.length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }
    const sortedData = historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startPrice = sortedData[0].close;
    const currentPrice = currentQuote.price;
    const change = currentPrice - startPrice;
    const percentChange = calculatePercentChange(currentPrice, startPrice);
    const performance = {
      symbol,
      timeFrame,
      currentPrice,
      previousPrice: startPrice,
      // Use start price as previous price for timeframe calculations
      startPrice,
      change,
      percentChange
    };
    setCachedData(cacheKey, performance, CACHE_TTL.QUOTE);
    return performance;
  } catch (error) {
    console.error(`Error fetching performance for ${symbol}:`, error);
    throw new Error(`Failed to fetch performance for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function getCompanyProfile(symbol) {
  const cacheKey = `profile_${symbol}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  try {
    const [quoteResult, summaryResult] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: ["summaryProfile", "defaultKeyStatistics", "price"]
      }).catch(() => null)
    ]);
    if (!quoteResult) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }
    const profile = {
      name: quoteResult.longName || quoteResult.shortName || symbol,
      description: summaryResult?.summaryProfile?.longBusinessSummary || "No description available",
      sector: summaryResult?.summaryProfile?.sector || "N/A",
      industry: summaryResult?.summaryProfile?.industry || "N/A",
      marketCap: quoteResult.marketCap || 0,
      volume: quoteResult.regularMarketVolume || 0,
      currency: quoteResult.currency || "USD",
      exchange: quoteResult.fullExchangeName || "N/A",
      website: summaryResult?.summaryProfile?.website || void 0,
      employees: summaryResult?.summaryProfile?.fullTimeEmployees || void 0
    };
    setCachedData(cacheKey, profile, CACHE_TTL.PROFILE);
    return profile;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    throw new Error(`Failed to fetch profile for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function getMultipleQuotes(symbols) {
  const promises = symbols.map(
    (symbol) => getStockQuote(symbol).catch((error) => {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    })
  );
  const results = await Promise.all(promises);
  return results.filter((quote) => quote !== null);
}
async function getPopularStocks() {
  const popularSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "NFLX"];
  return getMultipleQuotes(popularSymbols);
}
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp >= value.ttl) {
      cache.delete(key);
    }
  }
}
var cache, CACHE_TTL;
var init_yahooFinance = __esm({
  "server/services/yahooFinance.ts"() {
    "use strict";
    cache = /* @__PURE__ */ new Map();
    CACHE_TTL = {
      QUOTE: 5 * 60 * 1e3,
      // 5 minutes
      HISTORICAL: 30 * 60 * 1e3,
      // 30 minutes - for daily data
      HISTORICAL_MINUTE: 2 * 60 * 1e3,
      // 2 minutes - for minute data (1D)
      HISTORICAL_30MIN: 5 * 60 * 1e3,
      // 5 minutes - for 30-minute data (5D)
      PROFILE: 60 * 60 * 1e3,
      // 1 hour
      SEARCH: 30 * 60 * 1e3
      // 30 minutes
    };
    setInterval(clearExpiredCache, 10 * 60 * 1e3);
  }
});

// server/services/tournamentExpiration.ts
var tournamentExpiration_exports = {};
__export(tournamentExpiration_exports, {
  TournamentExpirationService: () => TournamentExpirationService,
  tournamentExpirationService: () => tournamentExpirationService
});
var TournamentExpirationService, tournamentExpirationService;
var init_tournamentExpiration = __esm({
  "server/services/tournamentExpiration.ts"() {
    "use strict";
    init_storage();
    init_yahooFinance();
    TournamentExpirationService = class {
      /**
       * Check for expired tournaments and process them
       */
      async processExpiredTournaments() {
        await this.startWaitingTournaments();
        const expiredTournaments = await storage.getExpiredTournaments();
        for (const tournament of expiredTournaments) {
          console.log(`Processing expired tournament: ${tournament.name} (ID: ${tournament.id})`);
          const results = await this.calculateFinalStandings(tournament.id);
          await this.distributePrizeMoney(tournament, results);
          await this.awardTournamentAchievements(tournament.id, results);
          await storage.updateTournamentStatus(tournament.id, "completed", /* @__PURE__ */ new Date());
          console.log(`Tournament ${tournament.name} completed successfully`);
        }
      }
      /**
       * Start waiting tournaments that should be active
       */
      async startWaitingTournaments() {
        const waitingTournaments = await storage.getWaitingTournaments();
        console.log(`Found ${waitingTournaments.length} waiting tournaments`);
        const now = /* @__PURE__ */ new Date();
        for (const tournament of waitingTournaments) {
          if (tournament.scheduledStartTime && tournament.scheduledStartTime <= now) {
            const currentPlayers = tournament.currentPlayers || 0;
            if (currentPlayers < 2) {
              console.log(`Cancelling tournament: ${tournament.name} (ID: ${tournament.id}) - insufficient players (${currentPlayers}/2)`);
              await storage.cancelTournament(tournament.id, "Insufficient players - minimum 2 players required to start");
              if (tournament.buyInAmount && tournament.buyInAmount > 0) {
                await storage.addUserBalance(tournament.creatorId, tournament.buyInAmount);
                console.log(`Refunded $${tournament.buyInAmount} to creator (user ${tournament.creatorId})`);
              }
            } else {
              console.log(`Starting tournament: ${tournament.name} (ID: ${tournament.id}) - scheduled start time reached with ${currentPlayers} players`);
              await storage.updateTournamentStatus(tournament.id, "active", /* @__PURE__ */ new Date());
            }
          } else if (tournament.scheduledStartTime) {
            const timeUntilStart = tournament.scheduledStartTime.getTime() - now.getTime();
            const minutesUntilStart = Math.ceil(timeUntilStart / (1e3 * 60));
            console.log(`Tournament ${tournament.name} (ID: ${tournament.id}) starts in ${minutesUntilStart} minutes`);
          }
        }
      }
      /**
       * Calculate final standings for a tournament
       */
      async calculateFinalStandings(tournamentId) {
        const participants = await storage.getTournamentParticipants(tournamentId);
        const results = [];
        for (const participant of participants) {
          const purchases = await storage.getTournamentStockPurchases(tournamentId, participant.userId);
          let totalValue = participant.balance;
          for (const purchase of purchases) {
            try {
              const currentQuote = await getStockQuote(purchase.symbol);
              const currentValue = purchase.shares * Number(currentQuote.price);
              totalValue += currentValue;
            } catch (error) {
              console.error(`Error fetching quote for ${purchase.symbol}:`, error);
              totalValue += purchase.shares * Number(purchase.purchasePrice);
            }
          }
          results.push({
            userId: participant.userId,
            finalBalance: participant.balance,
            totalValue,
            rank: 0,
            // Will be set after sorting
            firstName: participant.firstName,
            lastName: participant.lastName
          });
        }
        results.sort((a, b) => b.totalValue - a.totalValue);
        results.forEach((result, index2) => {
          result.rank = index2 + 1;
        });
        return results;
      }
      /**
       * Distribute prize money to the tournament winner and creator
       */
      async distributePrizeMoney(tournament, results) {
        if (results.length === 0 || !tournament.currentPot || Number(tournament.currentPot) <= 0) {
          console.log(`No prize money to distribute for tournament ${tournament.name} (pot: ${tournament.currentPot})`);
          return;
        }
        const winner = results.find((result) => result.rank === 1);
        if (!winner) {
          console.log(`No winner found for tournament ${tournament.name}`);
          return;
        }
        const totalPot = Number(tournament.currentPot);
        const winnerAmount = Math.round(totalPot * 0.95 * 100) / 100;
        const creatorAmount = Math.round(totalPot * 0.05 * 100) / 100;
        try {
          await storage.addUserBalance(winner.userId, winnerAmount);
          await storage.addUserBalance(tournament.creatorId, creatorAmount);
          console.log(`Distributed $${winnerAmount} (95%) to winner user ${winner.userId} (${winner.firstName} ${winner.lastName}) and $${creatorAmount} (5%) to creator user ${tournament.creatorId} for tournament ${tournament.name}`);
        } catch (error) {
          console.error(`Failed to distribute prize money for tournament ${tournament.name}:`, error);
        }
      }
      /**
       * Award achievements based on tournament results
       */
      async awardTournamentAchievements(tournamentId, results) {
        for (const result of results) {
          const { userId, rank, totalValue } = result;
          if (rank === 1) {
            await this.awardGlobalAchievement(userId, {
              type: "tournament_winner",
              tier: "legendary",
              name: "Tournament Champion",
              description: "Won 1st place in a tournament"
            });
          } else if (rank === 2) {
            await this.awardGlobalAchievement(userId, {
              type: "tournament_second",
              tier: "epic",
              name: "Silver Medalist",
              description: "Finished 2nd in a tournament"
            });
          } else if (rank === 3) {
            await this.awardGlobalAchievement(userId, {
              type: "tournament_third",
              tier: "rare",
              name: "Bronze Medalist",
              description: "Finished 3rd in a tournament"
            });
          } else if (rank <= 5) {
            await this.awardGlobalAchievement(userId, {
              type: "tournament_top5",
              tier: "uncommon",
              name: "Top 5 Finisher",
              description: "Finished in the top 5 of a tournament"
            });
          }
          if (totalValue >= 15e3) {
            await this.awardGlobalAchievement(userId, {
              type: "high_performer",
              tier: "epic",
              name: "High Performer",
              description: "Achieved over 50% profit in a tournament"
            });
          } else if (totalValue >= 12e3) {
            await this.awardGlobalAchievement(userId, {
              type: "profit_maker",
              tier: "rare",
              name: "Profit Maker",
              description: "Achieved over 20% profit in a tournament"
            });
          }
          if (rank === 1) {
            await storage.incrementTournamentWins(userId);
            const winCount = await storage.getTournamentWins(userId);
            if (winCount >= 10) {
              await this.awardGlobalAchievement(userId, {
                type: "tournament_legend",
                tier: "mythic",
                name: "Tournament Legend",
                description: "Won 10 tournaments"
              });
            }
          }
        }
      }
      /**
       * Award a global achievement to a user (max 1 per person)
       */
      async awardGlobalAchievement(userId, achievement) {
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
      async isTournamentExpired(tournamentId) {
        const tournament = await storage.getTournamentByCode("");
        if (!tournament) return false;
        const createdAt = new Date(tournament.createdAt);
        const timeframeDays = this.parseTimeframe(tournament.timeframe);
        const expirationDate = new Date(createdAt.getTime() + timeframeDays * 24 * 60 * 60 * 1e3);
        return /* @__PURE__ */ new Date() > expirationDate;
      }
      /**
       * Parse timeframe string to days
       */
      parseTimeframe(timeframe) {
        const match = timeframe.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
        if (!match) return 28;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
          case "day":
          case "days":
            return value;
          case "week":
          case "weeks":
            return value * 7;
          case "month":
          case "months":
            return value * 30;
          default:
            return 28;
        }
      }
    };
    tournamentExpirationService = new TournamentExpirationService();
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/auth.ts
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual } from "crypto";
import { promisify as promisify2 } from "util";
import connectPg from "connect-pg-simple";
var scryptAsync2 = promisify2(scrypt2);
async function comparePasswords(supplied, stored) {
  if (!stored.includes(".")) {
    return supplied === stored;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync2(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    tableName: "sessions"
  });
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !await comparePasswords(password, user.password)) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      console.log("=== Registration Request Started ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      const { email, username, password, country, language, currency } = req.body;
      if (!email || !username || !password) {
        console.error("Missing required fields:", { email: !!email, username: !!username, password: !!password });
        return res.status(400).json({ message: "Email, username, and password are required" });
      }
      console.log("Checking if user exists with email:", email);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log("User already exists with email:", email);
        return res.status(400).json({ message: "User already exists with this email" });
      }
      if (!username || username.length < 3 || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        console.error("Invalid username:", username);
        return res.status(400).json({ message: "Username must be 3-15 characters and contain only letters, numbers, and underscores" });
      }
      console.log("Checking if username is taken:", username);
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        console.log("Username already taken:", username);
        return res.status(400).json({ message: "Username is already taken" });
      }
      const userData = {
        email,
        username,
        password,
        country: country || null,
        language: language || "English",
        currency: currency || "USD",
        subscriptionTier: "free",
        premiumUpgradeDate: null
      };
      console.log("Creating user with data:", { ...userData, password: "[REDACTED]" });
      const user = await storage.createUser(userData);
      console.log("User created successfully:", { id: user.id, userId: user.userId, username: user.username });
      console.log("Logging user in automatically");
      req.login(user, (err) => {
        if (err) {
          console.error("Error during automatic login:", err);
          return next(err);
        }
        console.log("User logged in successfully");
        res.status(201).json({
          id: user.id,
          userId: user.userId,
          email: user.email,
          username: user.username,
          country: user.country,
          language: user.language,
          currency: user.currency,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
        console.log("=== Registration Request Completed Successfully ===");
      });
    } catch (error) {
      console.error("=== Registration Error ===");
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      console.error("Full error object:", error);
      res.status(500).json({
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        res.json({
          id: user.id,
          userId: user.userId,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const freshUser = await storage.getUser(req.user.id);
      if (!freshUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: freshUser.id,
        userId: freshUser.userId,
        email: freshUser.email,
        username: freshUser.username,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        subscriptionTier: freshUser.subscriptionTier,
        siteCash: freshUser.siteCash,
        balance: freshUser.balance,
        createdAt: freshUser.createdAt,
        updatedAt: freshUser.updatedAt
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// server/routes.ts
init_schema();

// server/routes/api.ts
init_yahooFinance();
import { Router } from "express";

// server/services/exchangeRates.ts
import yahooFinance2 from "yahoo-finance2";
import memoize from "memoizee";
var getCachedExchangeRate = memoize(
  async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return 1;
    try {
      const symbol = `${fromCurrency}${toCurrency}=X`;
      const quote = await yahooFinance2.quote(symbol);
      const rate = quote.regularMarketPrice;
      if (!rate || typeof rate !== "number") {
        throw new Error(`Invalid exchange rate for ${symbol}`);
      }
      return rate;
    } catch (error) {
      console.error(`Error fetching exchange rate ${fromCurrency}/${toCurrency}:`, error);
      return 1;
    }
  },
  { maxAge: 15 * 60 * 1e3 }
  // 15 minutes cache
);
async function getExchangeRate(fromCurrency, toCurrency) {
  return getCachedExchangeRate(fromCurrency, toCurrency);
}
async function convertCurrency(amount, fromCurrency, toCurrency) {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}
var supportedCurrencies = [
  "USD",
  "BRL",
  "ARS",
  "MXN",
  "CAD",
  "COP",
  "CLP",
  "PEN",
  "UYU",
  "EUR"
];
async function getAllExchangeRates(baseCurrency) {
  const rates = {};
  for (const currency of supportedCurrencies) {
    if (currency !== baseCurrency) {
      rates[currency] = await getExchangeRate(baseCurrency, currency);
    } else {
      rates[currency] = 1;
    }
  }
  return rates;
}

// server/utils/errorHandler.ts
var CustomError = class extends Error {
  statusCode;
  isOperational;
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var ValidationError = class extends CustomError {
  constructor(message) {
    super(message, 400);
  }
};
var NotFoundError = class extends CustomError {
  constructor(message) {
    super(message, 404);
  }
};
function logError(error, req) {
  const timestamp3 = (/* @__PURE__ */ new Date()).toISOString();
  const url = req ? `${req.method} ${req.url}` : "Unknown";
  console.error(`[${timestamp3}] ${url} - ${error.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(error.stack);
  }
}
function errorHandler(error, req, res, next) {
  logError(error, req);
  if ("isOperational" in error && error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode
    });
    return;
  }
  if (error.message.includes("Not Found") || error.message.includes("Invalid symbol")) {
    res.status(404).json({
      success: false,
      error: "Symbol not found",
      statusCode: 404
    });
    return;
  }
  if (error.message.includes("Rate limit") || error.message.includes("429")) {
    res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      statusCode: 429
    });
    return;
  }
  if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
    res.status(503).json({
      success: false,
      error: "Service temporarily unavailable. Please try again.",
      statusCode: 503
    });
    return;
  }
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    statusCode: 500
  });
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
function validateSymbol(symbol) {
  const symbolRegex = /^[A-Za-z0-9.-]{1,10}$/;
  return symbolRegex.test(symbol);
}
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, "");
}

// server/routes/api.ts
init_storage();
init_db();
import { sql as sql2 } from "drizzle-orm";
var router = Router();
router.get("/quote/:symbol", asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  if (!validateSymbol(symbol)) {
    throw new ValidationError("Invalid symbol format");
  }
  try {
    const quote = await getStockQuote(symbol);
    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    throw new NotFoundError(`Stock quote not found for symbol: ${symbol}`);
  }
}));
router.get("/search/:query", asyncHandler(async (req, res) => {
  const query = sanitizeInput(req.params.query);
  if (!query || query.length < 2) {
    throw new ValidationError("Query must be at least 2 characters long");
  }
  const results = await searchStocks(query);
  res.json({
    success: true,
    data: results
  });
}));
router.get("/historical/:symbol", asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.query.timeframe || "1M");
  if (!validateSymbol(symbol)) {
    throw new ValidationError("Invalid symbol format");
  }
  const validTimeframes = ["1H", "1D", "5D", "1W", "1M", "3M", "6M", "YTD", "1Y", "5Y"];
  if (!validTimeframes.includes(timeFrame)) {
    throw new ValidationError("Invalid timeframe. Valid timeframes: " + validTimeframes.join(", "));
  }
  try {
    const historicalData = await getHistoricalData(symbol, timeFrame);
    res.json({
      success: true,
      data: historicalData,
      timeFrame
    });
  } catch (error) {
    throw new NotFoundError(`Historical data not found for symbol: ${symbol}`);
  }
}));
router.get("/historical/:symbol/:timeframe", asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.params.timeframe.toUpperCase());
  if (!validateSymbol(symbol)) {
    throw new ValidationError("Invalid symbol format");
  }
  const validTimeframes = ["1H", "1D", "5D", "1W", "1M", "3M", "6M", "YTD", "1Y", "5Y"];
  if (!validTimeframes.includes(timeFrame)) {
    throw new ValidationError("Invalid timeframe. Valid timeframes: " + validTimeframes.join(", "));
  }
  try {
    const historicalData = await getHistoricalData(symbol, timeFrame);
    res.json({
      success: true,
      data: historicalData,
      timeFrame
    });
  } catch (error) {
    throw new NotFoundError(`Historical data not found for symbol: ${symbol}`);
  }
}));
router.get("/performance/:symbol/:timeframe", asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  const timeFrame = sanitizeInput(req.params.timeframe.toUpperCase());
  if (!validateSymbol(symbol)) {
    throw new ValidationError("Invalid symbol format");
  }
  const validTimeframes = ["1H", "1D", "5D", "1W", "1M", "3M", "6M", "YTD", "1Y", "5Y"];
  if (!validTimeframes.includes(timeFrame)) {
    throw new ValidationError("Invalid timeframe. Valid timeframes: " + validTimeframes.join(", "));
  }
  try {
    const performance = await getStockPerformance(symbol, timeFrame);
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    throw new NotFoundError(`Performance data not found for symbol: ${symbol}`);
  }
}));
router.get("/summary/:symbol", asyncHandler(async (req, res) => {
  const symbol = sanitizeInput(req.params.symbol.toUpperCase());
  if (!validateSymbol(symbol)) {
    throw new ValidationError("Invalid symbol format");
  }
  try {
    const profile = await getCompanyProfile(symbol);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    throw new NotFoundError(`Company profile not found for symbol: ${symbol}`);
  }
}));
router.get("/popular", asyncHandler(async (req, res) => {
  const popularStocks = await getPopularStocks();
  res.json({
    success: true,
    data: popularStocks
  });
}));
router.get("/sectors", asyncHandler(async (req, res) => {
  const sectors = getAllSectors();
  res.json({
    success: true,
    data: sectors
  });
}));
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Yahoo Finance API is healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/tournaments", requireAuth, asyncHandler(async (req, res) => {
  const {
    name,
    maxPlayers,
    tournamentType,
    startingBalance,
    duration,
    scheduledStartTime,
    buyInAmount,
    tradingRestriction,
    isPublic
  } = req.body;
  const userId = req.user.id;
  console.log("[Tournament Creation] Request body:", JSON.stringify(req.body, null, 2));
  if (!userId) {
    throw new ValidationError("User not authenticated");
  }
  const user = await storage.getUser(userId);
  console.log("[Tournament Creation] User:", userId, "Balance:", user?.siteCash);
  if (!name || !startingBalance) {
    throw new ValidationError("Tournament name and starting balance are required");
  }
  const buyIn = parseFloat(buyInAmount) || 0;
  console.log("[Tournament Creation] Buy-in amount:", buyIn);
  const startTime = scheduledStartTime ? new Date(scheduledStartTime) : /* @__PURE__ */ new Date();
  console.log("[Tournament Creation] Start time:", startTime);
  const tournamentData = {
    name: sanitizeInput(name),
    maxPlayers: maxPlayers || 10,
    tournamentType: tournamentType || "stocks",
    startingBalance: parseFloat(startingBalance).toString(),
    timeframe: duration || "1 week",
    scheduledStartTime: startTime,
    buyInAmount: buyIn.toString(),
    tradingRestriction: tradingRestriction || "none",
    isPublic: isPublic !== void 0 ? isPublic : true
  };
  console.log("[Tournament Creation] Tournament data:", JSON.stringify(tournamentData, null, 2));
  const tournament = await storage.createTournament(tournamentData, userId);
  const now = /* @__PURE__ */ new Date();
  if (startTime <= now) {
    console.log("[Tournament Creation] Activating tournament immediately");
    await storage.updateTournament(tournament.id, {
      status: "active",
      startedAt: now
    });
  }
  try {
    await storage.awardAchievement({
      userId,
      achievementType: "tournament_creator",
      achievementTier: "rare",
      achievementName: "Tournament Creator",
      achievementDescription: "Created a tournament"
    });
    await storage.awardAchievement({
      userId,
      achievementType: "tournament_participant",
      achievementTier: "common",
      achievementName: "Tournament Participant",
      achievementDescription: "Joined a tournament"
    });
  } catch (error) {
    console.error("Failed to award achievements:", error);
  }
  res.json({
    success: true,
    data: tournament
  });
}));
router.post("/tournaments/:id/start-early", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError("Tournament not found");
  }
  if (tournament.creatorId !== userId) {
    throw new ValidationError("Only tournament creators can start tournaments early");
  }
  if (tournament.status !== "waiting") {
    throw new ValidationError("Tournament has already started or ended");
  }
  await storage.updateTournament(tournamentId, {
    status: "active",
    startedAt: /* @__PURE__ */ new Date()
  });
  res.json({
    success: true,
    message: "Tournament started successfully"
  });
}));
router.delete("/tournaments/:id/cancel", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError("Tournament not found");
  }
  if (tournament.creatorId !== userId) {
    throw new ValidationError("Only tournament creators can cancel tournaments");
  }
  if (tournament.isPublic) {
    throw new ValidationError("Only private tournaments can be cancelled");
  }
  if (tournament.status !== "waiting") {
    throw new ValidationError("Cannot cancel tournaments that have already started");
  }
  await storage.deleteTournament(tournamentId);
  res.json({
    success: true,
    message: "Tournament cancelled successfully"
  });
}));
router.delete("/tournaments/:id/participants/:participantId", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const participantId = parseInt(req.params.participantId);
  const userId = req.user.id;
  if (isNaN(tournamentId) || isNaN(participantId)) {
    throw new ValidationError("Invalid tournament or participant ID");
  }
  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError("Tournament not found");
  }
  if (tournament.creatorId !== userId) {
    throw new ValidationError("Only tournament creators can kick participants");
  }
  if (tournament.isPublic) {
    throw new ValidationError("Cannot kick participants from public tournaments");
  }
  if (tournament.status !== "waiting") {
    throw new ValidationError("Cannot kick participants from tournaments that have already started");
  }
  if (participantId === userId) {
    throw new ValidationError("Tournament creators cannot kick themselves");
  }
  await storage.removeTournamentParticipant(tournamentId, participantId);
  res.json({
    success: true,
    message: "Participant removed successfully"
  });
}));
router.post("/tournaments/code/:code/join", requireAuth, asyncHandler(async (req, res) => {
  const code = sanitizeInput(req.params.code.toUpperCase());
  const userId = req.user.id;
  if (!userId) {
    throw new ValidationError("User not authenticated");
  }
  const tournament = await storage.getTournamentByCode(code);
  if (!tournament) {
    throw new NotFoundError("Tournament not found");
  }
  if (tournament.currentPlayers >= tournament.maxPlayers) {
    throw new ValidationError("Tournament is full");
  }
  try {
    const participant = await storage.joinTournament(tournament.id, userId);
    await storage.awardAchievement({
      userId,
      achievementType: "tournament_participant",
      achievementTier: "common",
      achievementName: "Tournament Participant",
      achievementDescription: "Joined a tournament",
      earnedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    });
    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    if (error.message === "User is already participating in this tournament") {
      throw new ValidationError("You are already participating in this tournament");
    }
    throw error;
  }
}));
router.post("/tournaments/:id/join", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  if (!userId) {
    throw new ValidationError("User not authenticated");
  }
  const tournament = await storage.getTournamentById(tournamentId);
  if (!tournament) {
    throw new NotFoundError("Tournament not found");
  }
  if (tournament.currentPlayers >= tournament.maxPlayers) {
    throw new ValidationError("Tournament is full");
  }
  try {
    const participant = await storage.joinTournament(tournament.id, userId);
    await storage.awardAchievement({
      userId,
      achievementType: "tournament_participant",
      achievementTier: "common",
      achievementName: "Tournament Participant",
      achievementDescription: "Joined a tournament",
      earnedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    });
    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    if (error.message === "User is already participating in this tournament") {
      throw new ValidationError("You are already participating in this tournament");
    }
    throw error;
  }
}));
router.get("/tournaments", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tournaments2 = await storage.getUserTournaments(userId);
  res.json({
    success: true,
    data: tournaments2
  });
}));
router.get("/tournaments/public", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const publicTournaments = await storage.getPublicTournaments();
  res.json({
    success: true,
    data: publicTournaments
  });
}));
router.get("/tournaments/:id/leaderboard", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const participants = await storage.getTournamentParticipants(tournamentId);
  const participantsWithValues = await Promise.all(
    participants.map(async (participant) => {
      let stockValue = 0;
      const stockSymbols = [...new Set(participant.stockPurchases.map((p) => p.symbol))];
      const stockPrices = {};
      for (const symbol of stockSymbols) {
        try {
          const { getStockQuote: getStockQuote2 } = await Promise.resolve().then(() => (init_yahooFinance(), yahooFinance_exports));
          const quote = await getStockQuote2(symbol);
          stockPrices[symbol] = quote.price;
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          stockPrices[symbol] = 0;
        }
      }
      const stockHoldings = {};
      participant.stockPurchases.forEach((purchase) => {
        const symbol = purchase.symbol;
        const quantity = parseInt(purchase.shares);
        const price = parseFloat(purchase.purchasePrice);
        if (!stockHoldings[symbol]) {
          stockHoldings[symbol] = { quantity: 0, averagePrice: 0 };
        }
        const currentHolding = stockHoldings[symbol];
        const totalQuantity = currentHolding.quantity + quantity;
        const totalCost = currentHolding.quantity * currentHolding.averagePrice + quantity * price;
        stockHoldings[symbol] = {
          quantity: totalQuantity,
          averagePrice: totalCost / totalQuantity
        };
      });
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
  participantsWithValues.sort((a, b) => b.portfolioValue - a.portfolioValue);
  res.json({
    success: true,
    participants: participantsWithValues
  });
}));
router.get("/tournaments/:id/participants", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const participants = await storage.getTournamentParticipants(tournamentId);
  const participantsWithValues = await Promise.all(
    participants.map(async (participant) => {
      let stockValue = 0;
      const stockSymbols = [...new Set(participant.stockPurchases.map((p) => p.symbol))];
      const stockPrices = {};
      for (const symbol of stockSymbols) {
        try {
          const { getStockQuote: getStockQuote2 } = await Promise.resolve().then(() => (init_yahooFinance(), yahooFinance_exports));
          const quote = await getStockQuote2(symbol);
          stockPrices[symbol] = quote.price;
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          stockPrices[symbol] = 0;
        }
      }
      const stockHoldings = {};
      participant.stockPurchases.forEach((purchase) => {
        const symbol = purchase.symbol;
        const quantity = parseInt(purchase.shares);
        const price = parseFloat(purchase.purchasePrice);
        if (!stockHoldings[symbol]) {
          stockHoldings[symbol] = { quantity: 0, averagePrice: 0 };
        }
        const currentHolding = stockHoldings[symbol];
        const totalQuantity = currentHolding.quantity + quantity;
        const totalCost = currentHolding.quantity * currentHolding.averagePrice + quantity * price;
        stockHoldings[symbol] = {
          quantity: totalQuantity,
          averagePrice: totalCost / totalQuantity
        };
      });
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
  participantsWithValues.sort((a, b) => b.totalValue - a.totalValue);
  res.json({
    success: true,
    data: participantsWithValues
  });
}));
router.get("/tournaments/:id/balance", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const balance = await storage.getTournamentBalance(tournamentId, userId);
  res.json({
    success: true,
    data: { balance }
  });
}));
router.get("/tournaments/:id/purchases", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const purchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  res.json({
    success: true,
    data: purchases
  });
}));
router.get("/portfolio/tournament/:id", requireAuth, asyncHandler(async (req, res) => {
  console.log("Tournament portfolio route hit, user:", req.user);
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  const purchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  const stockHoldings = {};
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
  for (const holding of Object.values(stockHoldings)) {
    try {
      const quote = await getStockQuote(holding.symbol);
      holding.currentPrice = quote.price;
      holding.currentValue = holding.shares * quote.price;
      holding.profitLoss = holding.currentValue - holding.totalCost;
      holding.profitLossPercent = holding.profitLoss / holding.totalCost * 100;
    } catch (error) {
      console.error(`Error fetching quote for ${holding.symbol}:`, error);
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
router.post("/tournaments/:id/sell", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const { symbol, sharesToSell, currentPrice } = req.body;
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  if (!symbol || !sharesToSell || !currentPrice) {
    throw new ValidationError("Symbol, shares to sell, and current price are required");
  }
  const sharesToSellNum = parseInt(sharesToSell);
  if (isNaN(sharesToSellNum) || sharesToSellNum <= 0) {
    throw new ValidationError("Invalid number of shares to sell");
  }
  const tournaments2 = await storage.getAllTournaments();
  const tournament = tournaments2.find((t) => t.id === tournamentId);
  if (tournament && tournament.status === "completed") {
    throw new ValidationError("Cannot trade in completed tournaments");
  }
  const allPurchases = await storage.getTournamentStockPurchases(tournamentId, userId);
  const symbolPurchases = allPurchases.filter((p) => p.symbol === symbol);
  if (symbolPurchases.length === 0) {
    throw new ValidationError("No holdings found for this stock");
  }
  const totalShares = symbolPurchases.reduce((sum, purchase) => sum + purchase.shares, 0);
  if (sharesToSellNum > totalShares) {
    throw new ValidationError(`Cannot sell ${sharesToSellNum} shares. You only own ${totalShares} shares.`);
  }
  const saleValue = sharesToSellNum * parseFloat(currentPrice);
  const currentBalance = await storage.getTournamentBalance(tournamentId, userId);
  let remainingToSell = sharesToSellNum;
  for (const purchase of symbolPurchases) {
    if (remainingToSell <= 0) break;
    if (purchase.shares <= remainingToSell) {
      remainingToSell -= purchase.shares;
      await storage.deleteTournamentPurchase(tournamentId, userId, purchase.id);
    } else {
      const newShares = purchase.shares - remainingToSell;
      const purchasePrice = parseFloat(purchase.purchasePrice);
      await storage.deleteTournamentPurchase(tournamentId, userId, purchase.id);
      await storage.purchaseTournamentStock(tournamentId, userId, {
        symbol: purchase.symbol,
        companyName: purchase.companyName,
        shares: newShares,
        purchasePrice,
        totalCost: newShares * purchasePrice
      });
      remainingToSell = 0;
    }
  }
  await storage.updateTournamentBalance(tournamentId, userId, currentBalance + saleValue);
  const firstPurchase = symbolPurchases[0];
  await storage.recordTrade({
    userId,
    tournamentId,
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(firstPurchase.companyName),
    tradeType: "sell",
    shares: sharesToSellNum,
    price: parseFloat(currentPrice).toString(),
    totalValue: saleValue.toString()
  });
  res.json({
    success: true,
    data: {
      saleValue,
      newBalance: currentBalance + saleValue,
      sharesSold: sharesToSellNum
    }
  });
}));
router.post("/tournaments/:id/purchase", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const userId = req.user.id;
  const { symbol, companyName, shares, purchasePrice } = req.body;
  if (!symbol || !companyName || !shares || !purchasePrice) {
    throw new ValidationError("All purchase fields are required");
  }
  const totalCost = shares * purchasePrice;
  const tournaments2 = await storage.getAllTournaments();
  const tournament = tournaments2.find((t) => t.id === tournamentId);
  if (tournament && tournament.status === "completed") {
    throw new ValidationError("Cannot trade in completed tournaments");
  }
  const currentBalance = await storage.getTournamentBalance(tournamentId, userId);
  if (currentBalance < totalCost) {
    throw new ValidationError("Insufficient balance for this purchase");
  }
  const purchase = await storage.purchaseTournamentStock(tournamentId, userId, {
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(companyName),
    shares: parseInt(shares),
    purchasePrice: parseFloat(purchasePrice).toString(),
    totalCost: totalCost.toString()
  });
  await storage.recordTrade({
    userId,
    tournamentId,
    symbol: sanitizeInput(symbol),
    companyName: sanitizeInput(companyName),
    tradeType: "buy",
    shares: parseInt(shares),
    price: parseFloat(purchasePrice).toString(),
    totalValue: totalCost.toString()
  });
  await storage.updateTournamentBalance(tournamentId, userId, currentBalance - totalCost);
  await storage.awardAchievement({
    userId,
    achievementType: "first_trade",
    achievementTier: "common",
    achievementName: "First Trade",
    achievementDescription: "Made your first trade"
  });
  res.status(201).json({
    success: true,
    data: { purchase }
  });
}));
router.get("/tournaments/leaderboard", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tournaments2 = await storage.getAllTournaments();
  const allParticipants = [];
  let activeTournaments = 0;
  for (const tournament of tournaments2) {
    if (tournament.status === "completed") {
      continue;
    }
    const participants = await storage.getTournamentParticipants(tournament.id);
    if (participants.length > 0) {
      activeTournaments++;
    }
    for (const participant of participants) {
      const purchases = await storage.getTournamentStockPurchases(tournament.id, participant.userId);
      let portfolioValue = parseFloat(participant.balance);
      for (const purchase of purchases) {
        try {
          const currentQuote = await getStockQuote(purchase.symbol);
          const currentValue = purchase.shares * currentQuote.price;
          portfolioValue += currentValue;
        } catch (error) {
          portfolioValue += purchase.shares * parseFloat(purchase.purchasePrice);
        }
      }
      const startingBalance = parseFloat(tournament.startingBalance);
      const percentageChange = (portfolioValue - startingBalance) / startingBalance * 100;
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
  allParticipants.sort((a, b) => b.percentageChange - a.percentageChange);
  if (allParticipants.length > 0) {
    const topUser = allParticipants[0];
    try {
      await storage.awardAchievement({
        userId: topUser.userId,
        achievementType: "tournament_overlord",
        achievementTier: "special",
        achievementName: "Tournament Overlord",
        achievementDescription: "Ranked #1 on tournament leaderboard"
      });
    } catch (error) {
      console.error("Error awarding Tournament Overlord achievement:", error);
    }
  }
  const userRank = allParticipants.findIndex((p) => p.userId === userId) + 1;
  res.json({
    success: true,
    data: {
      rankings: allParticipants.slice(0, 50),
      // Top 50
      totalTournaments: activeTournaments,
      totalParticipants: allParticipants.length,
      yourRank: userRank || null
    }
  });
}));
router.get("/personal/leaderboard", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const users2 = await storage.getAllUsers();
  const userPortfolios = [];
  for (const user of users2) {
    const purchases = await storage.getPersonalStockPurchases(user.id);
    let portfolioValue = parseFloat(user.personalBalance) || 1e4;
    for (const purchase of purchases) {
      try {
        const currentQuote = await getStockQuote(purchase.symbol);
        const currentValue = purchase.shares * currentQuote.price;
        portfolioValue += currentValue;
      } catch (error) {
        portfolioValue += purchase.shares * parseFloat(purchase.purchasePrice);
      }
    }
    const totalDeposited = parseFloat(user.totalDeposited) || 1e4;
    const percentageChange = (portfolioValue - totalDeposited) / totalDeposited * 100;
    userPortfolios.push({
      ...user,
      portfolioValue,
      percentageChange,
      startingBalance: totalDeposited
    });
  }
  userPortfolios.sort((a, b) => b.percentageChange - a.percentageChange);
  if (userPortfolios.length > 0) {
    const topUser = userPortfolios[0];
    try {
      await storage.awardAchievement({
        userId: topUser.id,
        achievementType: "portfolio_emperor",
        achievementTier: "special",
        achievementName: "Portfolio Emperor",
        achievementDescription: "Ranked #1 on personal portfolio leaderboard"
      });
    } catch (error) {
      console.error("Error awarding Portfolio Emperor achievement:", error);
    }
  }
  const userRank = userPortfolios.findIndex((p) => p.id === userId) + 1;
  res.json({
    success: true,
    data: {
      rankings: userPortfolios.slice(0, 50),
      // Top 50
      totalTraders: userPortfolios.length,
      premiumUsers: userPortfolios.length,
      yourRank: userRank || null
    }
  });
}));
router.get("/streak/leaderboard", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const users2 = await storage.getAllUsers();
  const userStreaks = [];
  for (const user of users2) {
    const tradingStreak = await calculateTradingStreak(user.id);
    userStreaks.push({
      ...user,
      tradingStreak
    });
  }
  userStreaks.sort((a, b) => b.tradingStreak - a.tradingStreak);
  if (userStreaks.length > 0) {
    const topUser = userStreaks[0];
    try {
      await storage.awardAchievement({
        userId: topUser.id,
        achievementType: "streak_master",
        achievementTier: "special",
        achievementName: "Streak Master",
        achievementDescription: "Ranked #1 on trading streak leaderboard"
      });
    } catch (error) {
      console.error("Error awarding Streak Master achievement:", error);
    }
  }
  const userRank = userStreaks.findIndex((p) => p.id === userId) + 1;
  res.json({
    success: true,
    data: {
      rankings: userStreaks.slice(0, 50),
      // Top 50
      totalTraders: userStreaks.length,
      premiumUsers: userStreaks.length,
      yourRank: userRank || null
    }
  });
}));
router.get("/leaderboard/total-wagered", requireAuth, asyncHandler(async (req, res) => {
  const participants = await storage.getAllTournamentParticipants();
  const userWagers = /* @__PURE__ */ new Map();
  for (const participant of participants) {
    const current = userWagers.get(participant.userId) || {
      userId: participant.userId,
      username: participant.username || "Unknown User",
      totalWagered: 0,
      tournamentCount: 0
    };
    current.totalWagered += participant.buyInAmount || 0;
    current.tournamentCount += 1;
    userWagers.set(participant.userId, current);
  }
  const rankings = Array.from(userWagers.values()).sort((a, b) => b.totalWagered - a.totalWagered);
  res.json({
    success: true,
    data: {
      rankings: rankings.slice(0, 50)
    }
  });
}));
router.get("/leaderboard/highest-wager", requireAuth, asyncHandler(async (req, res) => {
  const tournaments2 = await storage.getAllTournaments();
  const rankings = tournaments2.filter((t) => t.buyInAmount && t.buyInAmount > 0).sort((a, b) => b.buyInAmount - a.buyInAmount).map((t) => ({
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
router.get("/leaderboard/most-growth", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const participants = await storage.getAllTournamentParticipants();
  const participantGrowth = await Promise.all(participants.map(async (participant) => {
    const portfolioValue = await storage.calculatePortfolioValue(
      participant.userId,
      participant.tournamentId
    );
    const startingBalance = participant.startingBalance || 1e4;
    const percentageChange = (portfolioValue - startingBalance) / startingBalance * 100;
    const tournament = await storage.getTournamentById(participant.tournamentId);
    return {
      id: participant.id,
      userId: participant.userId,
      username: participant.username || "Unknown User",
      tournamentId: participant.tournamentId,
      tournamentName: tournament?.name || "Unknown Tournament",
      startingBalance,
      portfolioValue,
      percentageChange
    };
  }));
  const rankings = participantGrowth.sort((a, b) => b.percentageChange - a.percentageChange);
  const userRank = rankings.findIndex((p) => p.userId === userId) + 1;
  res.json({
    success: true,
    data: {
      rankings: rankings.slice(0, 50),
      yourRank: userRank || null
    }
  });
}));
router.get("/admin/users", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    return res.status(403).json({
      success: false,
      error: "Admin access required"
    });
  }
  const users2 = await storage.getAllUsers();
  res.json(users2);
}));
router.patch("/admin/users/:userId/username", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { username } = req.body;
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    return res.status(403).json({ error: "Admin access required" });
  }
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  await storage.updateUserUsername(targetUserId, username.trim());
  res.json({ success: true, message: "Username updated successfully" });
}));
router.patch("/admin/users/:userId/balance", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { amount, operation } = req.body;
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    return res.status(403).json({ error: "Admin access required" });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }
  if (!["add", "remove"].includes(operation)) {
    return res.status(400).json({ error: "Operation must be add or remove" });
  }
  await storage.adminUpdateUserBalance(targetUserId, amount, operation);
  res.json({ success: true, message: "Balance updated successfully" });
}));
router.patch("/admin/users/:userId/note", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { note } = req.body;
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    return res.status(403).json({ error: "Admin access required" });
  }
  await storage.updateUserAdminNote(targetUserId, note || "");
  res.json({ success: true, message: "Admin note updated successfully" });
}));
router.patch("/admin/users/:userId/ban", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    return res.status(403).json({ error: "Admin access required" });
  }
  await storage.banUser(targetUserId);
  res.json({ success: true, message: "User banned successfully" });
}));
router.get("/admin/tournaments", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    throw new ValidationError("Access denied. Admin privileges required.");
  }
  const allTournaments = await storage.getAllTournaments();
  const activeTournaments = allTournaments.filter((tournament) => tournament.status !== "completed");
  const tournamentsWithCounts = await Promise.all(
    activeTournaments.map(async (tournament) => {
      const participants = await storage.getTournamentParticipants(tournament.id);
      const createdAt = new Date(tournament.createdAt);
      const parseTimeframe = (timeframe) => {
        const match = timeframe.match(/(\d+)\s*(minute|minutes|day|days|week|weeks|month|months)/i);
        if (!match) return 28 * 24 * 60 * 60 * 1e3;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
          case "minute":
          case "minutes":
            return value * 60 * 1e3;
          case "day":
          case "days":
            return value * 24 * 60 * 60 * 1e3;
          case "week":
          case "weeks":
            return value * 7 * 24 * 60 * 60 * 1e3;
          case "month":
          case "months":
            return value * 30 * 24 * 60 * 60 * 1e3;
          default:
            return 28 * 24 * 60 * 60 * 1e3;
        }
      };
      const timeframeMs = parseTimeframe(tournament.timeframe);
      const endDate = new Date(createdAt.getTime() + timeframeMs);
      return {
        ...tournament,
        memberCount: participants.length,
        endsAt: endDate.toISOString()
        // Add calculated end date
      };
    })
  );
  res.json({
    success: true,
    data: tournamentsWithCounts
  });
}));
router.delete("/admin/tournaments/:id", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tournamentId = parseInt(req.params.id);
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS") {
    throw new ValidationError("Access denied. Admin privileges required.");
  }
  const tournaments2 = await storage.getAllTournaments();
  const tournament = tournaments2.find((t) => t.id === tournamentId);
  if (!tournament) {
    throw new NotFoundError("Tournament not found");
  }
  await db.execute(sql2`UPDATE trade_history SET tournament_id = NULL WHERE tournament_id = ${tournamentId}`);
  await db.execute(sql2`DELETE FROM tournament_stock_purchases WHERE tournament_id = ${tournamentId}`);
  await db.execute(sql2`DELETE FROM tournament_participants WHERE tournament_id = ${tournamentId}`);
  await db.execute(sql2`DELETE FROM tournaments WHERE id = ${tournamentId}`);
  await storage.createAdminLog({
    adminUserId: userId,
    targetUserId: tournament.creatorId,
    action: "tournament_deleted",
    oldValue: "active",
    newValue: "deleted",
    notes: `Admin deleted tournament "${tournament.name}" (${tournament.code}) completely`
  });
  res.json({
    success: true,
    message: `Tournament "${tournament.name}" has been deleted successfully`
  });
}));
router.get("/users/public", asyncHandler(async (req, res) => {
  const users2 = await storage.getAllUsers();
  const publicUsers = await Promise.all(users2.map(async (user) => {
    const achievements = await storage.getUserAchievements(user.id);
    const achievementCount = achievements.length;
    return {
      id: user.id,
      username: user.username,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
      totalTrades: user.totalTrades || 0,
      achievementCount
      // Don't include sensitive information like email, password, balances, etc.
    };
  }));
  res.json({
    success: true,
    data: publicUsers
  });
}));
router.get("/users/public/:userId", asyncHandler(async (req, res) => {
  const targetUserId = parseInt(req.params.userId);
  if (isNaN(targetUserId)) {
    throw new ValidationError("Invalid user ID");
  }
  const targetUser = await storage.getUser(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }
  const totalTrades = await storage.getUserTradeCount(targetUserId);
  const publicUser = {
    id: targetUser.id,
    username: targetUser.username,
    subscriptionTier: targetUser.subscriptionTier,
    createdAt: targetUser.createdAt,
    totalTrades
    // Don't include sensitive information like email, password, balances, etc.
  };
  res.json({
    success: true,
    data: publicUser
  });
}));
router.get("/tournaments/archived", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const archivedTournaments = await storage.getArchivedTournaments(userId);
  res.json({
    success: true,
    data: archivedTournaments
  });
}));
router.post("/tournaments/check-expiration", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await storage.getUser(userId);
  if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin" && user.username !== "LUCAS" && !req.user.email.includes("admin")) {
    throw new UnauthorizedError("Admin access required");
  }
  const { tournamentExpirationService: tournamentExpirationService2 } = await Promise.resolve().then(() => (init_tournamentExpiration(), tournamentExpiration_exports));
  await tournamentExpirationService2.processExpiredTournaments();
  res.json({
    success: true,
    message: "Expired tournaments processed successfully"
  });
}));
router.get("/portfolio-history/:userId", asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  const portfolioType = req.query.type || "personal";
  const tournamentId = req.query.tournamentId ? parseInt(req.query.tournamentId) : void 0;
  if (isNaN(userId)) {
    throw new ValidationError("Invalid user ID");
  }
  const history = await storage.getUserPortfolioHistory(userId, portfolioType, tournamentId);
  res.json({
    success: true,
    data: history
  });
}));
router.post("/portfolio-history", requireAuth, asyncHandler(async (req, res) => {
  const { userId, portfolioType, tournamentId, totalValue, cashBalance, stockValue } = req.body;
  if (!userId || !portfolioType || !totalValue || !cashBalance || !stockValue) {
    throw new ValidationError("Missing required fields");
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
router.patch("/profile/picture", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { profilePicture } = req.body;
  if (!profilePicture) {
    throw new ValidationError("Profile picture data is required");
  }
  if (!profilePicture.startsWith("data:image/")) {
    throw new ValidationError("Invalid image format");
  }
  await storage.updateProfilePicture(userId, profilePicture);
  res.json({
    success: true,
    message: "Profile picture updated successfully"
  });
}));
router.get("/chat/global", requireAuth, asyncHandler(async (req, res) => {
  const messages = await storage.getChatMessages();
  res.json({
    success: true,
    data: messages
  });
}));
router.post("/chat/global", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;
  if (!message || !message.trim()) {
    throw new ValidationError("Message is required");
  }
  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }
  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: message.trim(),
    tournamentId: null
  });
  res.json({
    success: true,
    data: chatMessage
  });
}));
router.get("/chat/global", requireAuth, asyncHandler(async (req, res) => {
  const messages = await storage.getChatMessages(null);
  res.json({
    success: true,
    data: messages
  });
}));
router.post("/chat/global", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;
  if (!message || !message.trim()) {
    throw new ValidationError("Message is required");
  }
  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }
  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: message.trim(),
    tournamentId: null
    // null for global chat
  });
  res.json({
    success: true,
    data: chatMessage
  });
}));
router.get("/chat/tournament/:tournamentId", requireAuth, asyncHandler(async (req, res) => {
  const tournamentId = parseInt(req.params.tournamentId);
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  const messages = await storage.getChatMessages(tournamentId);
  res.json({
    success: true,
    data: messages
  });
}));
router.post("/chat/tournament/:tournamentId", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tournamentId = parseInt(req.params.tournamentId);
  const { message } = req.body;
  if (isNaN(tournamentId)) {
    throw new ValidationError("Invalid tournament ID");
  }
  if (!message || !message.trim()) {
    throw new ValidationError("Message is required");
  }
  const user = await storage.getUser(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }
  const chatMessage = await storage.createChatMessage({
    userId,
    username: user.username,
    profilePicture: user.profilePicture || null,
    message: message.trim(),
    tournamentId
  });
  res.json({
    success: true,
    data: chatMessage
  });
}));
router.get("/exchange-rates/:baseCurrency", asyncHandler(async (req, res) => {
  const { baseCurrency } = req.params;
  if (!baseCurrency) {
    throw new ValidationError("Base currency is required");
  }
  const rates = await getAllExchangeRates(baseCurrency.toUpperCase());
  res.json({
    success: true,
    data: {
      baseCurrency: baseCurrency.toUpperCase(),
      rates,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
}));
router.get("/exchange-rate/:from/:to", asyncHandler(async (req, res) => {
  const { from, to } = req.params;
  if (!from || !to) {
    throw new ValidationError("Both from and to currencies are required");
  }
  const rate = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
  res.json({
    success: true,
    data: {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
}));
router.post("/convert-currency", asyncHandler(async (req, res) => {
  const { amount, from, to } = req.body;
  if (!amount || !from || !to) {
    throw new ValidationError("Amount, from currency, and to currency are required");
  }
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) {
    throw new ValidationError("Invalid amount");
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
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
}));
router.post("/tips", requireAuth, asyncHandler(async (req, res) => {
  const senderId = req.user.id;
  const { recipientId, amount } = req.body;
  if (!recipientId || !amount) {
    throw new ValidationError("Recipient ID and amount are required");
  }
  const tipAmount = parseFloat(amount);
  if (isNaN(tipAmount) || tipAmount <= 0) {
    throw new ValidationError("Invalid tip amount");
  }
  const sender = await storage.getUserById(senderId);
  if (!sender) {
    throw new NotFoundError("Sender not found");
  }
  const senderBalance = parseFloat(sender.siteCash);
  if (senderBalance < tipAmount) {
    throw new ValidationError("Insufficient balance");
  }
  const recipient = await storage.getUserById(recipientId);
  if (!recipient) {
    throw new NotFoundError("Recipient not found");
  }
  if (senderId === recipientId) {
    throw new ValidationError("You cannot tip yourself");
  }
  await storage.transferBalance(senderId, recipientId, tipAmount);
  res.json({
    success: true,
    message: `Successfully sent ${tipAmount} to ${recipient.username}`
  });
}));
var api_default = router;

// server/services/systemMonitor.ts
init_db();
import yahooFinance3 from "yahoo-finance2";
var serverStartTime = Date.now();
var activeConnections = 0;
var totalRequests = 0;
var errorCount = 0;
var responseTimes = [];
var apiHealth = {
  yahooFinance: { status: false, lastChecked: 0 }
};
function trackRequest(req, res, next) {
  const startTime = Date.now();
  totalRequests++;
  activeConnections++;
  res.on("finish", () => {
    activeConnections--;
    const responseTime = Date.now() - startTime;
    responseTimes.push(responseTime);
    if (responseTimes.length > 100) {
      responseTimes.shift();
    }
    if (res.statusCode >= 400) {
      errorCount++;
    }
  });
  next();
}
async function checkDatabaseHealth() {
  try {
    const testQuery = await db.execute("SELECT 1");
    const tableCountResult = await db.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const connectionResult = await db.execute(`
      SELECT COUNT(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    return {
      connected: true,
      tableCount: Number(tableCountResult[0]?.count || 0),
      connectionCount: Number(connectionResult[0]?.count || 0)
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      connected: false,
      tableCount: 0,
      connectionCount: 0
    };
  }
}
async function checkYahooFinanceHealth() {
  const now = Date.now();
  const oneMinute = 60 * 1e3;
  if (now - apiHealth.yahooFinance.lastChecked < oneMinute) {
    return apiHealth.yahooFinance.status;
  }
  try {
    const quote = await yahooFinance3.quote("AAPL");
    const isHealthy = quote && quote.regularMarketPrice !== void 0;
    apiHealth.yahooFinance.status = isHealthy;
    apiHealth.yahooFinance.lastChecked = now;
    return isHealthy;
  } catch (error) {
    console.error("Yahoo Finance health check failed:", error);
    apiHealth.yahooFinance.status = false;
    apiHealth.yahooFinance.lastChecked = now;
    return false;
  }
}
function getSystemUptime() {
  const uptimeMs = Date.now() - serverStartTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1e3);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);
  let uptimeFormatted = "";
  if (uptimeDays > 0) {
    uptimeFormatted = `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m`;
  } else if (uptimeHours > 0) {
    uptimeFormatted = `${uptimeHours}h ${uptimeMinutes % 60}m`;
  } else {
    uptimeFormatted = `${uptimeMinutes}m`;
  }
  const uptimePercentage = Math.min(99.9, uptimeMs / (24 * 60 * 60 * 1e3) * 99.9);
  return {
    uptimeMs,
    uptimeFormatted,
    uptimePercentage: Number(uptimePercentage.toFixed(1))
  };
}
function getErrorRate() {
  if (totalRequests === 0) return 0;
  return Number((errorCount / totalRequests * 100).toFixed(2));
}
function getAverageResponseTime() {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((acc, time) => acc + time, 0);
  return Number((sum / responseTimes.length).toFixed(0));
}
function getActiveConnections() {
  return activeConnections;
}
function getTotalRequests() {
  return totalRequests;
}
async function getSystemStatus() {
  const dbHealth = await checkDatabaseHealth();
  const yahooHealth = await checkYahooFinanceHealth();
  const uptime = getSystemUptime();
  const errorRate = getErrorRate();
  const avgResponseTime = getAverageResponseTime();
  const activeUsers = getActiveConnections();
  const totalReqs = getTotalRequests();
  return {
    database: {
      connected: dbHealth.connected,
      tableCount: dbHealth.tableCount,
      activeConnections: dbHealth.connectionCount,
      type: "PostgreSQL"
    },
    apis: {
      yahooFinance: {
        status: yahooHealth,
        lastChecked: apiHealth.yahooFinance.lastChecked,
        checkInterval: "1 minute"
      },
      cache: {
        enabled: true,
        status: "active"
      }
    },
    system: {
      uptime: uptime.uptimeFormatted,
      uptimePercentage: uptime.uptimePercentage,
      errorRate,
      avgResponseTime,
      activeUsers,
      totalRequests: totalReqs
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.use(trackRequest);
  setupAuth(app2);
  app2.use("/api", api_default);
  app2.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("Profile update request for user:", userId);
      console.log("Request body:", req.body);
      const validatedData = z2.object({
        email: z2.string().email(),
        username: z2.string().min(3, "Username must be at least 3 characters").max(15, "Username must be at most 15 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional()
      }).parse(req.body);
      console.log("Validated data:", validatedData);
      const updatedUser = await storage.updateUser(userId, validatedData);
      console.log("Updated user:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.put("/api/user/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = z2.object({
        language: z2.string().optional(),
        currency: z2.string().optional()
      }).parse(req.body);
      const updatedUser = await storage.updateUser(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
  app2.post("/api/user/balance/add", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = z2.object({
        amount: z2.number().positive("Amount must be positive")
      }).parse(req.body);
      const updatedUser = await storage.addUserBalance(userId, validatedData.amount);
      res.json({
        success: true,
        message: `Added $${validatedData.amount} to your balance`,
        newBalance: Number(updatedUser.balance)
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid amount", errors: error.errors });
      }
      console.error("Error adding balance:", error);
      res.status(500).json({ message: "Failed to add balance" });
    }
  });
  app2.post("/api/user/balance/withdraw", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = z2.object({
        amount: z2.number().positive("Amount must be positive")
      }).parse(req.body);
      const user = await storage.getUserById(userId);
      const currentBalance = Number(user?.balance || 0);
      if (currentBalance < validatedData.amount) {
        return res.status(400).json({
          message: "Insufficient balance",
          currentBalance,
          requestedAmount: validatedData.amount
        });
      }
      const updatedUser = await storage.subtractUserBalance(userId, validatedData.amount);
      res.json({
        success: true,
        message: `Withdrew $${validatedData.amount} from your balance`,
        newBalance: Number(updatedUser.balance)
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid amount", errors: error.errors });
      }
      console.error("Error withdrawing balance:", error);
      res.status(500).json({ message: "Failed to withdraw balance" });
    }
  });
  app2.get("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const watchlist2 = await storage.getUserWatchlist(userId);
      res.json(watchlist2);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });
  app2.post("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertWatchlistSchema.parse(req.body);
      let companyName = validatedData.companyName;
      if (companyName === validatedData.symbol || !companyName) {
        try {
          const { getCompanyProfile: getCompanyProfile2 } = await Promise.resolve().then(() => (init_yahooFinance(), yahooFinance_exports));
          const profile = await getCompanyProfile2(validatedData.symbol);
          companyName = profile.longName || profile.shortName || validatedData.symbol;
          console.log(`Fetched company name for ${validatedData.symbol}: ${companyName}`);
        } catch (error) {
          console.log(`Could not fetch company name for ${validatedData.symbol}, using symbol`);
          companyName = validatedData.symbol;
        }
      }
      const watchlistData = {
        ...validatedData,
        companyName
      };
      const watchlistItem = await storage.addToWatchlist(userId, watchlistData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });
  app2.delete("/api/watchlist/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.removeFromWatchlist(userId, id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });
  app2.get("/api/trading/balance", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const balance = await storage.getUserBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });
  app2.post("/api/trading/purchase", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertStockPurchaseSchema.parse(req.body);
      const currentBalance = await storage.getUserBalance(userId);
      const totalCost = parseFloat(validatedData.totalCost);
      if (currentBalance < totalCost) {
        return res.status(400).json({
          message: "Insufficient balance. Purchase cancelled.",
          balance: currentBalance,
          required: totalCost
        });
      }
      const purchase = await storage.purchaseStock(userId, validatedData);
      const newBalance = currentBalance - totalCost;
      await storage.updateUserBalance(userId, newBalance);
      const hasFirstTrade = await storage.hasAchievement(userId, "First Trade");
      if (!hasFirstTrade) {
        await storage.awardAchievement({
          userId,
          achievementType: "first_trade",
          achievementTier: "common",
          achievementName: "First Trade",
          achievementDescription: "Made your first trade"
        });
      }
      res.status(201).json({
        purchase,
        newBalance
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error processing stock purchase:", error);
      res.status(500).json({ message: "Failed to process stock purchase" });
    }
  });
  app2.get("/api/trading/purchases", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const purchases = await storage.getUserStockPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });
  app2.post("/api/trading/sell", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { purchaseId, shares, salePrice, totalValue } = req.body;
      if (!purchaseId || !shares || !salePrice || !totalValue) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      await storage.deletePurchase(userId, purchaseId);
      const currentBalance = await storage.getUserBalance(userId);
      const newBalance = currentBalance + totalValue;
      await storage.updateUserBalance(userId, newBalance);
      res.status(200).json({
        message: "Stock sold successfully",
        newBalance,
        saleValue: totalValue
      });
    } catch (error) {
      console.error("Error selling stock:", error);
      res.status(500).json({ message: "Failed to sell stock" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating contact submission:", error);
      res.status(500).json({ message: "Failed to create contact submission" });
    }
  });
  app2.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      if (userId !== 0 && userId !== 1 && userId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/balance/deposit", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid deposit amount" });
      }
      if (amount < 1) {
        return res.status(400).json({ message: "Minimum deposit amount is $1.00" });
      }
      if (amount > 1e4) {
        return res.status(400).json({ message: "Maximum deposit amount is $10,000.00 per transaction" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentBalance = parseFloat(user.balance.toString());
      const newBalance = currentBalance + amount;
      await storage.updateUser(userId, {
        balance: newBalance.toString()
      });
      await storage.createAdminLog({
        adminUserId: userId,
        targetUserId: userId,
        action: "balance_deposit",
        oldValue: currentBalance.toString(),
        newValue: newBalance.toString(),
        notes: `User deposited $${amount.toFixed(2)}`
      });
      res.json({
        success: true,
        message: "Deposit successful",
        newBalance
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });
  app2.post("/api/balance/withdraw", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }
      if (amount < 1) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $1.00" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentBalance = parseFloat(user.siteCash?.toString() || "0");
      if (amount > currentBalance) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      const newBalance = currentBalance - amount;
      await storage.updateUser(userId, {
        siteCash: newBalance.toString()
      });
      await storage.createAdminLog({
        adminUserId: userId,
        targetUserId: userId,
        action: "balance_withdrawal",
        oldValue: currentBalance.toString(),
        newValue: newBalance.toString(),
        notes: `User withdrew $${amount.toFixed(2)}`
      });
      res.json({
        success: true,
        message: "Withdrawal successful",
        newBalance
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });
  app2.post("/api/codes/redeem", requireAuth, async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.id;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Invalid code format" });
      }
      const trimmedCode = code.trim().toUpperCase();
      if (trimmedCode.length < 4) {
        return res.status(400).json({ message: "Code must be at least 4 characters long" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const validCodes = {
        "WELCOME500": {
          type: "balance",
          amount: 500,
          message: "Welcome bonus redeemed! $500 added to your balance.",
          reward: "$500 Balance Boost"
        },
        "STARTER1000": {
          type: "balance",
          amount: 1e3,
          message: "Starter pack redeemed! $1,000 added to your balance.",
          reward: "$1,000 Balance Boost"
        },
        "BIGBOOST2500": {
          type: "balance",
          amount: 2500,
          message: "Big boost redeemed! $2,500 added to your balance.",
          reward: "$2,500 Balance Boost"
        },
        "MEGABOOST5000": {
          type: "balance",
          amount: 5e3,
          message: "Mega boost redeemed! $5,000 added to your balance.",
          reward: "$5,000 Balance Boost"
        },
        "FREEMONEY": {
          type: "balance",
          amount: 100,
          message: "Free money code redeemed! $100 added to your balance.",
          reward: "$100 Balance Boost"
        }
      };
      const codeData = validCodes[trimmedCode];
      if (!codeData) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      if (codeData.type === "balance" && codeData.amount) {
        const currentBalance = parseFloat(user.balance.toString());
        const newBalance = currentBalance + codeData.amount;
        await storage.updateUser(userId, {
          balance: newBalance.toString()
        });
        await storage.createAdminLog({
          adminUserId: userId,
          targetUserId: userId,
          action: "code_redemption",
          oldValue: currentBalance.toString(),
          newValue: newBalance.toString(),
          notes: `User redeemed code "${trimmedCode}" for $${codeData.amount}`
        });
        res.json({
          success: true,
          message: codeData.message,
          reward: codeData.reward,
          newBalance
        });
      } else {
        res.json({
          success: true,
          message: codeData.message,
          reward: codeData.reward
        });
      }
    } catch (error) {
      console.error("Error redeeming code:", error);
      res.status(500).json({ message: "Failed to redeem code" });
    }
  });
  app2.get("/api/admin/logs/:userId", requireAuth, async (req, res) => {
    try {
      const adminUserId = req.user.userId;
      const targetUserId = parseInt(req.params.userId);
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const logs = await storage.getAdminLogs(targetUserId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });
  app2.delete("/api/admin/users/:userEmail", requireAuth, async (req, res) => {
    try {
      const adminUserId = req.user.userId;
      const targetUserEmail = req.params.userEmail;
      console.log(`Admin userId ${adminUserId} attempting to delete user ${targetUserEmail}`);
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        console.log(`Access denied: User ${adminUserId} is not an admin`);
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const targetUser = await storage.getUserByEmail(targetUserEmail);
      if (!targetUser) {
        console.log(`User ${targetUserEmail} not found`);
        return res.status(404).json({ message: "User not found." });
      }
      if (targetUser.subscriptionTier === "admin") {
        console.log(`Cannot delete admin account: User ${targetUserEmail}`);
        return res.status(403).json({ message: "Cannot delete admin accounts." });
      }
      console.log(`Deleting user ${targetUserEmail}...`);
      await storage.deleteUser(targetUser.id);
      console.log(`User ${targetUserEmail} deleted successfully`);
      res.json({ message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/admin/add-site-cash", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const currentSiteCash = Number(currentUser.siteCash) || 0;
      const newBalance = currentSiteCash + Number(amount);
      const updatedUser = await storage.updateUser(req.user.id, { siteCash: newBalance.toString() });
      res.json({
        success: true,
        amount: Number(amount),
        newBalance,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error adding site cash:", error);
      res.status(500).json({ error: "Failed to add site cash" });
    }
  });
  app2.get("/api/system/status", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || user.subscriptionTier !== "administrator" && user.subscriptionTier !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const systemStatus = await getSystemStatus();
      res.json(systemStatus);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });
  app2.use(errorHandler);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/tournamentScheduler.ts
init_tournamentExpiration();
var TournamentScheduler = class {
  intervalId = null;
  /**
   * Start the tournament expiration checker
   * Runs every 5 minutes to check for expired tournaments
   */
  start() {
    if (this.intervalId) {
      console.log("Tournament scheduler is already running");
      return;
    }
    console.log("Starting tournament expiration scheduler...");
    this.checkExpiredTournaments();
    this.intervalId = setInterval(() => {
      this.checkExpiredTournaments();
    }, 5 * 60 * 1e3);
  }
  /**
   * Stop the tournament expiration checker
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Tournament scheduler stopped");
    }
  }
  /**
   * Check for expired tournaments and process them
   */
  async checkExpiredTournaments() {
    try {
      console.log("Checking for expired tournaments...");
      await tournamentExpirationService.processExpiredTournaments();
      console.log("Tournament expiration check completed");
    } catch (error) {
      console.error("Error processing expired tournaments:", error);
    }
  }
};
var tournamentScheduler = new TournamentScheduler();

// server/index.ts
init_db();
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, async () => {
    log(`serving on port ${port}`);
    try {
      await db.execute("SELECT 1");
      tournamentScheduler.start();
      log("Tournament scheduler started successfully");
    } catch (error) {
      log("Tournament scheduler disabled due to database connectivity issues");
      log("Error: " + error.message);
    }
  });
})();
