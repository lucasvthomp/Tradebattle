import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { insertContactSchema, insertWatchlistSchema, insertPortfolioSchema, registerSchema, loginSchema, updateUserSubscriptionSchema } from "@shared/schema";
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
      const validatedData = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email()
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Subscription update route (protected)
  app.put('/api/user/subscription', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = updateUserSubscriptionSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserSubscription(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription tier", errors: error.errors });
      }
      console.error("Error updating user subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Studies routes
  app.get('/api/studies', async (req, res) => {
    try {
      const studies = await storage.getStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error fetching studies:", error);
      res.status(500).json({ message: "Failed to fetch studies" });
    }
  });

  app.get('/api/studies/featured', async (req, res) => {
    try {
      const studies = await storage.getFeaturedStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error fetching featured studies:", error);
      res.status(500).json({ message: "Failed to fetch featured studies" });
    }
  });

  app.get('/api/studies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const study = await storage.getStudy(id);
      if (!study) {
        return res.status(404).json({ message: "Study not found" });
      }
      res.json(study);
    } catch (error) {
      console.error("Error fetching study:", error);
      res.status(500).json({ message: "Failed to fetch study" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get('/api/news/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const news = await storage.getNewsByCategory(category);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news by category:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get('/api/news/breaking', async (req, res) => {
    try {
      const news = await storage.getBreakingNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  // Research insights routes
  app.get('/api/insights', async (req, res) => {
    try {
      const insights = await storage.getActiveInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
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
      
      // Check subscription tier limits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get current watchlist count
      const currentWatchlist = await storage.getUserWatchlist(userId);
      
      // Check if user has reached their limit
      if (user.subscriptionTier === 'novice' && currentWatchlist.length >= 5) {
        return res.status(403).json({ 
          message: "Free accounts are limited to 5 equities in their watchlist. Please upgrade to add more stocks.",
          limit: 5,
          current: currentWatchlist.length
        });
      }
      
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

  // Portfolio routes (protected)
  app.get('/api/portfolio', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const portfolio = await storage.getUserPortfolio(userId);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post('/api/portfolio/buy', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { symbol, companyName, shares, price } = req.body;
      
      // Validate inputs
      if (!symbol || !companyName || !shares || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      if (!Number.isInteger(shares) || shares <= 0) {
        return res.status(400).json({ message: "Shares must be a positive integer" });
      }
      
      const totalCost = (parseFloat(price) * shares).toFixed(2);
      const currentBalance = await storage.getUserBalance(userId);
      
      if (parseFloat(totalCost) > parseFloat(currentBalance)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Add to portfolio
      const portfolioItem = await storage.addToPortfolio(userId, {
        symbol,
        companyName,
        shares,
        purchasePrice: price,
      });
      
      // Update user balance
      const newBalance = (parseFloat(currentBalance) - parseFloat(totalCost)).toFixed(2);
      await storage.updateUserBalance(userId, newBalance);
      
      res.json({ success: true, portfolioItem, newBalance });
    } catch (error) {
      console.error("Error buying stock:", error);
      res.status(500).json({ message: "Failed to buy stock" });
    }
  });

  app.get('/api/balance', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const balance = await storage.getUserBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
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

  // Admin endpoint to update user subscription
  app.put("/api/admin/users/:userId/subscription", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      const targetUserId = parseInt(req.params.userId);
      const { subscriptionTier } = req.body;
      
      // Check if user is admin (userId 0, 1, or 2)
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      // Get the user to be updated
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update subscription
      const updatedUser = await storage.updateUserSubscription(targetUserId, { subscriptionTier });
      
      // Log the admin action
      await storage.createAdminLog({
        adminUserId: req.user.id,
        targetUserId: targetUserId,
        action: "subscription_change",
        oldValue: targetUser.subscriptionTier,
        newValue: subscriptionTier,
        notes: `Subscription changed from ${targetUser.subscriptionTier} to ${subscriptionTier}`,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user subscription:", error);
      res.status(500).json({ message: "Failed to update user subscription" });
    }
  });

  // Admin endpoint to get logs for a specific user
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

  // Partner management endpoints
  app.get("/api/partners", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      
      // Check if user is admin (userId 0, 1, or 2)
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", requireAuth, async (req: any, res) => {
    try {
      const adminUserId = req.user.userId;
      
      // Check if user is admin (userId 0, 1, or 2)
      if (adminUserId !== 0 && adminUserId !== 1 && adminUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const partner = await storage.createPartner(req.body);
      res.status(201).json(partner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(500).json({ message: "Failed to create partner" });
    }
  });

  // Research requests endpoints
  app.get("/api/research-requests", requireAuth, async (req: any, res) => {
    try {
      const requests = await storage.getResearchRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching research requests:", error);
      res.status(500).json({ message: "Failed to fetch research requests" });
    }
  });



  // Chat endpoints
  app.get("/api/chat/conversations", requireAuth, async (req: any, res) => {
    try {
      const conversations = await storage.getUserConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/chat/messages/:conversationId", requireAuth, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", requireAuth, async (req: any, res) => {
    try {
      const { receiverUserId, message } = req.body;
      const senderId = req.user.id;
      
      // Create conversation ID (ensure consistent ordering)
      const conversationId = senderId < receiverUserId 
        ? `${senderId}_${receiverUserId}` 
        : `${receiverUserId}_${senderId}`;

      const chatMessage = await storage.createChatMessage({
        conversationId,
        senderUserId: senderId,
        receiverUserId: parseInt(receiverUserId),
        message,
      });

      res.status(201).json(chatMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Research publications endpoints
  app.get("/api/research-publications", async (req, res) => {
    try {
      const publications = await storage.getResearchPublications(true); // Only published
      res.json(publications);
    } catch (error) {
      console.error("Error fetching research publications:", error);
      res.status(500).json({ message: "Failed to fetch research publications" });
    }
  });

  app.get("/api/research-publications/drafts", requireAuth, async (req: any, res) => {
    try {
      const partnerUserId = req.user.userId;
      
      // Check if user is partner (userId 0, 1, or 2)
      if (partnerUserId !== 0 && partnerUserId !== 1 && partnerUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Partner privileges required." });
      }
      
      const publications = await storage.getResearchPublications(); // All publications
      res.json(publications);
    } catch (error) {
      console.error("Error fetching research publications:", error);
      res.status(500).json({ message: "Failed to fetch research publications" });
    }
  });

  app.post("/api/research-publications", requireAuth, async (req: any, res) => {
    try {
      const partnerUserId = req.user.userId;
      
      // Check if user is partner (userId 0, 1, or 2)
      if (partnerUserId !== 0 && partnerUserId !== 1 && partnerUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Partner privileges required." });
      }
      
      const publication = await storage.createResearchPublication({
        ...req.body,
        authorId: req.user.id,
      });
      res.status(201).json(publication);
    } catch (error) {
      console.error("Error creating research publication:", error);
      res.status(500).json({ message: "Failed to create research publication" });
    }
  });

  app.put("/api/research-publications/:id", requireAuth, async (req: any, res) => {
    try {
      const partnerUserId = req.user.userId;
      
      // Check if user is partner (userId 0, 1, or 2)
      if (partnerUserId !== 0 && partnerUserId !== 1 && partnerUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Partner privileges required." });
      }
      
      const id = parseInt(req.params.id);
      const publication = await storage.updateResearchPublication(id, req.body);
      res.json(publication);
    } catch (error) {
      console.error("Error updating research publication:", error);
      res.status(500).json({ message: "Failed to update research publication" });
    }
  });

  app.delete("/api/research-publications/:id", requireAuth, async (req: any, res) => {
    try {
      const partnerUserId = req.user.userId;
      
      // Check if user is partner (userId 0, 1, or 2)
      if (partnerUserId !== 0 && partnerUserId !== 1 && partnerUserId !== 2) {
        return res.status(403).json({ message: "Access denied. Partner privileges required." });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteResearchPublication(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting research publication:", error);
      res.status(500).json({ message: "Failed to delete research publication" });
    }
  });

  // Research requests for professional users
  app.post("/api/research-requests", requireAuth, async (req: any, res) => {
    try {
      // Check if user has professional subscription
      if (req.user.subscriptionTier !== 'professional') {
        return res.status(403).json({ message: "Professional subscription required for custom research requests." });
      }
      
      const requestData = {
        clientUserId: req.user.id,
        target: req.body.target,
        description: req.body.description,
        category: req.body.type, // company or sector
        status: 'pending' as const,
        priority: 'medium' as const,
      };
      
      const researchRequest = await storage.createResearchRequest(requestData);
      res.status(201).json(researchRequest);
    } catch (error) {
      console.error("Error creating research request:", error);
      res.status(500).json({ message: "Failed to create research request" });
    }
  });

  // System status endpoint for admin panel
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
      console.error("Error getting system status:", error);
      res.status(500).json({ message: "Failed to get system status" });
    }
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}