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
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
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

// Type exports
// User schemas for new authentication system
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type RegisterUser = z.infer<typeof registerSchema>;
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
