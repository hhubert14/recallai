// import * as dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

// Explicitly load .env.local
// dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error("Environment variable DATABASE_URL is required but not set.");
}

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
