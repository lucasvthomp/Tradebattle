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
import { ethers } from "ethers";
import rateLimit from "express-rate-limit";

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

// ── Wallet Authentication Helpers ──────────────────────────────────

// Generate cryptographically secure nonce
function generateNonce(): string {
  return randomBytes(32).toString('hex'); // 64 character hex
}

// Construct message for user to sign
function constructAuthMessage(nonce: string, timestamp: string, wallet: string): string {
  return `Sign this message to authenticate with Tradebattle.

Nonce: ${nonce}
Timestamp: ${timestamp}
Wallet: ${wallet}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

// Verify wallet signature
async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Authenticate user via wallet signature
async function authenticateWallet(
  walletAddress: string,
  signature: string
): Promise<SchemaUser | null> {
  try {
    // 1. Fetch user and nonce
    const user = await storage.getUserByWallet(walletAddress);
    if (!user) return null;

    // 2. Verify nonce exists and hasn't expired
    if (!user.authNonce || !user.nonceExpiry) {
      throw new Error('No pending authentication request');
    }

    if (new Date() > user.nonceExpiry) {
      throw new Error('Authentication request expired');
    }

    // 3. Reconstruct message
    const message = constructAuthMessage(
      user.authNonce,
      user.nonceExpiry.toISOString(),
      walletAddress
    );

    // 4. Verify signature
    const isValid = await verifyWalletSignature(walletAddress, signature, message);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // 5. Invalidate nonce (prevent replay)
    await storage.invalidateNonce(user.id);

    // 6. Log successful authentication
    await storage.logWalletConnection({
      userId: user.id,
      walletAddress,
      action: 'login_success',
      success: true,
    });

    return user;

  } catch (error: any) {
    console.error('Wallet authentication failed:', error);

    await storage.logWalletConnection({
      walletAddress,
      action: 'login_failed',
      success: false,
      errorMessage: error.message,
    });

    return null;
  }
}

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
        if (!user || !user.password || !(await comparePasswords(password, user.password))) {
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
      console.error("Registration error:", error?.message);
      res.status(500).json({ message: "Registration failed" });
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

  // ── Wallet Authentication Endpoints ───────────────────────────────

  // Rate limiters
  const nonceRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many authentication attempts',
  });

  const signatureRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts',
  });

  // 1. Request nonce for wallet authentication
  app.post('/api/auth/wallet/nonce', nonceRateLimiter, async (req, res) => {
    try {
      const { walletAddress } = req.body;

      if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const nonce = generateNonce();
      const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      let user = await storage.getUserByWallet(walletAddress);
      let isNewUser = false;

      if (user) {
        await storage.updateUserNonce(user.id, nonce, expiry);
      } else {
        await storage.setTempNonce(walletAddress, nonce, expiry);
        isNewUser = true;
      }

      res.json({
        nonce,
        message: constructAuthMessage(nonce, expiry.toISOString(), walletAddress),
        isNewUser,
      });

    } catch (error) {
      console.error('Nonce generation error:', error);
      res.status(500).json({ error: 'Failed to generate authentication challenge' });
    }
  });

  // 2. Verify signature and login
  app.post('/api/auth/wallet/verify', signatureRateLimiter, async (req, res) => {
    try {
      const { walletAddress, signature } = req.body;

      const user = await authenticateWallet(walletAddress, signature);

      if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      if (user.banned) {
        return res.status(403).json({ error: 'Account suspended' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return res.status(500).json({ error: 'Failed to create session' });
        }

        res.json({
          user: sanitizeUser(user),
          message: 'Authentication successful',
        });
      });

    } catch (error) {
      console.error('Signature verification error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // 3. Register new wallet user
  app.post('/api/auth/wallet/register', async (req, res) => {
    try {
      const { walletAddress, signature, username, email, country, language, currency } = req.body;

      // Verify signature first
      const tempNonce = await storage.getTempNonce(walletAddress);
      if (!tempNonce || new Date() > tempNonce.expiry) {
        return res.status(400).json({ error: 'Invalid or expired authentication request' });
      }

      const message = constructAuthMessage(
        tempNonce.nonce,
        tempNonce.expiry.toISOString(),
        walletAddress
      );

      const isValid = await verifyWalletSignature(walletAddress, signature, message);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Validate username
      if (!username || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username)) {
        return res.status(400).json({ error: 'Username must be 3-20 characters, letters/numbers, and at most one underscore' });
      }

      if (containsProfanity(username)) {
        return res.status(400).json({ error: 'Username contains inappropriate language' });
      }

      // Check duplicates
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const existingWallet = await storage.getUserByWallet(walletAddress);
      if (existingWallet) {
        return res.status(400).json({ error: 'Wallet already registered' });
      }

      // Create user (no password required)
      const user = await storage.createWalletUser({
        walletAddress,
        username,
        email: email || null,
        country: country || null,
        language: language || 'English',
        currency: currency || 'USD',
      });

      await storage.deleteTempNonce(walletAddress);

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Registration successful but failed to login' });
        }

        res.status(201).json({
          user: sanitizeUser(user),
          message: 'Registration successful',
        });
      });

    } catch (error) {
      console.error('Wallet registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // 4. Link wallet to existing account
  app.post('/api/user/link-wallet', requireAuth, async (req, res) => {
    try {
      const { walletAddress, signature } = req.body;
      const userId = req.user!.id;

      const tempNonce = await storage.getTempNonce(walletAddress);
      if (!tempNonce) {
        return res.status(400).json({ error: 'Please request a new authentication challenge' });
      }

      const message = constructAuthMessage(
        tempNonce.nonce,
        tempNonce.expiry.toISOString(),
        walletAddress
      );

      const isValid = await verifyWalletSignature(walletAddress, signature, message);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Check wallet isn't already linked
      const existingWallet = await storage.getUserByWallet(walletAddress);
      if (existingWallet && existingWallet.id !== userId) {
        return res.status(400).json({ error: 'Wallet already linked to another account' });
      }

      await storage.linkWallet(userId, walletAddress);
      await storage.deleteTempNonce(walletAddress);

      // Award bonus
      await storage.addSiteCash(userId, 100, 'Wallet linking bonus');

      res.json({
        success: true,
        walletAddress,
        bonus: 100,
      });

    } catch (error) {
      console.error('Wallet linking error:', error);
      res.status(500).json({ error: 'Failed to link wallet' });
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
    walletAddress: user.walletAddress,
    walletVerified: user.walletVerified,
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
