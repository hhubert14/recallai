import { ReviewProgressEntity } from "../entities/review-progress.entity";

export interface IReviewProgressRepository {
  /**
   * Create progress records for a batch of reviewable items.
   * Called when creating initial progress for new items.
   */
  createReviewProgressBatch(
    items: Array<{
      userId: string;
      reviewableItemId: number;
      boxLevel: number;
      nextReviewDate: string | null;
      timesCorrect: number;
      timesIncorrect: number;
      lastReviewedAt: string | null;
    }>
  ): Promise<ReviewProgressEntity[]>;

  /**
   * Find progress record by user ID and reviewable item ID.
   */
  findReviewProgressByUserIdAndReviewableItemId(
    userId: string,
    reviewableItemId: number
  ): Promise<ReviewProgressEntity | null>;

  /**
   * Find all progress records that are due for review.
   * Due means next_review_date <= today.
   */
  findReviewProgressDueForReview(userId: string): Promise<ReviewProgressEntity[]>;

  /**
   * Find all reviewable item IDs that have never been reviewed (no progress record).
   * Used for "new" study mode.
   */
  findReviewableItemIdsWithoutProgress(
    userId: string,
    reviewableItemIds: number[]
  ): Promise<number[]>;

  /**
   * Update an existing progress record after a review.
   */
  updateReviewProgress(
    userId: string,
    reviewableItemId: number,
    boxLevel: number,
    nextReviewDate: string,
    timesCorrect: number,
    timesIncorrect: number,
    lastReviewedAt: string
  ): Promise<ReviewProgressEntity>;

  /**
   * Get aggregated stats for the review system.
   */
  getReviewStats(userId: string): Promise<{
    dueCount: number;
    totalCount: number;
    boxDistribution: number[];
  }>;

  /**
   * Find all progress records for a user.
   */
  findReviewProgressByUserId(userId: string): Promise<ReviewProgressEntity[]>;

  /**
   * Find progress records by reviewable item IDs.
   */
  findReviewProgressByReviewableItemIds(
    userId: string,
    reviewableItemIds: number[]
  ): Promise<ReviewProgressEntity[]>;
}
