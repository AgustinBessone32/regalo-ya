import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the database connection implicitly through error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Export the pool for use in other files
export { pool };