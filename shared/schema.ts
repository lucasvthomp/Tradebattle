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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
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
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  balance: numeric("balance", { precision: 15, scale: 2 }).default("10000.00").notNull(), // Starting balance of $10,000
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free").notNull(), // free, premium
  premiumUpgradeDate: timestamp("premium_upgrade_date"), // When user upgraded to premium
  personalBalance: numeric("personal_balance", { precision: 15, scale: 2 }).default("10000.00").notNull(), // Personal portfolio balance
  totalDeposited: numeric("total_deposited", { precision: 15, scale: 2 }).default("10000.00").notNull(), // Total amount deposited into personal account
  personalPortfolioStartDate: timestamp("personal_portfolio_start_date"), // When user started personal portfolio
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  startingBalance: numeric("starting_balance", { precision: 15, scale: 2 }).default("10000.00").notNull(),
  status: varchar("status").default("waiting"), // waiting, active, completed
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

// Tournament participants table
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("10000.00").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

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

// Type exports
// User schemas for new authentication system
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  password: true,
  userId: true,
});



export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
