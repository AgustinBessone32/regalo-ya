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
  max: 5, // Reduce max connections for better stability
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Add basic error handling to the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
export { pool };

// For clean shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

// Export a function to test the connection with retries
export async function testConnection(retries = 3, delay = 2000) {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    let client;
    try {
      client = await pool.connect();
      await client.query('SELECT 1');
      console.log("Database connection established successfully");
      return true;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Database connection attempt ${i + 1} failed:`, lastError.message);

      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  throw new Error(`Failed to connect to database after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}
