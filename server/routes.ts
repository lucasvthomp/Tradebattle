import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { setupAuth, requireAuth, hashPassword } from "./auth";
import { insertContactSchema, insertWatchlistSchema, insertStockPurchaseSchema, registerSchema, loginSchema } from "@shared/schema";
import apiRoutes from "./routes/api.js";
import { errorHandler } from "./utils/errorHandler.js";
import { trackRequest, getSystemStatus } from "./services/systemMonitor.js";
import { containsProfanity } from "./utils/profanityFilter.js";
import { generateToken, sendVerificationEmail, sendPasswordResetEmail } from "./services/email.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add request tracking middleware
  app.use(trackRequest);
  
  // Auth setup
  setupAuth(app);

  // Mount Yahoo Finance API routes
  app.use('/api', apiRoutes);

  // Authentication routes are handled in setupAuth()

  // Username availability check (public)
  app.get('/api/username/check/:username', async (req: any, res) => {
    try {
      const { username } = req.params;
      if (!username || username.length < 3 || username.length > 20) {
        return res.json({ available: false, reason: "Username must be 3-20 characters" });
      }
      if (!/^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username)) {
        return res.json({ available: false, reason: "Letters, numbers, and at most one underscore" });
      }
      if (containsProfanity(username)) {
        return res.json({ available: false, reason: "Username contains inappropriate language" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.json({ available: false, reason: "Username is already taken" });
      }
      return res.json({ available: true });
    } catch (error) {
      console.error("Username check error:", error);
      res.status(500).json({ available: false, reason: "Server error" });
    }
  });

  // User transaction history (real money only)
  app.get('/api/user/transactions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage.getAdminLogs(userId);
      const moneyActions = ['balance_deposit', 'balance_withdrawal', 'tip_sent', 'tip_received', 'code_redemption', 'admin_balance_change'];
      const filtered = (logs || []).filter((log: any) => moneyActions.includes(log.action));
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json([]);
    }
  });

  // Recent trades for a user (public profile)
  app.get('/api/users/:userId/trades', async (req: any, res) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const trades = await storage.getUserTradeHistory(targetUserId, 10);
      res.json({ data: trades || [] });
    } catch (error) {
      console.error("Error fetching user trades:", error);
      res.json({ data: [] });
    }
  });

  // User profile routes (protected)
  app.put('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Profile update request for user:", userId);
      console.log("Request body:", req.body);
      
      const validatedData = z.object({
        email: z.string().email(),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/, "Username can only contain letters, numbers, and at most one underscore").optional()
      }).parse(req.body);

      if (validatedData.username && containsProfanity(validatedData.username)) {
        return res.status(400).json({ message: "Username contains inappropriate language" });
      }

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

  // Balance management routes (protected)
  app.post('/api/user/balance/add', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = z.object({
        amount: z.number().positive("Amount must be positive")
      }).parse(req.body);
      
      const updatedUser = await storage.addUserBalance(userId, validatedData.amount);
      res.json({ 
        success: true, 
        message: `Added $${validatedData.amount} to your balance`,
        newBalance: Number(updatedUser.balance)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid amount", errors: error.errors });
      }
      console.error("Error adding balance:", error);
      res.status(500).json({ message: "Failed to add balance" });
    }
  });

  app.post('/api/user/balance/withdraw', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = z.object({
        amount: z.number().positive("Amount must be positive")
      }).parse(req.body);
      
      // Check if user has sufficient balance
      const user = await storage.getUserById(userId);
      const currentBalance = Number(user?.balance || 0);
      
      if (currentBalance < validatedData.amount) {
        return res.status(400).json({ 
          message: "Insufficient balance",
          currentBalance: currentBalance,
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid amount", errors: error.errors });
      }
      console.error("Error withdrawing balance:", error);
      res.status(500).json({ message: "Failed to withdraw balance" });
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
          companyName = (profile as any).longName || (profile as any).shortName || validatedData.symbol;
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

      if (user.depositFrozen) {
        return res.status(403).json({ message: "Your deposits have been frozen. Please contact support." });
      }

      // Calculate new balance
      const currentBalance = parseFloat(user.siteCash?.toString() || '0');
      const newBalance = currentBalance + amount;

      // Update user balance
      await storage.updateUser(userId, {
        siteCash: newBalance.toString()
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

      if (user.withdrawalFrozen) {
        return res.status(403).json({ message: "Your withdrawals have been frozen. Please contact support." });
      }

      const currentBalance = parseFloat(user.siteCash?.toString() || '0');

      // Check if user has sufficient funds
      if (amount > currentBalance) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Calculate new balance
      const newBalance = currentBalance - amount;

      // Update user balance
      await storage.updateUser(userId, { 
        siteCash: newBalance.toString() 
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

  // Code redemption endpoint (DB-backed promo code system)
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

      // Look up code in DB
      const promoCode = await storage.getPromoCode(trimmedCode);
      if (!promoCode) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      // Check if code is active
      if (!promoCode.isActive) {
        return res.status(400).json({ message: "This code is no longer active" });
      }

      // Check expiry
      if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This code has expired" });
      }

      // Check usage limits
      if (promoCode.usageType === 'once_per_user') {
        const existing = await storage.getCodeRedemption(promoCode.id, userId);
        if (existing) {
          return res.status(400).json({ message: "You have already redeemed this code" });
        }
      } else if (promoCode.usageType === 'single_use') {
        if (promoCode.currentUses >= 1) {
          return res.status(400).json({ message: "This code has already been used" });
        }
      } else if (promoCode.usageType === 'limited') {
        if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
          return res.status(400).json({ message: "This code has reached its maximum number of uses" });
        }
      }
      // 'unlimited' type has no checks

      const rewardAmount = Number(promoCode.rewardAmount);
      const currentBalance = parseFloat(user.siteCash?.toString() || '0');
      const newBalance = currentBalance + rewardAmount;

      // Record the redemption
      await storage.redeemCode(promoCode.id, userId);

      // Add to user's siteCash
      await storage.updateUser(userId, {
        siteCash: newBalance.toString()
      });

      // Log the code redemption
      await storage.createAdminLog({
        adminUserId: userId,
        targetUserId: userId,
        action: 'code_redemption',
        oldValue: currentBalance.toString(),
        newValue: newBalance.toString(),
        notes: `User redeemed code "${trimmedCode}" for $${rewardAmount.toFixed(2)}`
      });

      // Create a transaction record
      try {
        await storage.createTransaction({
          userId,
          type: 'code_redemption',
          amount: rewardAmount.toString(),
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          status: 'completed',
          description: `Redeemed promo code: ${trimmedCode}`,
          referenceId: `promo_${promoCode.id}`,
        });
      } catch (txError) {
        console.error('Failed to create transaction record:', txError);
      }

      res.json({
        success: true,
        message: `Code redeemed! $${rewardAmount.toFixed(2)} added to your balance.`,
        reward: `$${rewardAmount.toFixed(2)} Balance Boost`,
        newBalance: newBalance
      });
    } catch (error) {
      console.error("Error redeeming code:", error);
      res.status(500).json({ message: "Failed to redeem code" });
    }
  });

  // Admin endpoint to get user logs
  app.get("/api/admin/logs/:userId", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.id;
      const targetUserId = parseInt(req.params.userId);

      // Check if user is admin
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || (adminUser.subscriptionTier !== 'administrator' && adminUser.subscriptionTier !== 'admin')) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const logs = await storage.getAdminLogs(targetUserId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });

  // Admin endpoint to delete a user
  app.delete("/api/admin/users/:userEmail", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.id;
      const targetUserEmail = req.params.userEmail;

      console.log(`Admin userId ${adminUserId} attempting to delete user ${targetUserEmail}`);

      // Check if user is admin
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || (adminUser.subscriptionTier !== 'administrator' && adminUser.subscriptionTier !== 'admin')) {
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
      if (targetUser.subscriptionTier === 'admin') {
        console.log(`Cannot delete admin account: User ${targetUserEmail}`);
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

  // Add site cash to current user (for refill balance functionality)
  app.post("/api/admin/add-site-cash", requireAuth, async (req: any, res) => {
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
        newBalance: newBalance,
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error adding site cash:", error);
      res.status(500).json({ error: "Failed to add site cash" });
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

  // ── Email Verification ───────────────────────────────────────────
  app.post("/api/auth/resend-verification", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.emailVerified) return res.status(400).json({ message: "Email is already verified" });

      const token = generateToken();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await storage.setVerificationToken(userId, token, expiry);
      await sendVerificationEmail(user.email, token);

      res.json({ success: true, message: "Verification email sent" });
    } catch (error) {
      console.error("Error resending verification:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) return res.status(400).json({ message: "Missing verification token" });

      const user = await storage.getUserByVerificationToken(token);
      if (!user) return res.status(400).json({ message: "Invalid or expired verification token" });

      if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
        return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
      }

      await storage.verifyUserEmail(user.id);

      // Create notification for the user
      await storage.createNotification({
        userId: user.id,
        type: 'achievement',
        title: 'Email Verified',
        message: 'Your email address has been successfully verified.',
      });

      // Redirect to app with success message
      res.redirect("/?verified=true");
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // ── Password Reset ─────────────────────────────────────────────
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await storage.getUserByEmail(email);
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
      }

      const token = generateToken();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await storage.setPasswordResetToken(user.id, token, expiry);
      await sendPasswordResetEmail(user.email, token);

      res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Error sending password reset:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ message: "Token and new password are required" });

      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ message: "Password must contain at least one capital letter" });
      if (!/[0-9]/.test(newPassword)) return res.status(400).json({ message: "Password must contain at least one number" });

      const user = await storage.getUserByResetToken(token);
      if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

      if (user.passwordResetExpiry && new Date(user.passwordResetExpiry) < new Date()) {
        return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearPasswordResetToken(user.id);

      // Create notification
      await storage.createNotification({
        userId: user.id,
        type: 'achievement',
        title: 'Password Changed',
        message: 'Your password has been successfully reset.',
      });

      res.json({ success: true, message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // ── Change Password (authenticated) ────────────────────────────
  app.post("/api/auth/change-password", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current password and new password are required" });
      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ message: "Password must contain at least one capital letter" });
      if (!/[0-9]/.test(newPassword)) return res.status(400).json({ message: "Password must contain at least one number" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Verify current password
      const { scrypt, timingSafeEqual } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);

      if (user.password.includes(".")) {
        const [hashed, salt] = user.password.split(".");
        if (!hashed || !salt) return res.status(400).json({ message: "Invalid current password" });
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (await scryptAsync(currentPassword, salt, 64)) as Buffer;
        if (!timingSafeEqual(hashedBuf, suppliedBuf)) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      } else {
        if (currentPassword !== user.password) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }

      const newHashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, newHashedPassword);

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // ── Notification Routes ────────────────────────────────────────
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifs = await storage.getUserNotifications(userId);
      const unreadCount = await storage.getUnreadNotificationCount(userId);
      res.json({ success: true, data: notifs, unreadCount });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) return res.status(400).json({ message: "Invalid notification ID" });

      await storage.markNotificationRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // ── Transaction History ────────────────────────────────────────
  app.get("/api/transactions", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const type = req.query.type as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const txns = await storage.getUserTransactions(userId, limit, type);
      res.json({ success: true, data: txns });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // ── Admin Transaction + Revenue Endpoints ──────────────────────
  app.get("/api/admin/transactions", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin' && user.username !== 'LUCAS')) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const limit = parseInt(req.query.limit as string) || 100;
      const txns = await storage.getRecentTransactions(limit);
      res.json({ success: true, data: txns });
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/revenue-stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || (user.subscriptionTier !== 'administrator' && user.subscriptionTier !== 'admin' && user.username !== 'LUCAS')) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const stats = await storage.getTransactionStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "Failed to fetch revenue stats" });
    }
  });

  // ── 2FA Routes ─────────────────────────────────────────────────
  app.post("/api/auth/2fa/setup", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.twoFactorEnabled) return res.status(400).json({ message: "2FA is already enabled" });

      // Dynamic import for otpauth
      const { TOTP, Secret } = await import("otpauth");

      const secret = new Secret({ size: 20 });
      const totp = new TOTP({
        issuer: "ORSATH",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret,
      });

      // Store the secret temporarily (not enabled until verified)
      await db
        .update(users)
        .set({ twoFactorSecret: secret.base32 })
        .where(eq(users.id, userId));

      const otpauthUrl = totp.toString();

      res.json({
        success: true,
        secret: secret.base32,
        otpauthUrl,
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  app.post("/api/auth/2fa/verify", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      if (!code) return res.status(400).json({ message: "Verification code is required" });

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorSecret) return res.status(400).json({ message: "2FA setup not initiated" });

      const { TOTP, Secret } = await import("otpauth");
      const totp = new TOTP({
        issuer: "ORSATH",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(user.twoFactorSecret),
      });

      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) return res.status(400).json({ message: "Invalid verification code" });

      await db
        .update(users)
        .set({ twoFactorEnabled: true })
        .where(eq(users.id, userId));

      await storage.createNotification({
        userId,
        type: 'achievement',
        title: 'Two-Factor Authentication Enabled',
        message: 'Your account is now protected with 2FA.',
      });

      res.json({ success: true, message: "2FA has been enabled" });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });

  app.post("/api/auth/2fa/disable", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      if (!code) return res.status(400).json({ message: "Verification code is required" });

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }

      const { TOTP, Secret } = await import("otpauth");
      const totp = new TOTP({
        issuer: "ORSATH",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(user.twoFactorSecret),
      });

      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) return res.status(400).json({ message: "Invalid verification code" });

      await db
        .update(users)
        .set({ twoFactorEnabled: false, twoFactorSecret: null })
        .where(eq(users.id, userId));

      res.json({ success: true, message: "2FA has been disabled" });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // 2FA login verification (called after initial login when 2FA is enabled)
  app.post("/api/auth/2fa/login-verify", async (req, res) => {
    try {
      const { userId, code } = req.body;
      if (!userId || !code) return res.status(400).json({ message: "User ID and code are required" });

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled for this account" });
      }

      const { TOTP, Secret } = await import("otpauth");
      const totp = new TOTP({
        issuer: "ORSATH",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(user.twoFactorSecret),
      });

      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) return res.status(400).json({ message: "Invalid verification code" });

      // Log the user in via passport session
      (req as any).login(user, (err: any) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json({
          success: true,
          user: {
            id: user.id,
            userId: user.userId,
            email: user.email,
            username: user.username,
            subscriptionTier: user.subscriptionTier,
            siteCash: user.siteCash,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
          }
        });
      });
    } catch (error) {
      console.error("Error verifying 2FA login:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });

  // ── Tutorial Completion ──────────────────────────────────────
  app.post("/api/tutorial/complete", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await db
        .update(users)
        .set({ tutorialCompleted: true })
        .where(eq(users.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing tutorial:", error);
      res.status(500).json({ message: "Failed to complete tutorial" });
    }
  });

  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  
  return httpServer;
}