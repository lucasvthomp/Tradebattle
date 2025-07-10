import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getStockQuote, getCompanyProfile, getMarketData, getMarketDataWithHistory, getHistoricalData, POPULAR_STOCKS } from "./finnhub";
import { insertContactSchema, insertWatchlistSchema } from "@shared/schema";
import { searchCache, CACHE_TTL } from "./cache";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  app.get('/api/news/breaking', async (req, res) => {
    try {
      const news = await storage.getBreakingNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  app.get('/api/news/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const news = await storage.getNewsByCategory(category);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news by category:", error);
      res.status(500).json({ message: "Failed to fetch news by category" });
    }
  });

  // Watchlist routes (protected)
  app.get('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watchlist = await storage.getUserWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWatchlistSchema.parse(req.body);
      const watchlistItem = await storage.addToWatchlist(userId, validatedData);
      res.json(watchlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete('/api/watchlist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.removeFromWatchlist(userId, id);
      res.json({ message: "Removed from watchlist" });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating contact submission:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
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

  // Stock market data routes
  app.get('/api/stock/quote/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const quote = await getStockQuote(symbol);
      
      if (!quote) {
        return res.status(404).json({ error: 'Stock not found' });
      }
      
      res.json(quote);
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stock/profile/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const profile = await getCompanyProfile(symbol);
      
      if (!profile) {
        return res.status(404).json({ error: 'Company profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stocks/popular', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const withHistory = req.query.withHistory === 'true';
      const symbols = POPULAR_STOCKS.slice(0, limit);
      
      if (withHistory) {
        const marketData = await getMarketDataWithHistory(symbols);
        res.json(marketData);
      } else {
        const marketData = await getMarketData(symbols);
        res.json(marketData);
      }
    } catch (error) {
      console.error('Error fetching popular stocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stocks/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.status(400).json({ error: 'Query parameter required' });
      }
      
      const searchTerm = query.toUpperCase();
      const matchingSymbols = POPULAR_STOCKS.filter(symbol => 
        symbol.includes(searchTerm)
      );
      
      if (matchingSymbols.length === 0) {
        // Try to fetch the symbol directly
        const quote = await getStockQuote(searchTerm);
        const profile = await getCompanyProfile(searchTerm);
        
        if (quote && profile) {
          return res.json([{
            symbol: quote.symbol,
            name: profile.name,
            currentPrice: quote.currentPrice,
            change: quote.change,
            changePercent: quote.changePercent,
            marketCap: profile.marketCap,
            sector: profile.sector
          }]);
        }
        
        return res.json([]);
      }
      
      const marketData = await getMarketData(matchingSymbols.slice(0, 10));
      res.json(marketData);
    } catch (error) {
      console.error('Error searching stocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stocks/batch', async (req, res) => {
    try {
      const symbols = req.query.symbols as string;
      if (!symbols) {
        return res.status(400).json({ error: 'Symbols parameter required' });
      }
      
      const withHistory = req.query.withHistory === 'true';
      const symbolList = symbols.split(',').map(s => s.toUpperCase()).slice(0, 20);
      
      if (withHistory) {
        const marketData = await getMarketDataWithHistory(symbolList);
        res.json(marketData);
      } else {
        const marketData = await getMarketData(symbolList);
        res.json(marketData);
      }
    } catch (error) {
      console.error('Error fetching batch stocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stock/history/:symbol/:period', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const period = req.params.period;
      
      const historicalData = await getHistoricalData(symbol, period);
      
      if (!historicalData) {
        return res.status(404).json({ error: 'Historical data not found' });
      }
      
      res.json(historicalData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
