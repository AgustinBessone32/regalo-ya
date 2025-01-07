import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
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

const db = drizzle(pool, { schema });

// Test the connection
try {
  await pool.query('SELECT 1');
  console.log("Database connection established successfully");
} catch (error) {
  console.error("Failed to initialize database:", error);
  throw error;
}


// For clean shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

export { db };