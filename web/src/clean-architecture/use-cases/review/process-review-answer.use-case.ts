import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { calculateProgressUpdate, getNextReviewDate } from "./spaced-repetition";

export class ProcessReviewAnswerUseCase {
  constructor(private reviewProgressRepository: IReviewProgressRepository) {}

  async execute(
    userId: string,
    reviewableItemId: number,
    isCorrect: boolean
  ): Promise<ReviewProgressEntity> {
    const existingProgress =
      await this.reviewProgressRepository.findReviewProgressByUserIdAndReviewableItemId(
        userId,
        reviewableItemId
      );

    if (existingProgress) {
      const progressUpdate = calculateProgressUpdate(
        existingProgress.boxLevel,
        isCorrect,
        existingProgress.timesCorrect,
        existingProgress.timesIncorrect
      );

      return this.reviewProgressRepository.updateReviewProgress(
        userId,
        reviewableItemId,
        progressUpdate.boxLevel,
        progressUpdate.nextReviewDate,
        progressUpdate.timesCorrect,
        progressUpdate.timesIncorrect,
        progressUpdate.lastReviewedAt
      );
    } else {
      // Create new progress record
      const newBoxLevel = 1;
      const nextReviewDate = getNextReviewDate(newBoxLevel);
      const now = new Date().toISOString();

      const [createdProgress] =
        await this.reviewProgressRepository.createReviewProgressBatch([
          {
            userId,
            reviewableItemId,
            boxLevel: newBoxLevel,
            nextReviewDate,
            timesCorrect: isCorrect ? 1 : 0,
            timesIncorrect: isCorrect ? 0 : 1,
            lastReviewedAt: now,
          },
        ]);

      return createdProgress;
    }
  }
}
