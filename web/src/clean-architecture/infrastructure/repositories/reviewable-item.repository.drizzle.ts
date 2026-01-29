import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { reviewableItems } from "@/drizzle/schema";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import {
  ReviewableItemEntity,
  ReviewableItemType,
} from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { eq, and, inArray, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

function toReviewableItemEntity(
  record: typeof reviewableItems.$inferSelect
): ReviewableItemEntity {
  return new ReviewableItemEntity(
    record.id,
    record.userId,
    record.itemType as ReviewableItemType,
    record.questionId,
    record.flashcardId,
    record.videoId,
    record.studySetId,
    record.createdAt
  );
}

export class DrizzleReviewableItemRepository
  implements IReviewableItemRepository
{
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createReviewableItemsForQuestionsBatch(
    items: Array<{
      userId: string;
      questionId: number;
      videoId: number | null;
      studySetId: number;
    }>
  ): Promise<ReviewableItemEntity[]> {
    if (items.length === 0) {
      return [];
    }

    const results = await dbRetry(() =>
      this.db
        .insert(reviewableItems)
        .values(
          items.map((item) => ({
            userId: item.userId,
            itemType: "question" as const,
            questionId: item.questionId,
            flashcardId: null,
            videoId: item.videoId,
            studySetId: item.studySetId,
          }))
        )
        .returning()
    );

    return results.map(toReviewableItemEntity);
  }

  async createReviewableItemsForFlashcardsBatch(
    items: Array<{
      userId: string;
      flashcardId: number;
      videoId: number | null;
      studySetId: number;
    }>
  ): Promise<ReviewableItemEntity[]> {
    if (items.length === 0) {
      return [];
    }

    const results = await dbRetry(() =>
      this.db
        .insert(reviewableItems)
        .values(
          items.map((item) => ({
            userId: item.userId,
            itemType: "flashcard" as const,
            questionId: null,
            flashcardId: item.flashcardId,
            videoId: item.videoId,
            studySetId: item.studySetId,
          }))
        )
        .returning()
    );

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByUserId(
    userId: string
  ): Promise<ReviewableItemEntity[]> {
    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(eq(reviewableItems.userId, userId))
    );

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByUserIdAndVideoId(
    userId: string,
    videoId: number
  ): Promise<ReviewableItemEntity[]> {
    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(
          and(
            eq(reviewableItems.userId, userId),
            eq(reviewableItems.videoId, videoId)
          )
        )
    );

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByStudySetId(
    studySetId: number
  ): Promise<ReviewableItemEntity[]> {
    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(eq(reviewableItems.studySetId, studySetId))
    );

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByUserIdAndStudySetId(
    userId: string,
    studySetId: number
  ): Promise<ReviewableItemEntity[]> {
    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(
          and(
            eq(reviewableItems.userId, userId),
            eq(reviewableItems.studySetId, studySetId)
          )
        )
    );

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemByQuestionId(
    questionId: number
  ): Promise<ReviewableItemEntity | null> {
    const [result] = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(eq(reviewableItems.questionId, questionId))
        .limit(1)
    );

    return result ? toReviewableItemEntity(result) : null;
  }

  async findReviewableItemByFlashcardId(
    flashcardId: number
  ): Promise<ReviewableItemEntity | null> {
    const [result] = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(eq(reviewableItems.flashcardId, flashcardId))
        .limit(1)
    );

    return result ? toReviewableItemEntity(result) : null;
  }

  async findReviewableItemById(
    id: number
  ): Promise<ReviewableItemEntity | null> {
    const [result] = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(eq(reviewableItems.id, id))
        .limit(1)
    );

    return result ? toReviewableItemEntity(result) : null;
  }

  async findReviewableItemsByIds(
    ids: number[]
  ): Promise<ReviewableItemEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const results = await dbRetry(() =>
      this.db
        .select()
        .from(reviewableItems)
        .where(inArray(reviewableItems.id, ids))
    );

    return results.map(toReviewableItemEntity);
  }

  async countItemsByStudySetId(studySetId: number): Promise<number> {
    const result = await dbRetry(() =>
      this.db
        .select({ count: count() })
        .from(reviewableItems)
        .where(eq(reviewableItems.studySetId, studySetId))
    );
    return result[0]?.count ?? 0;
  }

  async countItemsByStudySetIdsBatch(
    studySetIds: number[]
  ): Promise<Record<number, { questions: number; flashcards: number }>> {
    if (studySetIds.length === 0) {
      return {};
    }

    // Initialize all requested IDs with zero counts
    const result: Record<number, { questions: number; flashcards: number }> = {};
    for (const id of studySetIds) {
      result[id] = { questions: 0, flashcards: 0 };
    }

    // Query with GROUP BY on studySetId and itemType
    const rows = await dbRetry(() =>
      this.db
        .select({
          studySetId: reviewableItems.studySetId,
          itemType: reviewableItems.itemType,
          count: count(),
        })
        .from(reviewableItems)
        .where(inArray(reviewableItems.studySetId, studySetIds))
        .groupBy(reviewableItems.studySetId, reviewableItems.itemType)
    );

    // Populate from query results
    for (const row of rows) {
      if (row.studySetId !== null && result[row.studySetId]) {
        if (row.itemType === "question") {
          result[row.studySetId].questions = row.count;
        } else if (row.itemType === "flashcard") {
          result[row.studySetId].flashcards = row.count;
        }
      }
    }

    return result;
  }
}
