import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { tournamentScheduler } from "./services/tournamentScheduler";
import { db } from "./db";
import { pool } from "./db";
import { trackUserActivity } from "./middleware/activityTracker";

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Add missing columns to users table
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_note TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS withdrawal_frozen BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS deposit_frozen BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tournament_restricted BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false NOT NULL;
    `);

    // Create admin_logs table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_user_id INTEGER NOT NULL REFERENCES users(id),
        target_user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR NOT NULL,
        old_value TEXT,
        new_value TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create chat_messages table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        username VARCHAR(15) NOT NULL,
        profile_picture TEXT,
        message TEXT NOT NULL,
        tournament_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create friendships table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER NOT NULL REFERENCES users(id),
        addressee_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
      );
    `);

    // Add payout_structure column to tournaments if it doesn't exist
    await client.query(`
      ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS payout_structure VARCHAR(50) NOT NULL DEFAULT 'winner_take_all';
    `);

    // Create tournament_results table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_results (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        rank INTEGER NOT NULL,
        portfolio_value NUMERIC(15, 2) NOT NULL,
        gain_percent NUMERIC(10, 2) NOT NULL,
        payout NUMERIC(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create promo_codes table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        reward_type VARCHAR(20) NOT NULL,
        reward_amount NUMERIC(15, 2) NOT NULL,
        usage_type VARCHAR(20) NOT NULL,
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0 NOT NULL,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create code_redemptions table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS code_redemptions (
        id SERIAL PRIMARY KEY,
        code_id INTEGER NOT NULL REFERENCES promo_codes(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        redeemed_at TIMESTAMP DEFAULT NOW() NOT NULL,
        CONSTRAINT unique_code_user UNIQUE (code_id, user_id)
      );
    `);

    // Promote the first account (Lucas) to administrator
    await client.query(`
      UPDATE users SET subscription_tier = 'administrator', user_id = 0
      WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1)
      AND subscription_tier != 'administrator';
    `);

    // Fix database column defaults and zero out all balances
    await client.query(`
      ALTER TABLE users ALTER COLUMN balance SET DEFAULT '0.00';
      ALTER TABLE users ALTER COLUMN site_cash SET DEFAULT '0.00';
      ALTER TABLE users ALTER COLUMN personal_balance SET DEFAULT '0.00';
      ALTER TABLE users ALTER COLUMN total_deposited SET DEFAULT '0.00';
      UPDATE users SET site_cash = '0.00', balance = '0.00';
    `);

    // Add email verification, password reset, and 2FA columns
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0 NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
    `);

    // Add lastActivity column for online status tracking
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();
      CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);
    `);

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        balance_before NUMERIC(15, 2) NOT NULL,
        balance_after NUMERIC(15, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'completed' NOT NULL,
        description TEXT,
        reference_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    log('Database migrations completed successfully');
  } catch (error) {
    log('Migration error: ' + (error as Error).message);
    throw error;
  } finally {
    client.release();
  }
}

const app = express();

// Security headers via helmet (configured for compatibility with Vite dev server)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to avoid conflicts with Vite/inline scripts
  crossOriginEmbedderPolicy: false,
}));

// General rate limiter: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict rate limiter for auth endpoints: 5 per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

// Trade rate limiter: 10 per minute
const tradeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many trade requests, please slow down." },
});

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// Track user activity for online status
app.use('/api', trackUserActivity);

// Apply stricter limits to auth endpoints
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Apply trade limiter to trading endpoints
app.use('/api/tournaments/:id/purchase', tradeLimiter);
app.use('/api/tournaments/:id/sell', tradeLimiter);

app.use(express.json({ limit: '50mb' })); // Increase limit for profile pictures
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run database migrations before starting the server (non-fatal)
  try {
    await runMigrations();
  } catch (error) {
    log('WARNING: Database migrations failed, server will start without them.');
    log('Migration error: ' + (error as Error).message);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use Railway's PORT or default to 8080
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Start tournament expiration scheduler with database connectivity check
    try {
      // Test database connection before starting scheduler
      await db.execute('SELECT 1');
      tournamentScheduler.start();
      log('Tournament scheduler started successfully');
    } catch (error) {
      log('Tournament scheduler disabled due to database connectivity issues');
      log('Error: ' + (error as Error).message);
    }
  });
})();
