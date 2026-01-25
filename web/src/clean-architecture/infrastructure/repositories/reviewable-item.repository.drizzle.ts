import { db as defaultDb } from "@/drizzle";
import { reviewableItems } from "@/drizzle/schema";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import {
  ReviewableItemEntity,
  ReviewableItemType,
} from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { eq, and, inArray } from "drizzle-orm";
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

    const results = await this.db
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
      .returning();

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

    const results = await this.db
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
      .returning();

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByUserId(
    userId: string
  ): Promise<ReviewableItemEntity[]> {
    const results = await this.db
      .select()
      .from(reviewableItems)
      .where(eq(reviewableItems.userId, userId));

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByUserIdAndVideoId(
    userId: string,
    videoId: number
  ): Promise<ReviewableItemEntity[]> {
    const results = await this.db
      .select()
      .from(reviewableItems)
      .where(
        and(
          eq(reviewableItems.userId, userId),
          eq(reviewableItems.videoId, videoId)
        )
      );

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemsByStudySetId(
    studySetId: number
  ): Promise<ReviewableItemEntity[]> {
    const results = await this.db
      .select()
      .from(reviewableItems)
      .where(eq(reviewableItems.studySetId, studySetId));

    return results.map(toReviewableItemEntity);
  }

  async findReviewableItemByQuestionId(
    questionId: number
  ): Promise<ReviewableItemEntity | null> {
    const [result] = await this.db
      .select()
      .from(reviewableItems)
      .where(eq(reviewableItems.questionId, questionId))
      .limit(1);

    return result ? toReviewableItemEntity(result) : null;
  }

  async findReviewableItemByFlashcardId(
    flashcardId: number
  ): Promise<ReviewableItemEntity | null> {
    const [result] = await this.db
      .select()
      .from(reviewableItems)
      .where(eq(reviewableItems.flashcardId, flashcardId))
      .limit(1);

    return result ? toReviewableItemEntity(result) : null;
  }

  async findReviewableItemById(
    id: number
  ): Promise<ReviewableItemEntity | null> {
    const [result] = await this.db
      .select()
      .from(reviewableItems)
      .where(eq(reviewableItems.id, id))
      .limit(1);

    return result ? toReviewableItemEntity(result) : null;
  }

  async findReviewableItemsByIds(
    ids: number[]
  ): Promise<ReviewableItemEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const results = await this.db
      .select()
      .from(reviewableItems)
      .where(inArray(reviewableItems.id, ids));

    return results.map(toReviewableItemEntity);
  }
}
