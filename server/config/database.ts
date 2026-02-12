import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 15, // Connection pool size
});

// Create the database instance
export const db = drizzle(client, { schema });

export default db;
