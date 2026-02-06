/**
 * Retry logic for transient database errors.
 *
 * Provides exponential backoff with jitter for retrying database operations
 * that fail due to transient issues (connection timeouts, network errors, etc.)
 */

import { logger } from "@/lib/logger";
import { classifyError, TransientDatabaseError, DatabaseError } from "./errors";

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for first retry (default: 100) */
  baseDelayMs?: number;
  /** Maximum delay in milliseconds (default: 5000) */
  maxDelayMs?: number;
  /** Jitter factor (0-1) to add randomness to delay (default: 0.3) */
  jitterFactor?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  jitterFactor: 0.3,
};

/**
 * Calculate delay for a retry attempt using exponential backoff with optional jitter.
 *
 * @param attempt - The retry attempt number (1-based)
 * @param options - Delay configuration options
 * @returns Delay in milliseconds
 */
export function calculateDelay(
  attempt: number,
  options: Pick<
    RetryOptions,
    "baseDelayMs" | "maxDelayMs" | "jitterFactor"
  > = {}
): number {
  const {
    baseDelayMs = DEFAULT_OPTIONS.baseDelayMs,
    maxDelayMs = DEFAULT_OPTIONS.maxDelayMs,
    jitterFactor = DEFAULT_OPTIONS.jitterFactor,
  } = options;

  // Exponential backoff: baseDelay * 2^(attempt-1)
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  // Add jitter: random value between -jitterFactor and +jitterFactor
  if (jitterFactor > 0) {
    const jitter = (Math.random() * 2 - 1) * jitterFactor;
    return Math.round(cappedDelay * (1 + jitter));
  }

  return cappedDelay;
}

/**
 * Wraps a database operation with retry logic for transient errors.
 *
 * - Retries transient errors (connection issues) with exponential backoff
 * - Fails immediately for permanent errors (constraints, syntax)
 * - Logs retry attempts using the database logger
 *
 * @param operation - Async function that performs the database operation
 * @param operationName - Name for logging (e.g., "VideoRepository.findById")
 * @param options - Retry configuration options
 * @returns The result of the operation
 * @throws TransientDatabaseError if max retries exceeded
 * @throws PermanentDatabaseError for non-retryable errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_OPTIONS.maxRetries,
    baseDelayMs = DEFAULT_OPTIONS.baseDelayMs,
    maxDelayMs = DEFAULT_OPTIONS.maxDelayMs,
    jitterFactor = DEFAULT_OPTIONS.jitterFactor,
  } = options;

  let lastError: DatabaseError | undefined;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      const classifiedError = classifyError(error);
      lastError = classifiedError;

      // Don't retry permanent errors
      if (!classifiedError.isRetryable) {
        throw classifiedError;
      }

      // If we've exhausted retries, throw the transient error
      if (attempt > maxRetries) {
        logger.db.error(
          `${operationName} failed after ${maxRetries} retries`,
          classifiedError,
          { maxRetries, totalAttempts: attempt }
        );
        throw classifiedError;
      }

      // Calculate delay and wait before retrying
      const delay = calculateDelay(attempt, {
        baseDelayMs,
        maxDelayMs,
        jitterFactor,
      });

      logger.db.info(`Retrying ${operationName}`, {
        attempt: attempt + 1,
        maxAttempts: maxRetries + 1,
        delayMs: delay,
        errorCode: classifiedError.code,
      });

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError ?? new TransientDatabaseError("Unknown error", "UNKNOWN");
}

/**
 * Promise-based sleep utility.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shorthand for withRetry with auto-generated operation name.
 * Use in repositories for cleaner syntax.
 *
 * @example
 * const data = await dbRetry(() => db.select().from(users));
 */
export async function dbRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return withRetry(operation, "db.query", options);
}
