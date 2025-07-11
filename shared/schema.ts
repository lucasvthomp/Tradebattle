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
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("novice").notNull(), // novice, explorer, analyst, professional
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Research studies table
export const studies = pgTable("studies", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  authorId: integer("author_id").references(() => users.id),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News articles table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  priority: varchar("priority").default("normal"), // breaking, research, normal
  publishedAt: timestamp("published_at").defaultNow(),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Research insights table
export const researchInsights = pgTable("research_insights", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // opportunity, risk, alert
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  symbol: varchar("symbol"),
  impact: varchar("impact").default("medium"), // low, medium, high
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Partner management table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  specialization: varchar("specialization"), // research, analysis, advisory, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research requests table
export const researchRequests = pgTable("research_requests", {
  id: serial("id").primaryKey(),
  clientUserId: integer("client_user_id").references(() => users.id).notNull(),
  partnerUserId: integer("partner_user_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  status: varchar("status").default("pending"), // pending, assigned, in_progress, completed, cancelled
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner-client conversations table
export const partnerConversations = pgTable("partner_conversations", {
  id: serial("id").primaryKey(),
  partnerUserId: integer("partner_user_id").references(() => users.id).notNull(),
  clientUserId: integer("client_user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  senderType: varchar("sender_type").notNull(), // partner, client
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertStudySchema = createInsertSchema(studies).pick({
  title: true,
  description: true,
  content: true,
  category: true,
  featured: true,
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  description: true,
  content: true,
  category: true,
  priority: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  symbol: true,
  companyName: true,
  notes: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertResearchInsightSchema = createInsertSchema(researchInsights).pick({
  type: true,
  title: true,
  description: true,
  symbol: true,
  impact: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  adminUserId: true,
  targetUserId: true,
  action: true,
  oldValue: true,
  newValue: true,
  notes: true,
});

export const insertPartnerSchema = createInsertSchema(partners).pick({
  userId: true,
  specialization: true,
  isActive: true,
});

export const insertResearchRequestSchema = createInsertSchema(researchRequests).pick({
  clientUserId: true,
  title: true,
  description: true,
  category: true,
  priority: true,
  dueDate: true,
});

export const insertPartnerConversationSchema = createInsertSchema(partnerConversations).pick({
  partnerUserId: true,
  clientUserId: true,
  message: true,
  senderType: true,
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

export const updateUserSubscriptionSchema = z.object({
  subscriptionTier: z.enum(["novice", "explorer", "analyst", "professional"]),
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
export type UpdateUserSubscription = z.infer<typeof updateUserSubscriptionSchema>;
export type Study = typeof studies.$inferSelect;
export type InsertStudy = z.infer<typeof insertStudySchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSchema>;
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
