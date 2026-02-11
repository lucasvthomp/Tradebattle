import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { pool } from "./db";
import { User as SchemaUser } from "@shared/schema";
import { containsProfanity } from "./utils/profanityFilter.js";
import { generateToken, sendVerificationEmail } from "./services/email.js";

declare global {
  namespace Express {
    interface User extends SchemaUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  if (!stored.includes(".")) {
    return supplied === stored;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Track failed login attempts for account lockout
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tradebattle-secret-change-me",
      resave: false,
      saveUninitialized: false,
      store: new PgStore({
        pool: pool,
        tableName: 'sessions',
        createTableIfMissing: true,
        pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy: authenticate by username + password with account lockout
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check for account lockout
        const lockoutKey = username.toLowerCase();
        const lockoutInfo = failedLoginAttempts.get(lockoutKey);
        if (lockoutInfo && lockoutInfo.lockedUntil > Date.now()) {
          const minutesLeft = Math.ceil((lockoutInfo.lockedUntil - Date.now()) / 60000);
          return done(null, false, { message: `Account temporarily locked. Try again in ${minutesLeft} minutes.` });
        }

        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          // Track failed attempt
          const current = failedLoginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 };
          current.count += 1;
          if (current.count >= MAX_FAILED_ATTEMPTS) {
            current.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
            current.count = 0;
          }
          failedLoginAttempts.set(lockoutKey, current);
          return done(null, false, { message: "Invalid username or password" });
        }
        if (user.banned) {
          return done(null, false, { message: "Your account has been suspended." });
        }
        // Clear failed attempts on successful login
        failedLoginAttempts.delete(lockoutKey);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  // ── Register ──────────────────────────────────────────────────────
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, username, password, country, language, currency } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ message: "Email, username, and password are required" });
      }

      if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username)) {
        return res.status(400).json({ message: "Username must be 3-20 characters, letters/numbers, and at most one underscore" });
      }

      if (containsProfanity(username)) {
        return res.status(400).json({ message: "Username contains inappropriate language" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one capital letter" });
      }

      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one number" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      const user = await storage.createUser({
        email,
        username,
        password,
        country: country || null,
        language: language || "English",
        currency: currency || "USD",
      });

      // Send verification email (non-blocking)
      try {
        const token = generateToken();
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await storage.setVerificationToken(user.id, token, expiry);
        await sendVerificationEmail(email, token);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't block registration if email fails
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(sanitizeUser(user));
      });
    } catch (error: any) {
      console.error("Registration error:", error?.message, error?.stack);
      res.status(500).json({ message: "Registration failed", error: error?.message });
    }
  });

  // ── Login ─────────────────────────────────────────────────────────
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SchemaUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });

      // If 2FA is enabled, don't log in yet — require 2FA verification
      if (user.twoFactorEnabled) {
        return res.json({
          requires2FA: true,
          userId: user.id,
          message: "Two-factor authentication required",
        });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  // ── Logout ────────────────────────────────────────────────────────
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // ── Current User ──────────────────────────────────────────────────
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// Strip sensitive fields before sending to client
function sanitizeUser(user: SchemaUser) {
  return {
    id: user.id,
    userId: user.userId,
    email: user.email,
    username: user.username,
    country: user.country,
    language: user.language,
    currency: user.currency,
    subscriptionTier: user.subscriptionTier,
    profilePicture: user.profilePicture,
    siteCash: user.siteCash,
    balance: user.balance,
    banned: user.banned,
    withdrawalFrozen: user.withdrawalFrozen,
    depositFrozen: user.depositFrozen,
    tournamentRestricted: user.tournamentRestricted,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
