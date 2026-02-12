import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Middleware to track user activity timestamp
 * Updates lastActivity field whenever an authenticated user makes a request
 */
export function trackUserActivity(req: Request, res: Response, next: NextFunction) {
  if (req.user && (req.user as any).id) {
    const userId = (req.user as any).id;

    // Update lastActivity asynchronously without blocking the request
    db.update(users)
      .set({ lastActivity: new Date() })
      .where(eq(users.id, userId))
      .catch(err => {
        console.error('Failed to update lastActivity:', err);
      });
  }

  next();
}
