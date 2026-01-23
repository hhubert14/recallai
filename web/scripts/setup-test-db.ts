import postgres from "postgres";

/**
 * Sets up the test database (testdb) for integration tests.
 *
 * This script is idempotent - safe to run multiple times.
 * It creates:
 * - testdb database (if not exists)
 * - auth schema with mock auth.users table (for FK constraints)
 * - pgvector extension
 *
 * Usage: npm run setup-test-db
 */

async function setup() {
    if (!process.env.DATABASE_URL) {
        console.error("ERROR: DATABASE_URL environment variable is required");
        process.exit(1);
    }

    // Extract base URL without database name
    const baseUrl = process.env.DATABASE_URL.replace(/\/[^/]+$/, "/postgres");

    console.log("Setting up test database...\n");

    // Step 1: Connect to default postgres database to create testdb
    console.log("1. Connecting to postgres database...");
    const adminClient = postgres(baseUrl, {
        prepare: false,
        max: 1,
    });

    try {
        // Check if testdb exists
        const existing =
            await adminClient`SELECT 1 FROM pg_database WHERE datname = 'testdb'`;

        if (existing.length === 0) {
            console.log("   Creating testdb database...");
            await adminClient.unsafe("CREATE DATABASE testdb");
            console.log("   ✓ testdb created");
        } else {
            console.log("   ✓ testdb already exists");
        }

        await adminClient.end();
    } catch (error) {
        console.error("   ✗ Failed to create testdb:", error);
        await adminClient.end();
        process.exit(1);
    }

    // Step 2: Connect to testdb and set up schema
    console.log("\n2. Connecting to testdb...");
    const testDbUrl = process.env.DATABASE_URL.replace(/\/[^/]+$/, "/testdb");
    const testClient = postgres(testDbUrl, {
        prepare: false,
        max: 1,
    });

    try {
        // Create auth schema
        console.log("   Creating auth schema...");
        await testClient`CREATE SCHEMA IF NOT EXISTS auth`;
        console.log("   ✓ auth schema ready");

        // Create mock auth.users table
        console.log("   Creating mock auth.users table...");
        await testClient`
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        email TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
        console.log("   ✓ auth.users table ready");

        // Enable pgvector extension
        console.log("   Enabling pgvector extension...");
        await testClient`CREATE EXTENSION IF NOT EXISTS vector`;
        console.log("   ✓ pgvector extension ready");

        await testClient.end();
    } catch (error) {
        console.error("   ✗ Failed to set up testdb:", error);
        await testClient.end();
        process.exit(1);
    }

    console.log("\n✓ Test database setup complete!");
    console.log("  You can now run: npm run db:push:test");
}

setup();
