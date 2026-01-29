/**
 * Database utilities for error handling and retry logic.
 *
 * @example
 * ```typescript
 * import { withRetry, TransientDatabaseError, PermanentDatabaseError } from "@/lib/db";
 *
 * // Wrap database operations with retry logic
 * const result = await withRetry(
 *   async () => db.select().from(users).where(eq(users.id, userId)),
 *   "UserRepository.findById"
 * );
 * ```
 */

export {
  DatabaseError,
  TransientDatabaseError,
  PermanentDatabaseError,
  classifyError,
} from "./errors";

export { withRetry, dbRetry, calculateDelay, type RetryOptions } from "./retry";
