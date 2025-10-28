import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
    throw new Error("Environment variable DATABASE_URL is required but was not provided.");
}
const client = postgres(process.env.DATABASE_URL, {
    prepare: false
});
export const db = drizzle(client);