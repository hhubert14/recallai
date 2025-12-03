import { logger } from "@/lib/logger";

/**
 * Wraps a repository method with standardized error handling and logging.
 * This reduces code duplication across all repository methods.
 *
 * @param operation - A function that performs the repository operation
 * @param operationName - Human-readable name for logging (e.g., "creating user", "finding video")
 * @returns The result of the operation or throws the error after logging
 *
 * @example
 * ```typescript
 * async createUser(id: string, email: string): Promise<UserEntity> {
 *   return withRepositoryErrorHandling(
 *     async () => {
 *       const [data] = await db.insert(users).values({ id, email }).returning();
 *       return this.toEntity(data);
 *     },
 *     "creating user"
 *   );
 * }
 * ```
 */
export async function withRepositoryErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.db.error(`Error ${operationName}`, error);
    throw error;
  }
}
