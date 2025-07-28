import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: varchar("username", { length: 15 }).notNull(),
  profilePicture: text("profile_picture"), // Base64 encoded profile picture or URL
  message: text("message").notNull(),
  tournamentId: integer("tournament_id"), // null for global chat, specific ID for tournament chat
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createInsertSchema(chatMessages);

// TypeScript types
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;