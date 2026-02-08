import { Pool } from "pg";

const DATABASE_URL =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/flareaid";

console.log("[DB] Initializing PostgreSQL connection to:", DATABASE_URL.replace(/:[^:@]+@/, ":***@"));

// Remote databases (Vercel/Neon, Railway) need SSL
const needsSsl =
  DATABASE_URL.includes(".neon.tech") ||
  DATABASE_URL.includes("sslmode=require") ||
  DATABASE_URL.includes(".vercel-storage.com") ||
  DATABASE_URL.includes(".rlwy.net");

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err);
});

/**
 * Async wrapper for PostgreSQL queries.
 * All callers use: await db.query(sql, params)
 */
export const db = {
  query: async (sql: string, params?: any[]) => {
    const result = await pool.query(sql, params);
    return result;
  },
  pool,
};

// Initialize tables on first import
const initPromise = (async () => {
  try {
    console.log("[DB] Creating tables if they don't exist...");
    await pool.query(`
    CREATE TABLE IF NOT EXISTS disaster_events (
      id SERIAL PRIMARY KEY,
      external_id TEXT NOT NULL,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      severity_score INTEGER NOT NULL DEFAULT 0,
      raw_payload TEXT DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      wallet_address TEXT DEFAULT '',
      contact_info TEXT DEFAULT '',
      payout_method TEXT NOT NULL DEFAULT 'bank',
      payout_details TEXT DEFAULT '{}',
      allowlisted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      tx_hash TEXT NOT NULL UNIQUE,
      donor_address TEXT NOT NULL,
      event_id INTEGER NOT NULL,
      org_id INTEGER NOT NULL,
      amount_wei TEXT NOT NULL,
      usd_value DOUBLE PRECISION DEFAULT 0,
      block_number INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS allocations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL,
      org_id INTEGER NOT NULL,
      split_bps INTEGER NOT NULL,
      tx_hash TEXT DEFAULT '',
      approved_by TEXT NOT NULL DEFAULT '',
      approved_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id SERIAL PRIMARY KEY,
      org_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      amount_wei TEXT NOT NULL,
      fiat_amount DOUBLE PRECISION DEFAULT 0,
      fiat_currency TEXT DEFAULT 'USD',
      offramp_ref TEXT DEFAULT '',
      offramp_ref_hash TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      tx_hash TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS indexer_state (
      id INTEGER PRIMARY KEY,
      last_block_number INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);
    console.log("[DB] Tables initialized successfully");
  } catch (err: any) {
    console.warn("[DB] Could not initialize tables (expected during build):", err.message);
  }
})();

/** Ensure DB tables are ready before querying */
export async function ensureDb() {
  await initPromise;
}

export default db;
