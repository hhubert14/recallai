import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Environment variable DATABASE_URL is required but was not provided."
  );
}

// Singleton pattern to prevent connection pool exhaustion in development
// Next.js hot reloading can create multiple connection pools
declare global {
  var dbClient: postgres.Sql | undefined;
}

const client =
  globalThis.dbClient ??
  postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.dbClient = client;
}

export const db = drizzle(client);
