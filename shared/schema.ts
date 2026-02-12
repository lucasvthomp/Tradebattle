import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";



// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email/password authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").unique(), // New field for admin identification (Lucas=0, Murilo=1)
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 20 }).unique().notNull(), // 3-20 characters, letters/numbers, max 1 underscore
  profilePicture: text("profile_picture"), // Base64 encoded profile picture or URL
  lastUsernameChange: timestamp("last_username_change"), // Track when username was last changed (for 2-week restriction)
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  country: varchar("country", { length: 100 }), // User's country
  language: varchar("language", { length: 50 }).default("English"), // User's preferred language
  currency: varchar("currency", { length: 10 }).default("USD"), // User's preferred currency
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0.00").notNull(), // DEPRECATED, use siteCash instead
  siteCash: numeric("site_cash", { precision: 15, scale: 2 }).default("0.00").notNull(), // Main site balance (deposited real money)
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free").notNull(), // free, administrator
  premiumUpgradeDate: timestamp("premium_upgrade_date"), // Deprecated - kept for data compatibility
  personalBalance: numeric("personal_balance", { precision: 15, scale: 2 }).default("0.00").notNull(), // Personal portfolio balance
  totalDeposited: numeric("total_deposited", { precision: 15, scale: 2 }).default("0.00").notNull(), // Total amount deposited into personal account
  personalPortfolioStartDate: timestamp("personal_portfolio_start_date"), // When user started personal portfolio
  tournamentWins: integer("tournament_wins").default(0).notNull(), // Private counter for tournament wins
  totalTrades: integer("total_trades").default(0).notNull(), // Total number of buy/sell trades made by user
  adminNote: text("admin_note").default(""), // Admin notes for user management
  banned: boolean("banned").default(false), // User banned status
  withdrawalFrozen: boolean("withdrawal_frozen").default(false), // Freeze withdrawals
  depositFrozen: boolean("deposit_frozen").default(false), // Freeze deposits
  tournamentRestricted: boolean("tournament_restricted").default(false), // Restrict tournament access
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'tournament_start', 'tournament_end', 'deposit', 'withdrawal', 'tournament_join', 'achievement', 'tip'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  metadata: jsonb("metadata"), // Optional JSON payload (e.g., tournamentId, amount)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table for full audit trail
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'deposit', 'withdrawal', 'buy_in', 'payout', 'tip_sent', 'tip_received', 'code_redemption'
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("completed").notNull(), // 'pending', 'completed', 'failed'
  description: text("description"),
  referenceId: varchar("reference_id", { length: 255 }), // e.g., tournament ID, stripe intent ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: varchar("symbol").notNull(),
  companyName: varchar("company_name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stock purchases table for tracking user trading activity
export const stockPurchases = pgTable("stock_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: varchar("symbol").notNull(),
  companyName: varchar("company_name").notNull(),
  shares: integer("shares").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 15, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personal stock purchases table (separate from tournament purchases)
export const personalStockPurchases = pgTable("personal_stock_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: varchar("symbol").notNull(),
  companyName: varchar("company_name").notNull(),
  shares: integer("shares").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 15, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio history table for tracking portfolio value over time
export const portfolioHistory = pgTable("portfolio_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  portfolioType: varchar("portfolio_type").notNull(), // 'personal' or 'tournament'
  tournamentId: integer("tournament_id"), // null for personal portfolio
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).notNull(),
  cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }).notNull(),
  stockValue: numeric("stock_value", { precision: 15, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("new"), // new, read, replied
  createdAt: timestamp("created_at").defaultNow(),
});



// Admin logs table for tracking administrative actions
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // subscription_change, role_change, account_suspension, etc.
  oldValue: text("old_value"),
  newValue: text("new_value"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tournament games table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code", { length: 8 }).unique().notNull(), // 8-character unique code
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  maxPlayers: integer("max_players").default(10).notNull(),
  currentPlayers: integer("current_players").default(1).notNull(),
  startingBalance: numeric("starting_balance", { precision: 15, scale: 2 }).notNull(),
  timeframe: varchar("timeframe").default("4 weeks").notNull(), // Tournament duration
  status: varchar("status").default("waiting"), // waiting, active, completed, cancelled
  cancellationReason: text("cancellation_reason"), // Reason if tournament was cancelled
  buyInAmount: numeric("buy_in_amount", { precision: 15, scale: 2 }).default("0.00").notNull(), // Real money buy-in amount
  currentPot: numeric("current_pot", { precision: 15, scale: 2 }).default("0.00").notNull(), // Total accumulated buy-ins
  tradingRestriction: varchar("trading_restriction", { length: 50 }).default("none").notNull(), // Trading category restrictions
  tournamentType: varchar("tournament_type", { length: 20 }).default("stocks").notNull(), // 'stocks' or 'crypto'
  isPublic: boolean("is_public").default(true).notNull(), // Public/private tournament setting
  payoutStructure: varchar("payout_structure", { length: 50 }).default("winner_take_all").notNull(), // winner_take_all, top_3, top_5, top_half
  scheduledStartTime: timestamp("scheduled_start_time"), // When tournament is scheduled to start
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

// Tournament participants table
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  uniqueUserTournament: unique("unique_user_tournament").on(table.tournamentId, table.userId),
}));

// Tournament-specific stock purchases
export const tournamentStockPurchases = pgTable("tournament_stock_purchases", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: varchar("symbol").notNull(),
  companyName: varchar("company_name").notNull(),
  shares: integer("shares").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 15, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements table for tracking earned achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementType: varchar("achievement_type").notNull(), // 'tournament_winner', 'tournament_top3', 'first_trade', etc.
  achievementTier: varchar("achievement_tier").notNull(), // 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
  achievementName: varchar("achievement_name").notNull(),
  achievementDescription: text("achievement_description").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraint: user can only have one of each achievement type globally
  uniqueUserAchievement: unique("unique_user_achievement").on(table.userId, table.achievementType),
}));

// Tournament creator rewards table for tracking 5% creator benefits
export const tournamentCreatorRewards = pgTable("tournament_creator_rewards", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  totalJackpot: numeric("total_jackpot", { precision: 15, scale: 2 }).notNull(), // Total buy-in amount collected
  creatorReward: numeric("creator_reward", { precision: 15, scale: 2 }).notNull(), // 5% of total jackpot
  participantCount: integer("participant_count").notNull(), // Number of participants who paid buy-in
  rewardPaid: boolean("reward_paid").default(false).notNull(), // Whether reward has been distributed
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Friendships table for friend system
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  addresseeId: integer("addressee_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique("unique_friendship").on(table.requesterId, table.addresseeId),
}));

// Tournament results table for tracking final standings and payouts
export const tournamentResults = pgTable("tournament_results", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rank: integer("rank").notNull(),
  portfolioValue: numeric("portfolio_value", { precision: 15, scale: 2 }).notNull(),
  gainPercent: numeric("gain_percent", { precision: 10, scale: 2 }).notNull(),
  payout: numeric("payout", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Promo codes table for managed code system
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  rewardType: varchar("reward_type", { length: 20 }).notNull(), // 'balance', 'sitecash'
  rewardAmount: numeric("reward_amount", { precision: 15, scale: 2 }).notNull(),
  usageType: varchar("usage_type", { length: 20 }).notNull(), // 'single_use', 'once_per_user', 'limited', 'unlimited'
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").default(0).notNull(),
  expiresAt: timestamp("expires_at"), // null = never
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Code redemptions table for tracking who redeemed what
export const codeRedemptions = pgTable("code_redemptions", {
  id: serial("id").primaryKey(),
  codeId: integer("code_id").references(() => promoCodes.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
}, (table) => ({
  uniqueCodeUser: unique("unique_code_user").on(table.codeId, table.userId),
}));

// Zod schemas for validation
export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  symbol: true,
  companyName: true,
  notes: true,
});

export const insertStockPurchaseSchema = createInsertSchema(stockPurchases).pick({
  symbol: true,
  companyName: true,
  shares: true,
  purchasePrice: true,
  totalCost: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  adminUserId: true,
  targetUserId: true,
  action: true,
  oldValue: true,
  newValue: true,
  notes: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).pick({
  name: true,
  maxPlayers: true,
  startingBalance: true,
  timeframe: true,
  buyInAmount: true,
  tradingRestriction: true,
  isPublic: true,
  tournamentType: true,
  scheduledStartTime: true,
  payoutStructure: true,
});

export const insertCreatorRewardSchema = createInsertSchema(tournamentCreatorRewards).pick({
  tournamentId: true,
  creatorId: true,
  totalJackpot: true,
  creatorReward: true,
  participantCount: true,
});

export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).pick({
  tournamentId: true,
  userId: true,
});

export const insertTournamentStockPurchaseSchema = createInsertSchema(tournamentStockPurchases).pick({
  tournamentId: true,
  symbol: true,
  companyName: true,
  shares: true,
  purchasePrice: true,
  totalCost: true,
});

export const insertPersonalStockPurchaseSchema = createInsertSchema(personalStockPurchases).pick({
  symbol: true,
  companyName: true,
  shares: true,
  purchasePrice: true,
  totalCost: true,
});

export const insertPortfolioHistorySchema = createInsertSchema(portfolioHistory).pick({
  userId: true,
  portfolioType: true,
  tournamentId: true,
  totalValue: true,
  cashBalance: true,
  stockValue: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  requesterId: true,
  addresseeId: true,
});

export const insertTournamentResultSchema = createInsertSchema(tournamentResults).pick({
  tournamentId: true,
  userId: true,
  rank: true,
  portfolioValue: true,
  gainPercent: true,
  payout: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  rewardType: true,
  rewardAmount: true,
  usageType: true,
  maxUses: true,
  expiresAt: true,
  isActive: true,
  createdBy: true,
});

export const insertCodeRedemptionSchema = createInsertSchema(codeRedemptions).pick({
  codeId: true,
  userId: true,
});

// Trade history table for tracking all trading actions (buy/sell)
export const tradeHistory = pgTable("trade_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id), // null for personal trades
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  tradeType: text("trade_type").notNull(), // 'buy' or 'sell'
  shares: integer("shares").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  totalValue: numeric("total_value", { precision: 10, scale: 2 }).notNull(),
  tradeDate: timestamp("trade_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTradeHistorySchema = createInsertSchema(tradeHistory).pick({
  userId: true,
  tournamentId: true,
  symbol: true,
  companyName: true,
  tradeType: true,
  shares: true,
  price: true,
  totalValue: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementType: true,
  achievementTier: true,
  achievementName: true,
  achievementDescription: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  metadata: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  balanceBefore: true,
  balanceAfter: true,
  status: true,
  description: true,
  referenceId: true,
});

// Type exports
// Username validation schema
export const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/, "Username can only contain letters, numbers, and at most one underscore");

// User schemas for new authentication system
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  userId: true,
  country: true,
  language: true,
  currency: true,
}).extend({
  username: usernameSchema,
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration schema for signup
export const registrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: usernameSchema,
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one capital letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  country: z.string().optional(),
  language: z.string().default("English"),
  currency: z.string().default("USD"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: usernameSchema,
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one capital letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  country: z.string().optional(),
  language: z.string().default("English"),
  currency: z.string().default("USD"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type RegisterUser = z.infer<typeof registerSchema>;
export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistSchema>;
export type StockPurchase = typeof stockPurchases.$inferSelect;
export type InsertStockPurchase = z.infer<typeof insertStockPurchaseSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;
export type TournamentStockPurchase = typeof tournamentStockPurchases.$inferSelect;
export type InsertTournamentStockPurchase = z.infer<typeof insertTournamentStockPurchaseSchema>;
export type PersonalStockPurchase = typeof personalStockPurchases.$inferSelect;
export type InsertPersonalStockPurchase = z.infer<typeof insertPersonalStockPurchaseSchema>;
export type TradeHistory = typeof tradeHistory.$inferSelect;
export type InsertTradeHistory = z.infer<typeof insertTradeHistorySchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type PortfolioHistory = typeof portfolioHistory.$inferSelect;
export type InsertPortfolioHistory = z.infer<typeof insertPortfolioHistorySchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TournamentResult = typeof tournamentResults.$inferSelect;
export type InsertTournamentResult = z.infer<typeof insertTournamentResultSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type CodeRedemption = typeof codeRedemptions.$inferSelect;
export type InsertCodeRedemption = z.infer<typeof insertCodeRedemptionSchema>;

// Export chat schema
export * from "./chatSchema";
