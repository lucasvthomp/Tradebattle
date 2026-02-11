import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Set it in Railway's Variables tab.");
}

// Validate the URL before using it
try {
  const testUrl = new URL(process.env.DATABASE_URL);
  if (testUrl.hostname === "host" || testUrl.port === "port") {
    throw new Error(
      "DATABASE_URL is still set to the placeholder value. " +
      "Go to Railway → your Postgres service → Variables tab → copy the DATABASE_URL, " +
      "then paste it into your web service's Variables."
    );
  }
  console.log(`DB connecting to ${testUrl.hostname}:${testUrl.port}/${testUrl.pathname.slice(1)}`);
} catch (e: any) {
  if (e.code === "ERR_INVALID_URL") {
    throw new Error(
      `DATABASE_URL is not a valid URL. Current value starts with: "${process.env.DATABASE_URL.substring(0, 20)}...". ` +
      "It should look like: postgresql://user:pass@host:5432/dbname"
    );
  }
  throw e;
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

export const db = drizzle(pool, { schema });
