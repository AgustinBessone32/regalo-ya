import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Add basic error handling to the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
export { pool };

// For clean shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

// Export a function to test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log("Database connection established successfully");
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}