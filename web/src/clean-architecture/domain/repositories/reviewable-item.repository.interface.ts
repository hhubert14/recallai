import { ReviewableItemEntity } from "../entities/reviewable-item.entity";

export interface IReviewableItemRepository {
  /**
   * Create reviewable items for a batch of questions.
   * Called when questions are generated for a video or study set.
   */
  createReviewableItemsForQuestionsBatch(
    items: Array<{
      userId: string;
      questionId: number;
      videoId: number | null;
      studySetId: number | null;
    }>
  ): Promise<ReviewableItemEntity[]>;

  /**
   * Create reviewable items for a batch of flashcards.
   * Called when flashcards are generated for a video or study set.
   */
  createReviewableItemsForFlashcardsBatch(
    items: Array<{
      userId: string;
      flashcardId: number;
      videoId: number | null;
      studySetId: number | null;
    }>
  ): Promise<ReviewableItemEntity[]>;

  /**
   * Find all reviewable items for a user.
   */
  findReviewableItemsByUserId(userId: string): Promise<ReviewableItemEntity[]>;

  /**
   * Find all reviewable items for a user filtered by video.
   */
  findReviewableItemsByUserIdAndVideoId(
    userId: string,
    videoId: number
  ): Promise<ReviewableItemEntity[]>;

  /**
   * Find all reviewable items for a study set.
   */
  findReviewableItemsByStudySetId(
    studySetId: number
  ): Promise<ReviewableItemEntity[]>;

  /**
   * Find the reviewable item for a specific question.
   * Returns null if the question hasn't been added to the review system.
   */
  findReviewableItemByQuestionId(
    questionId: number
  ): Promise<ReviewableItemEntity | null>;

  /**
   * Find the reviewable item for a specific flashcard.
   * Returns null if the flashcard hasn't been added to the review system.
   */
  findReviewableItemByFlashcardId(
    flashcardId: number
  ): Promise<ReviewableItemEntity | null>;

  /**
   * Find a reviewable item by its ID.
   */
  findReviewableItemById(id: number): Promise<ReviewableItemEntity | null>;

  /**
   * Find reviewable items by their IDs.
   */
  findReviewableItemsByIds(ids: number[]): Promise<ReviewableItemEntity[]>;
}
