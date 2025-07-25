import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Create SQL connection
const client = postgres(process.env.DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Export types
export type * from "@db/schema";
