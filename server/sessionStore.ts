// Session store for authentication
import pg from "pg";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPg(session);

// Create a PostgreSQL pool for session storage
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Create the session store
export const pgSessionStore = new PostgresStore({
  pool: pool,
  createTableIfMissing: true,
  tableName: 'session' // Default table name
});

// Create memory store for development if needed
export const memorySessionStore = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});