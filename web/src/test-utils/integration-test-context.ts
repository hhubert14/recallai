import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";

export interface IntegrationTestContext {
  /** Drizzle instance using the transactional connection */
  db: PostgresJsDatabase;
  /** Raw SQL client for auth.users operations */
  sql: postgres.Sql;
  /** Cleanup function - call in afterEach */
  cleanup: () => Promise<void>;
}

/**
 * Creates an isolated test context with a transaction that will be rolled back.
 *
 * Usage:
 * ```ts
 * let ctx: IntegrationTestContext;
 *
 * beforeEach(async () => {
 *   ctx = await createTestContext();
 *   // Use ctx.db for Drizzle operations
 *   // Use ctx.sql for raw SQL (auth.users)
 * });
 *
 * afterEach(async () => {
 *   await ctx.cleanup();
 * });
 * ```
 */
export async function createTestContext(): Promise<IntegrationTestContext> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.includes("testdb")) {
    throw new Error(
      "Integration tests require DATABASE_URL pointing to testdb"
    );
  }

  // Create a dedicated connection for this test
  const sql = postgres(databaseUrl, {
    prepare: false,
    max: 1, // Single connection to ensure transaction scope
  });

  // Start transaction
  await sql`BEGIN`;

  // Create Drizzle instance using this connection
  const db = drizzle(sql);

  return {
    db,
    sql,
    cleanup: async () => {
      await sql`ROLLBACK`;
      await sql.end();
    },
  };
}
