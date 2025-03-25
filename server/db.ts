
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize the connection
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Please set it in your environment variables.');
}

// Create a postgres connection with postgres.js
const client = postgres(connectionString, { 
  max: 10,
  onError: (err) => {
    console.error('Database connection error:', err);
  },
  onConnect: () => {
    console.log('Database connected successfully');
  }
});

// Initialize Drizzle with the postgres.js client
export const db = drizzle(client);
