import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { getNextReviewDate } from "./spaced-repetition";

export type InitializeProgressParams = {
  userId: string;
  isCorrect: boolean;
  reviewableItemId?: number;
  questionId?: number;
  flashcardId?: number;
};

export type InitializeProgressResult = {
  progress: ReviewProgressEntity;
  created: boolean;
};

export class ReviewableItemNotFoundError extends Error {
  constructor() {
    super("Must provide a valid reviewableItemId, questionId, or flashcardId");
    this.name = "ReviewableItemNotFoundError";
  }
}

/**
 * Initializes review progress for a reviewable item on the video page.
 *
 * This use case is specifically for the video quiz page where users
 * first encounter questions. It differs from ProcessReviewAnswerUseCase
 * in that it only creates progress if none exists - it never updates
 * existing progress.
 *
 * Behavior:
 * - Resolves the reviewable item ID from questionId or flashcardId if needed
 * - If no progress exists: creates new progress
 *   - Correct answer → box 2 (3-day review interval)
 *   - Incorrect answer → box 1 (1-day review interval)
 * - If progress exists: returns existing progress unchanged (no-op)
 */
export class InitializeReviewProgressUseCase {
  constructor(
    private reviewProgressRepository: IReviewProgressRepository,
    private reviewableItemRepository: IReviewableItemRepository
  ) {}

  async execute(params: InitializeProgressParams): Promise<InitializeProgressResult> {
    const { userId, isCorrect } = params;

    const reviewableItemId = await this.resolveReviewableItemId(params);

    if (!reviewableItemId) {
      throw new ReviewableItemNotFoundError();
    }

    const existingProgress =
      await this.reviewProgressRepository.findReviewProgressByUserIdAndReviewableItemId(
        userId,
        reviewableItemId
      );

    if (existingProgress) {
      // Progress already exists - return it unchanged
      return {
        progress: existingProgress,
        created: false,
      };
    }

    // Create new progress record
    // Correct answers start at box 2 (3-day interval)
    // Incorrect answers start at box 1 (1-day interval)
    const initialBoxLevel = isCorrect ? 2 : 1;
    const nextReviewDate = getNextReviewDate(initialBoxLevel);
    const now = new Date().toISOString();

    const [createdProgress] =
      await this.reviewProgressRepository.createReviewProgressBatch([
        {
          userId,
          reviewableItemId,
          boxLevel: initialBoxLevel,
          nextReviewDate,
          timesCorrect: isCorrect ? 1 : 0,
          timesIncorrect: isCorrect ? 0 : 1,
          lastReviewedAt: now,
        },
      ]);

    if (!createdProgress) {
      throw new Error(
        `Failed to create review progress for reviewableItemId: ${reviewableItemId}`
      );
    }

    return {
      progress: createdProgress,
      created: true,
    };
  }

  private async resolveReviewableItemId(
    params: InitializeProgressParams
  ): Promise<number | null> {
    const { reviewableItemId, questionId, flashcardId } = params;

    // Direct ID takes priority
    if (reviewableItemId) {
      return reviewableItemId;
    }

    // Try question lookup
    if (questionId) {
      const item =
        await this.reviewableItemRepository.findReviewableItemByQuestionId(
          questionId
        );
      return item?.id ?? null;
    }

    // Try flashcard lookup
    if (flashcardId) {
      const item =
        await this.reviewableItemRepository.findReviewableItemByFlashcardId(
          flashcardId
        );
      return item?.id ?? null;
    }

    return null;
  }
}
