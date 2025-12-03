/**
 * Error Handling Utilities
 * 
 * Standardized error handling patterns for the application.
 */

import { logger } from "@/lib/logger";

/**
 * Standard error response shape
 */
export interface ErrorResponse {
    message: string;
    code?: string;
    details?: unknown;
}

/**
 * Wraps async repository/service calls with error logging
 * 
 * @example
 * ```ts
 * const user = await withErrorLogging(
 *   () => userRepository.findById(userId),
 *   "user",
 *   "findById"
 * );
 * ```
 */
export async function withErrorLogging<T>(
    fn: () => Promise<T>,
    context: string,
    operation: string
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        logger.db.error(`Error in ${context}.${operation}`, error);
        throw error;
    }
}

/**
 * Extracts a safe error message from unknown error types
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "An unknown error occurred";
}

/**
 * Checks if an error is a database constraint violation
 */
export function isUniqueConstraintError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes("unique constraint") ||
            error.message.includes("duplicate key")
        );
    }
    return false;
}

/**
 * Checks if an error is a foreign key constraint violation
 */
export function isForeignKeyError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes("foreign key constraint") ||
            error.message.includes("violates foreign key")
        );
    }
    return false;
}

/**
 * Creates a user-friendly error message for database errors
 */
export function getDatabaseErrorMessage(error: unknown): string {
    if (isUniqueConstraintError(error)) {
        return "This record already exists";
    }
    if (isForeignKeyError(error)) {
        return "Cannot perform this operation due to existing relationships";
    }
    return "A database error occurred";
}
