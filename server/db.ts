import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("=== DB INIT v3 ===");

// Parse the DATABASE_URL ourselves and pass individual parameters to pg.Pool.
// This bypasses pg-connection-string's new URL() call which fails on Railway.
let poolConfig: pg.PoolConfig;

try {
  const dbUrl = new URL(process.env.DATABASE_URL);
  poolConfig = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 5432,
    database: dbUrl.pathname.slice(1),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
  };
  console.log("Parsed DB URL - host:", dbUrl.hostname, "port:", dbUrl.port, "db:", dbUrl.pathname.slice(1));
} catch (e) {
  // If new URL() also fails, log the issue and try a regex fallback
  const masked = process.env.DATABASE_URL.replace(/:[^@]*@/, ':***@');
  console.error("URL parse failed. Masked URL:", masked);
  console.error("URL length:", process.env.DATABASE_URL.length);
  console.error("First 20 chars (hex):", Buffer.from(process.env.DATABASE_URL.substring(0, 20)).toString('hex'));

  // Regex fallback for postgresql://user:pass@host:port/database
  const match = process.env.DATABASE_URL.match(
    /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/
  );
  if (match) {
    poolConfig = {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4]),
      database: match[5],
    };
    console.log("Regex fallback parsed - host:", match[3], "port:", match[4]);
  } else {
    console.error("Regex fallback also failed, using connectionString as last resort");
    poolConfig = { connectionString: process.env.DATABASE_URL };
  }
}

export const pool = new pg.Pool(poolConfig);

// Test pool immediately
pool.query('SELECT 1').then(() => {
  console.log("Pool connection test: OK");
}).catch((e: Error) => {
  console.error("Pool connection test FAILED:", e.message);
});

export const db = drizzle(pool, { schema });
