/**
 * Database error types and classification utilities.
 *
 * Classifies database errors as either transient (retryable) or permanent (non-retryable)
 * to enable appropriate retry logic and error handling.
 */

// Retryable error codes - connection and availability issues
const RETRYABLE_ERROR_CODES = new Set([
  // Node.js / postgres-js connection errors
  "CONNECT_TIMEOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",

  // PostgreSQL connection exception class (08xxx)
  "08000", // connection_exception
  "08003", // connection_does_not_exist
  "08006", // connection_failure

  // PostgreSQL operator intervention class (57xxx) - server shutdown/restart
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
]);

/**
 * Base class for all database errors.
 */
export class DatabaseError extends Error {
  readonly code?: string;
  readonly isRetryable: boolean;

  constructor(message: string, code?: string, isRetryable = false) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

/**
 * Transient database error that may succeed on retry.
 * Examples: connection timeouts, server restarts, network issues.
 */
export class TransientDatabaseError extends DatabaseError {
  constructor(message: string, code: string, cause?: unknown) {
    super(message, code, true);
    this.name = "TransientDatabaseError";
    this.cause = cause;
  }
}

/**
 * Permanent database error that will not succeed on retry.
 * Examples: constraint violations, syntax errors, missing tables.
 */
export class PermanentDatabaseError extends DatabaseError {
  constructor(message: string, code?: string, cause?: unknown) {
    super(message, code, false);
    this.name = "PermanentDatabaseError";
    this.cause = cause;
  }
}

/**
 * Extracts the error code from an error, traversing the cause chain if needed.
 * postgres-js wraps errors in nested cause chains, so we need to dig through them.
 */
function extractErrorCode(error: unknown, maxDepth = 5): string | undefined {
  let current: unknown = error;
  let depth = 0;

  while (current && depth < maxDepth) {
    if (
      typeof current === "object" &&
      current !== null &&
      "code" in current &&
      typeof (current as { code: unknown }).code === "string"
    ) {
      return (current as { code: string }).code;
    }

    // Traverse to cause
    if (typeof current === "object" && current !== null && "cause" in current) {
      current = (current as { cause: unknown }).cause;
      depth++;
    } else {
      break;
    }
  }

  return undefined;
}

/**
 * Classifies a raw error into the appropriate DatabaseError subtype.
 * Traverses the cause chain to find error codes from nested errors.
 */
export function classifyError(error: unknown): DatabaseError {
  const code = extractErrorCode(error);

  // Extract message from the top-level error
  let message = "Unknown database error";
  if (error instanceof Error) {
    message = error.message;
  } else if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    message = (error as { message: string }).message;
  }

  if (code && RETRYABLE_ERROR_CODES.has(code)) {
    return new TransientDatabaseError(message, code, error);
  }

  return new PermanentDatabaseError(message, code, error);
}
