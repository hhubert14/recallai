import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { getNextReviewDate } from "./spaced-repetition";

export type InitializeProgressResult = {
  progress: ReviewProgressEntity;
  created: boolean;
};

/**
 * Initializes review progress for a reviewable item on the video page.
 *
 * This use case is specifically for the video quiz page where users
 * first encounter questions. It differs from ProcessReviewAnswerUseCase
 * in that it only creates progress if none exists - it never updates
 * existing progress.
 *
 * Behavior:
 * - If no progress exists: creates new progress
 *   - Correct answer → box 2 (3-day review interval)
 *   - Incorrect answer → box 1 (1-day review interval)
 * - If progress exists: returns existing progress unchanged (no-op)
 */
export class InitializeReviewProgressUseCase {
  constructor(private reviewProgressRepository: IReviewProgressRepository) {}

  async execute(
    userId: string,
    reviewableItemId: number,
    isCorrect: boolean
  ): Promise<InitializeProgressResult> {
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
}
