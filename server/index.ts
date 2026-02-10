import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { tournamentScheduler } from "./services/tournamentScheduler";
import { db } from "./db";
import { pool } from "./db";

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

    log('Database migrations completed successfully');
  } catch (error) {
    log('Migration error: ' + (error as Error).message);
    throw error;
  } finally {
    client.release();
  }
}

const app = express();
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
  // Run database migrations before starting the server
  await runMigrations();

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
