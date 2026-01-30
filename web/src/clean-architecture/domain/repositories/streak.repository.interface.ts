import { StreakEntity } from "../entities/streak.entity";

export interface IStreakRepository {
  /**
   * Find streak record by user ID.
   */
  findStreakByUserId(userId: string): Promise<StreakEntity | null>;

  /**
   * Create or update a streak record for a user.
   * Uses upsert to handle race conditions.
   */
  upsertStreak(
    userId: string,
    currentStreak: number,
    longestStreak: number,
    lastActivityDate: string
  ): Promise<StreakEntity>;
}
