import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { insertContactSchema, insertWatchlistSchema, insertStockPurchaseSchema, registerSchema, loginSchema } from "@shared/schema";
import apiRoutes from "./routes/api.js";
import { errorHandler } from "./utils/errorHandler.js";
import { trackRequest, getSystemStatus } from "./services/systemMonitor.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add request tracking middleware
  app.use(trackRequest);
  
  // Auth setup
  setupAuth(app);

  // Mount Yahoo Finance API routes
  app.use('/api', apiRoutes);

  // Authentication routes are handled in setupAuth()

  // User profile routes (protected)
  app.put('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Profile update request for user:", userId);
      console.log("Request body:", req.body);
      
      const validatedData = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        displayName: z.string().optional().nullable()
      }).parse(req.body);
      
      console.log("Validated data:", validatedData);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      console.log("Updated user:", updatedUser);
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Watchlist routes (protected)
  app.get('/api/watchlist', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const watchlist = await storage.getUserWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertWatchlistSchema.parse(req.body);
      
      const watchlistItem = await storage.addToWatchlist(userId, validatedData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete('/api/watchlist/:id', requireAuth, async (req: any, res) => {
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

  // Trading routes (protected)
  app.get('/api/trading/balance', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const balance = await storage.getUserBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  app.post('/api/trading/purchase', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertStockPurchaseSchema.parse(req.body);
      
      // Check user's balance
      const currentBalance = await storage.getUserBalance(userId);
      const totalCost = parseFloat(validatedData.totalCost);
      
      if (currentBalance < totalCost) {
        return res.status(400).json({ 
          message: "Insufficient balance. Purchase cancelled.",
          balance: currentBalance,
          required: totalCost
        });
      }
      
      // Create the purchase
      const purchase = await storage.purchaseStock(userId, validatedData);
      
      // Update user balance
      const newBalance = currentBalance - totalCost;
      await storage.updateUserBalance(userId, newBalance);

      // Award First Trade achievement if not already earned
      const hasFirstTrade = await storage.hasAchievement(userId, 'First Trade');
      if (!hasFirstTrade) {
        await storage.awardAchievement({
          userId: userId,
          achievementType: 'first_trade',
          achievementTier: 'common',
          achievementName: 'First Trade',
          achievementDescription: 'Made your first trade',
          earnedAt: new Date(),
          createdAt: new Date()
        });
      }
      
      res.status(201).json({ 
        purchase,
        newBalance 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error processing stock purchase:", error);
      res.status(500).json({ message: "Failed to process stock purchase" });
    }
  });

  app.get('/api/trading/purchases', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const purchases = await storage.getUserStockPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post('/api/trading/sell', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { purchaseId, shares, salePrice, totalValue } = req.body;
      
      // Validate input
      if (!purchaseId || !shares || !salePrice || !totalValue) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Delete the purchase record
      await storage.deletePurchase(userId, purchaseId);
      
      // Update user balance
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

  // Contact form route
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating contact submission:", error);
      res.status(500).json({ message: "Failed to create contact submission" });
    }
  });

  // Admin endpoint to get all users (only for userId 0 or 1)
  app.get("/api/admin/users", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Check if user is admin (userId 0, 1, or 2)
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

  // Admin endpoint to update user subscription tier
  app.put("/api/admin/users/:userId/subscription", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      const targetUserId = parseInt(req.params.userId);
      const { subscriptionTier } = req.body;
      
      // Check if user is admin (userId 0, 1, or 2)
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      // Validate subscription tier
      if (!subscriptionTier || !['free', 'premium'].includes(subscriptionTier)) {
        return res.status(400).json({ message: "Invalid subscription tier. Must be 'free' or 'premium'." });
      }
      
      // Update the user's subscription tier
      const updateData: any = { subscriptionTier };
      
      // Set premium upgrade date if upgrading to premium
      if (subscriptionTier === 'premium') {
        updateData.premiumUpgradeDate = new Date();
      }
      
      await storage.updateUser(targetUserId, updateData);
      
      res.json({ message: "User subscription tier updated successfully." });
    } catch (error) {
      console.error("Error updating user subscription tier:", error);
      res.status(500).json({ message: "Failed to update subscription tier" });
    }
  });

  // Admin endpoint to get user logs
  app.get("/api/admin/logs/:userId", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      const targetUserId = parseInt(req.params.userId);
      
      // Check if user is admin (userId 0, 1, or 2)
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

  // Admin endpoint to delete a user (only for userId 0 or 1)
  app.delete("/api/admin/users/:userEmail", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      const targetUserEmail = req.params.userEmail;
      
      console.log(`Admin userId ${adminUserId} attempting to delete user ${targetUserEmail}`);
      
      // Check if user is admin (userId 0, 1, or 2)
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        console.log(`Access denied: User ${adminUserId} is not an admin`);
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      // Check if target user exists
      const targetUser = await storage.getUserByEmail(targetUserEmail);
      if (!targetUser) {
        console.log(`User ${targetUserEmail} not found`);
        return res.status(404).json({ message: "User not found." });
      }

      // Prevent deletion of admin accounts
      if (targetUser.userId === 0 || targetUser.userId === 1) {
        console.log(`Cannot delete admin account: User ${targetUserEmail} (userId: ${targetUser.userId})`);
        return res.status(403).json({ message: "Cannot delete admin accounts." });
      }

      console.log(`Deleting user ${targetUserEmail}...`);
      
      // Delete the user
      await storage.deleteUser(targetUser.id);
      
      console.log(`User ${targetUserEmail} deleted successfully`);
      res.json({ message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
  });

  // System monitoring endpoint
  app.get("/api/system/status", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      
      // Check if user is admin (userId 0, 1, or 2)
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const systemStatus = await getSystemStatus();
      res.json(systemStatus);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}