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
export type ResearchInsight = typeof researchInsights.$inferSelect;
export type InsertResearchInsight = z.infer<typeof insertResearchInsightSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type ResearchRequest = typeof researchRequests.$inferSelect;
export type InsertResearchRequest = z.infer<typeof insertResearchRequestSchema>;
export type PartnerConversation = typeof partnerConversations.$inferSelect;
export type InsertPartnerConversation = z.infer<typeof insertPartnerConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ResearchPublication = typeof researchPublications.$inferSelect;
export type InsertResearchPublication = z.infer<typeof insertResearchPublicationSchema>;
