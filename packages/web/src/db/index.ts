import { DatabaseSync } from "node:sqlite";
import path from "path";

// Always store DB in the web package directory regardless of cwd
const DB_PATH = process.env.FLAREAID_DB_PATH || path.resolve(process.cwd(), "flareaid.db");
console.log("[DB] Initializing SQLite at:", DB_PATH);

const sqlite = new DatabaseSync(DB_PATH);
console.log("[DB] SQLite connection opened successfully");

// Enable WAL mode for better concurrent read performance
sqlite.exec("PRAGMA journal_mode = WAL");

// Wrapper to match better-sqlite3 API style used throughout the codebase
export const db = {
  prepare: (sql: string) => {
    const stmt = sqlite.prepare(sql);
    return {
      run: (...params: any[]) => stmt.run(...params),
      get: (...params: any[]) => stmt.get(...params),
      all: (...params: any[]) => stmt.all(...params),
    };
  },
  exec: (sql: string) => sqlite.exec(sql),
};

// Initialize tables on first import
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS disaster_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT NOT NULL,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    severity_score INTEGER NOT NULL DEFAULT 0,
    raw_payload TEXT DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT,
    approved_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT NOT NULL UNIQUE,
    donor_address TEXT NOT NULL,
    event_id INTEGER NOT NULL,
    org_id INTEGER NOT NULL,
    amount_wei TEXT NOT NULL,
    usd_value REAL DEFAULT 0,
    block_number INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    org_id INTEGER NOT NULL,
    split_bps INTEGER NOT NULL,
    tx_hash TEXT DEFAULT '',
    approved_by TEXT NOT NULL DEFAULT '',
    approved_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    amount_wei TEXT NOT NULL,
    fiat_amount REAL DEFAULT 0,
    fiat_currency TEXT DEFAULT 'USD',
    offramp_ref TEXT DEFAULT '',
    offramp_ref_hash TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

export default db;
