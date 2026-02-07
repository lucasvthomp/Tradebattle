import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("DATABASE_URL prefix:", process.env.DATABASE_URL.substring(0, 45) + "...");

// Single pool shared by drizzle and session store
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Pass the pool directly to drizzle (do NOT use connection string -
// drizzle's internal pool creation fails with pg-connection-string URL parsing)
export const db = drizzle(pool, { schema });
