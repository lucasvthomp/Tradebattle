import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { User, LoginUser, RegisterUser } from "@shared/schema";

// Global flag to disable authentication entirely
const AUTH_DISABLED = process.env.AUTH_DISABLED === 'true' || true; // Temporarily forcing true
export { AUTH_DISABLED };

// Development user when auth is disabled
const DEV_USER: User = {
  id: 1,
  userId: null,
  email: "admin@dev.local",
  username: "admin",
  profilePicture: null,
  lastUsernameChange: null,
  password: "admin",
  country: "US",
  language: "en",
  currency: "USD",
  balance: "100000",
  siteCash: "10000",
  subscriptionTier: "premium",
  premiumUpgradeDate: new Date(),
  personalBalance: "50000",
  totalDeposited: "0",
  tournamentWins: 0,
  banned: false,
  adminNote: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Handle both hashed and plain text passwords during migration
  if (!stored.includes(".")) {
    // Plain text password - compare directly
    return supplied === stored;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (AUTH_DISABLED) {
    console.warn("⚠️  AUTHENTICATION DISABLED - All users will be logged in as admin");
    // Short-circuit authentication - all requests get admin user
    app.use((req, res, next) => {
      req.user = DEV_USER;
      req.isAuthenticated = () => true;
      next();
    });
    return;
  }

  // Session configuration with database fallback
  let sessionStore: any;
  let isDatabaseAvailable = true;
  
  try {
    const PostgresSessionStore = connectPg(session);
    sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "sessions",
    });
  } catch (error) {
    console.log("Database session store unavailable, using memory store");
    isDatabaseAvailable = false;
    const MemoryStoreSession = MemoryStore(session);
    sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy with database fallback
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          // Check if this is a Neon API disabled error
          if (error instanceof Error && error.message.includes("The endpoint has been disabled")) {
            console.log("Database unavailable, using development bypass for any credentials");
            // Create a mock admin user for development access
            const mockAdmin: User = {
              id: 1,
              userId: null,
              email: "admin@dev.local",
              username: "admin",
              profilePicture: null,
              lastUsernameChange: null,
              password: "admin", // In real scenarios, this would be hashed
              country: "US",
              language: "en",
              currency: "USD",
              balance: "100000",
              siteCash: "10000",
              subscriptionTier: "premium",
              premiumUpgradeDate: new Date(),
              personalBalance: "50000",
              totalDeposited: "0",
              tournamentWins: 0,
              banned: false,
              adminNote: null,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return done(null, mockAdmin);
          }
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      // If database is unavailable, return the mock admin user for id 1
      if (error instanceof Error && error.message.includes("The endpoint has been disabled") && id === 1) {
        const mockAdmin: User = {
          id: 1,
          userId: null,
          email: "admin@dev.local",
          username: "admin",
          profilePicture: null,
          lastUsernameChange: null,
          password: "admin",
          country: "US",
          language: "en",
          currency: "USD",
          balance: "100000",
          siteCash: "10000",
          subscriptionTier: "premium",
          premiumUpgradeDate: new Date(),
          personalBalance: "50000",
          totalDeposited: "0",
          tournamentWins: 0,
          banned: false,
          adminNote: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return done(null, mockAdmin);
      }
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, username, password, country, language, currency } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Validate username
      if (!username || username.length < 3 || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ message: "Username must be 3-15 characters and contain only letters, numbers, and underscores" });
      }

      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Create user (password will be hashed in storage)
      const userData: any = {
        email,
        username,
        password,
        country: country || null,
        language: language || "English",
        currency: currency || "USD",
        subscriptionTier: "free",
        premiumUpgradeDate: null,
      };

      const user = await storage.createUser(userData);

      // Award achievements for new user
      try {
        // Award Welcome achievement
        await storage.awardAchievementByParams(user.id, "Welcome", "Common", "Welcome to ORSATH", "Welcome to the platform!");
        

      } catch (achievementError) {
        console.error("Error awarding achievements:", achievementError);
        // Don't fail registration if achievements fail
      }

      // Log the user in automatically
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          userId: user.userId,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          country: user.country,
          language: user.language,
          currency: user.currency,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.json({
          id: user.id,
          userId: user.userId,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    if (AUTH_DISABLED) {
      // Return dev user without hitting database
      return res.json({
        id: DEV_USER.id,
        userId: DEV_USER.userId,
        email: DEV_USER.email,
        username: DEV_USER.username,
        subscriptionTier: DEV_USER.subscriptionTier,
        siteCash: DEV_USER.siteCash,
        balance: DEV_USER.balance,
        createdAt: DEV_USER.createdAt,
        updatedAt: DEV_USER.updatedAt,
      });
    }
    
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Always fetch fresh user data from database to ensure latest subscription tier
      const freshUser = await storage.getUser(req.user.id);
      if (!freshUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: freshUser.id,
        userId: freshUser.userId,
        email: freshUser.email,
        username: freshUser.username,
        displayName: freshUser.displayName,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        subscriptionTier: freshUser.subscriptionTier,
        siteCash: freshUser.siteCash,
        balance: freshUser.balance,
        createdAt: freshUser.createdAt,
        updatedAt: freshUser.updatedAt,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// Authentication middleware
export function requireAuth(req: any, res: any, next: any) {
  if (AUTH_DISABLED) {
    return next(); // Skip authentication check
  }
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Export hashPassword for use in storage
export { hashPassword };