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

    // Note: Admin promotion should be done manually via database or admin panel
    // Removed automatic promotion to prevent security issues

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

    // Add wallet authentication columns for future crypto payment system
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42) UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_nonce VARCHAR(64);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nonce_expiry TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_verified BOOLEAN DEFAULT false NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_linked_at TIMESTAMP;
    `);

    // Make email and password optional for wallet-only users
    await client.query(`
      ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    `);

    // Create crypto_transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        wallet_address VARCHAR(42) NOT NULL,
        transaction_hash VARCHAR(66) UNIQUE NOT NULL,
        transaction_type VARCHAR(20) NOT NULL,
        crypto_amount VARCHAR(78) NOT NULL,
        crypto_currency VARCHAR(10) NOT NULL,
        usd_equivalent NUMERIC(15, 2),
        block_number INTEGER,
        confirmations INTEGER DEFAULT 0 NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        chain_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        confirmed_at TIMESTAMP
      );
    `);

    // Create wallet_connection_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_connection_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        wallet_address VARCHAR(42) NOT NULL,
        action VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
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

    // Create performance indexes
    await client.query(`
      -- Indexes for tournament participants queries
      CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_user
        ON tournament_participants(tournament_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_tournament_participants_user
        ON tournament_participants(user_id);

      -- Indexes for tournament stock purchases
      CREATE INDEX IF NOT EXISTS idx_tournament_stock_purchases_tournament_user
        ON tournament_stock_purchases(tournament_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_tournament_stock_purchases_symbol
        ON tournament_stock_purchases(symbol);

      -- Indexes for promo codes
      CREATE INDEX IF NOT EXISTS idx_promo_codes_code
        ON promo_codes(code);
      CREATE INDEX IF NOT EXISTS idx_promo_codes_active
        ON promo_codes(is_active, expires_at);

      -- Indexes for code redemptions
      CREATE INDEX IF NOT EXISTS idx_code_redemptions_user
        ON code_redemptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_code_redemptions_code
        ON code_redemptions(code_id);

      -- Indexes for notifications
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read
        ON notifications(user_id, read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created
        ON notifications(created_at DESC);

      -- Indexes for friendships
      CREATE INDEX IF NOT EXISTS idx_friendships_requester
        ON friendships(requester_id, status);
      CREATE INDEX IF NOT EXISTS idx_friendships_addressee
        ON friendships(addressee_id, status);

      -- Indexes for chat messages
      CREATE INDEX IF NOT EXISTS idx_chat_messages_tournament
        ON chat_messages(tournament_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user
        ON chat_messages(user_id);

      -- Indexes for trade history
      CREATE INDEX IF NOT EXISTS idx_trade_history_user
        ON trade_history(user_id, created_at DESC);
    `);

    // Create crypto_withdrawals table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount NUMERIC(15, 2) NOT NULL,
        currency VARCHAR(20) NOT NULL,
        address VARCHAR(255) NOT NULL,
        transaction_fee NUMERIC(15, 2) NOT NULL,
        payout_amount NUMERIC(15, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payout_id VARCHAR(255),
        tx_hash VARCHAR(255),
        error_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMP,
        confirmed_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_user_id ON crypto_withdrawals(user_id);
      CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_status ON crypto_withdrawals(status);
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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
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

    // Don't expose internal error details in production
    const message = status === 500 && process.env.NODE_ENV === 'production'
      ? "An unexpected error occurred"
      : (err.message || "Internal Server Error");

    res.status(status).json({ message });

    // Log the full error for debugging
    if (status === 500) {
      log(`ERROR: ${err.message}`);
      if (err.stack) {
        log(err.stack);
      }
    }
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
