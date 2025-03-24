import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// Create a postgres connection with postgres.js
const client = postgres(connectionString, { max: 10 });

// Initialize Drizzle with the postgres.js client
export const db = drizzle(client);
