import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined, using fallback configuration');
  // Use a fallback config for development only
  connectionString = 'postgres://default:default@localhost:5432/default';
}

// Add connection error handling
const client = postgres(connectionString, { 
  max: 10,
  onError: (err) => {
    console.error('Database connection error:', err);
  },
  onConnect: () => {
    console.log('Database connected successfully');
  }
});

// Create a postgres connection with postgres.js
const client = postgres(connectionString, { max: 10 });

// Initialize Drizzle with the postgres.js client
export const db = drizzle(client);
