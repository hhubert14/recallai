import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { userStreaks } from "@/drizzle/schema";
import { IStreakRepository } from "@/clean-architecture/domain/repositories/streak.repository.interface";
import { StreakEntity } from "@/clean-architecture/domain/entities/streak.entity";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

function toStreakEntity(
  record: typeof userStreaks.$inferSelect
): StreakEntity {
  return new StreakEntity(
    record.id,
    record.userId,
    record.currentStreak,
    record.longestStreak,
    record.lastActivityDate,
    record.createdAt,
    record.updatedAt
  );
}

export class DrizzleStreakRepository implements IStreakRepository {
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async findStreakByUserId(userId: string): Promise<StreakEntity | null> {
    const [result] = await dbRetry(() =>
      this.db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1)
    );

    return result ? toStreakEntity(result) : null;
  }

  async upsertStreak(
    userId: string,
    currentStreak: number,
    longestStreak: number,
    lastActivityDate: string
  ): Promise<StreakEntity> {
    const now = new Date().toISOString();

    const [result] = await dbRetry(() =>
      this.db
        .insert(userStreaks)
        .values({
          userId,
          currentStreak,
          longestStreak,
          lastActivityDate,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: userStreaks.userId,
          set: {
            currentStreak,
            longestStreak,
            lastActivityDate,
            updatedAt: now,
          },
        })
        .returning()
    );

    return toStreakEntity(result);
  }
}
