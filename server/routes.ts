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
        email: z.string().email(),
        displayName: z.string().optional().nullable(),
        username: z.string().min(3, "Username must be at least 3 characters").max(15, "Username must be at most 15 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional()
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

  // User preferences route (protected)
  app.put('/api/user/preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = z.object({
        language: z.string().optional(),
        currency: z.string().optional()
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
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
      
      // If companyName is same as symbol, fetch the real company name from Yahoo Finance API
      let companyName = validatedData.companyName;
      if (companyName === validatedData.symbol || !companyName) {
        try {
          // Import the Yahoo Finance service to get company profile
          const { getCompanyProfile } = await import('./services/yahooFinance.js');
          const profile = await getCompanyProfile(validatedData.symbol);
          companyName = profile.longName || profile.shortName || validatedData.symbol;
          console.log(`Fetched company name for ${validatedData.symbol}: ${companyName}`);
        } catch (error) {
          console.log(`Could not fetch company name for ${validatedData.symbol}, using symbol`);
          companyName = validatedData.symbol;
        }
      }
      
      // Create watchlist item with proper company name
      const watchlistData = {
        ...validatedData,
        companyName
      };
      
      const watchlistItem = await storage.addToWatchlist(userId, watchlistData);
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
          achievementDescription: 'Made your first trade'
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


  // Balance management endpoints
  app.post("/api/balance/deposit", requireAuth, async (req: any, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid deposit amount" });
      }

      if (amount < 1) {
        return res.status(400).json({ message: "Minimum deposit amount is $1.00" });
      }

      if (amount > 10000) {
        return res.status(400).json({ message: "Maximum deposit amount is $10,000.00 per transaction" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate new balance
      const currentBalance = parseFloat(user.balance.toString());
      const newBalance = currentBalance + amount;

      // Update user balance
      await storage.updateUser(userId, { 
        balance: newBalance.toString() 
      });

      // Log the transaction
      await storage.createAdminLog({
        adminUserId: userId,
        targetUserId: userId,
        action: 'balance_deposit',
        oldValue: currentBalance.toString(),
        newValue: newBalance.toString(),
        notes: `User deposited $${amount.toFixed(2)}`
      });

      res.json({ 
        success: true, 
        message: "Deposit successful",
        newBalance: newBalance
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  app.post("/api/balance/withdraw", requireAuth, async (req: any, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      if (amount < 1) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $1.00" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.balance.toString());

      // Check if user has sufficient funds
      if (amount > currentBalance) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Calculate new balance
      const newBalance = currentBalance - amount;

      // Update user balance
      await storage.updateUser(userId, { 
        balance: newBalance.toString() 
      });

      // Log the transaction
      await storage.createAdminLog({
        adminUserId: userId,
        targetUserId: userId,
        action: 'balance_withdrawal',
        oldValue: currentBalance.toString(),
        newValue: newBalance.toString(),
        notes: `User withdrew $${amount.toFixed(2)}`
      });

      res.json({ 
        success: true, 
        message: "Withdrawal successful",
        newBalance: newBalance
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Code redemption endpoint
  app.post("/api/codes/redeem", requireAuth, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.id;

      // Validate code input
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Invalid code format" });
      }

      const trimmedCode = code.trim().toUpperCase();
      if (trimmedCode.length < 4) {
        return res.status(400).json({ message: "Code must be at least 4 characters long" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Predefined redemption codes with rewards
      const validCodes: Record<string, { type: string; amount?: number; message: string; reward: string }> = {
        'WELCOME500': {
          type: 'balance',
          amount: 500,
          message: 'Welcome bonus redeemed! $500 added to your balance.',
          reward: '$500 Balance Boost'
        },
        'STARTER1000': {
          type: 'balance',
          amount: 1000,
          message: 'Starter pack redeemed! $1,000 added to your balance.',
          reward: '$1,000 Balance Boost'
        },
        'BIGBOOST2500': {
          type: 'balance',
          amount: 2500,
          message: 'Big boost redeemed! $2,500 added to your balance.',
          reward: '$2,500 Balance Boost'
        },
        'MEGABOOST5000': {
          type: 'balance',
          amount: 5000,
          message: 'Mega boost redeemed! $5,000 added to your balance.',
          reward: '$5,000 Balance Boost'
        },
        'FREEMONEY': {
          type: 'balance',
          amount: 100,
          message: 'Free money code redeemed! $100 added to your balance.',
          reward: '$100 Balance Boost'
        }
      };

      // Check if code exists
      const codeData = validCodes[trimmedCode];
      if (!codeData) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      // Apply the reward based on type
      if (codeData.type === 'balance' && codeData.amount) {
        const currentBalance = parseFloat(user.balance.toString());
        const newBalance = currentBalance + codeData.amount;

        // Update user balance
        await storage.updateUser(userId, { 
          balance: newBalance.toString() 
        });

        // Log the code redemption
        await storage.createAdminLog({
          adminUserId: userId,
          targetUserId: userId,
          action: 'code_redemption',
          oldValue: currentBalance.toString(),
          newValue: newBalance.toString(),
          notes: `User redeemed code "${trimmedCode}" for $${codeData.amount}`
        });

        res.json({ 
          success: true, 
          message: codeData.message,
          reward: codeData.reward,
          newBalance: newBalance
        });
      } else {
        // Handle other reward types in the future (premium features, items, etc.)
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
      res.status(500).json({ message: "Failed to delete user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // System monitoring endpoint
  app.get("/api/system/status", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin (using subscription tier)
      const user = await storage.getUser(userId);
      if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin')) {
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