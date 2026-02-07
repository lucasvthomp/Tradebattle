import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Separate pool for connect-pg-simple session store
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Let drizzle manage its own connection pool from the connection string
export const db = drizzle(process.env.DATABASE_URL, { schema });
