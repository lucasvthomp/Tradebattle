import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { User, LoginUser, RegisterUser } from "@shared/schema";

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
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    tableName: "sessions",
  });

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

  // Configure passport local strategy
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
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("=== Registration Request Started ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      const { email, username, password, country, language, currency } = req.body;

      // Validate required fields
      if (!email || !username || !password) {
        console.error("Missing required fields:", { email: !!email, username: !!username, password: !!password });
        return res.status(400).json({ message: "Email, username, and password are required" });
      }

      console.log("Checking if user exists with email:", email);
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log("User already exists with email:", email);
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Validate username
      if (!username || username.length < 3 || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        console.error("Invalid username:", username);
        return res.status(400).json({ message: "Username must be 3-15 characters and contain only letters, numbers, and underscores" });
      }

      console.log("Checking if username is taken:", username);
      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        console.log("Username already taken:", username);
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

      console.log("Creating user with data:", { ...userData, password: "[REDACTED]" });
      const user = await storage.createUser(userData);
      console.log("User created successfully:", { id: user.id, userId: user.userId, username: user.username });

      // Welcome achievement is automatically awarded in createUser()

      // Log the user in automatically
      console.log("Logging user in automatically");
      req.login(user, (err) => {
        if (err) {
          console.error("Error during automatic login:", err);
          return next(err);
        }
        console.log("User logged in successfully");
        res.status(201).json({
          id: user.id,
          userId: user.userId,
          email: user.email,
          username: user.username,
          country: user.country,
          language: user.language,
          currency: user.currency,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
        console.log("=== Registration Request Completed Successfully ===");
      });
    } catch (error) {
      console.error("=== Registration Error ===");
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      console.error("Full error object:", error);
      res.status(500).json({
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Export hashPassword for use in storage
export { hashPassword };