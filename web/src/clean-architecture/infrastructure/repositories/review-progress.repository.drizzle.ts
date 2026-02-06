import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { reviewProgress } from "@/drizzle/schema";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { eq, and, lte, isNotNull, count, inArray } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

function toReviewProgressEntity(
  record: typeof reviewProgress.$inferSelect
): ReviewProgressEntity {
  return new ReviewProgressEntity(
    record.id,
    record.userId,
    record.reviewableItemId,
    record.boxLevel,
    record.nextReviewDate,
    record.timesCorrect,
    record.timesIncorrect,
    record.lastReviewedAt,
    record.createdAt
  );
}

export class DrizzleReviewProgressRepository
  implements IReviewProgressRepository
{
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createReviewProgressBatch(
    items: Array<{
      userId: string;
      reviewableItemId: number;
      boxLevel: number;
      nextReviewDate: string | null;
      timesCorrect: number;
      timesIncorrect: number;
      lastReviewedAt: string | null;
    }>
  ): Promise<ReviewProgressEntity[]> {
    if (items.length === 0) {
      return [];
    }

    const results = await dbRetry(() =>
      this.db.insert(reviewProgress).values(items).returning()
    );

    return results.map(toReviewProgressEntity);
  }

  async findReviewProgressByUserIdAndReviewableItemId(
    userId: string,
    reviewableItemId: number
  ): Promise<ReviewProgressEntity | null> {
    const [result] = await dbRetry(() =>
      this.db
        .select()
        .from(reviewProgress)
        .where(
          and(
            eq(reviewProgress.userId, userId),
            eq(reviewProgress.reviewableItemId, reviewableItemId)
          )
        )
        .limit(1)
    );

    return result ? toReviewProgressEntity(result) : null;
  }

  async findReviewProgressDueForReview(
    userId: string
  ): Promise<ReviewProgressEntity[]> {
    const today = new Date().toISOString().split("T")[0];

    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewProgress)
        .where(
          and(
            eq(reviewProgress.userId, userId),
            lte(reviewProgress.nextReviewDate, today),
            isNotNull(reviewProgress.nextReviewDate)
          )
        )
    );

    return results.map(toReviewProgressEntity);
  }

  async findReviewableItemIdsWithoutProgress(
    userId: string,
    reviewableItemIds: number[]
  ): Promise<number[]> {
    if (reviewableItemIds.length === 0) {
      return [];
    }

    // Find all reviewable item IDs that have progress records
    const progressRecords = await dbRetry(() =>
      this.db
        .select({ reviewableItemId: reviewProgress.reviewableItemId })
        .from(reviewProgress)
        .where(
          and(
            eq(reviewProgress.userId, userId),
            inArray(reviewProgress.reviewableItemId, reviewableItemIds)
          )
        )
    );

    const idsWithProgress = new Set(
      progressRecords.map((r) => r.reviewableItemId)
    );

    // Return IDs that don't have progress
    return reviewableItemIds.filter((id) => !idsWithProgress.has(id));
  }

  async updateReviewProgress(
    userId: string,
    reviewableItemId: number,
    boxLevel: number,
    nextReviewDate: string,
    timesCorrect: number,
    timesIncorrect: number,
    lastReviewedAt: string
  ): Promise<ReviewProgressEntity> {
    const [result] = await dbRetry(() =>
      this.db
        .update(reviewProgress)
        .set({
          boxLevel,
          nextReviewDate,
          timesCorrect,
          timesIncorrect,
          lastReviewedAt,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(reviewProgress.userId, userId),
            eq(reviewProgress.reviewableItemId, reviewableItemId)
          )
        )
        .returning()
    );

    return toReviewProgressEntity(result);
  }

  async getReviewStats(userId: string): Promise<{
    dueCount: number;
    totalCount: number;
    boxDistribution: number[];
  }> {
    const today = new Date().toISOString().split("T")[0];

    // Get due count
    const dueResult = await dbRetry(() =>
      this.db
        .select({ count: count() })
        .from(reviewProgress)
        .where(
          and(
            eq(reviewProgress.userId, userId),
            lte(reviewProgress.nextReviewDate, today),
            isNotNull(reviewProgress.nextReviewDate)
          )
        )
    );

    // Get total count
    const totalResult = await dbRetry(() =>
      this.db
        .select({ count: count() })
        .from(reviewProgress)
        .where(eq(reviewProgress.userId, userId))
    );

    // Get box distribution
    const boxData = await dbRetry(() =>
      this.db
        .select({ boxLevel: reviewProgress.boxLevel })
        .from(reviewProgress)
        .where(eq(reviewProgress.userId, userId))
    );

    const boxDistribution = [0, 0, 0, 0, 0]; // boxes 1-5
    boxData.forEach((row) => {
      const boxLevel = row.boxLevel;
      if (boxLevel >= 1 && boxLevel <= 5) {
        boxDistribution[boxLevel - 1]++;
      }
    });

    return {
      dueCount: dueResult[0]?.count || 0,
      totalCount: totalResult[0]?.count || 0,
      boxDistribution,
    };
  }

  async findReviewProgressByUserId(
    userId: string
  ): Promise<ReviewProgressEntity[]> {
    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewProgress)
        .where(eq(reviewProgress.userId, userId))
    );

    return results.map(toReviewProgressEntity);
  }

  async findReviewProgressByReviewableItemIds(
    userId: string,
    reviewableItemIds: number[]
  ): Promise<ReviewProgressEntity[]> {
    if (reviewableItemIds.length === 0) {
      return [];
    }

    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewProgress)
        .where(
          and(
            eq(reviewProgress.userId, userId),
            inArray(reviewProgress.reviewableItemId, reviewableItemIds)
          )
        )
    );

    return results.map(toReviewProgressEntity);
  }
}
