import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { insertContactSchema, insertWatchlistSchema, registerSchema, loginSchema } from "@shared/schema";
import apiRoutes from "./routes/api.js";
import { errorHandler } from "./utils/errorHandler.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}