import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";
import { calculateProgressUpdate, getNextReviewDate } from "./spaced-repetition.utils";

export class ProcessSpacedRepetitionAnswerUseCase {
  constructor(private progressRepository: IProgressRepository) {}

  async execute(
    userId: string,
    questionId: number,
    isCorrect: boolean
  ): Promise<ProgressEntity> {
    const existingProgress = await this.progressRepository.findProgressByUserIdAndQuestionId(
      userId,
      questionId
    );

    if (existingProgress) {
      const progressUpdate = calculateProgressUpdate(
        existingProgress.boxLevel,
        isCorrect,
        existingProgress.timesCorrect,
        existingProgress.timesIncorrect
      );

      return this.progressRepository.updateProgress(
        userId,
        questionId,
        progressUpdate.boxLevel,
        progressUpdate.nextReviewDate,
        progressUpdate.timesCorrect,
        progressUpdate.timesIncorrect,
        progressUpdate.lastReviewedAt
      );
    } else {
      const newBoxLevel = 1;
      const nextReviewDate = getNextReviewDate(newBoxLevel);

      return this.progressRepository.createProgress(
        userId,
        questionId,
        newBoxLevel,
        nextReviewDate,
        isCorrect ? 1 : 0,
        isCorrect ? 0 : 1,
        new Date().toISOString()
      );
    }
  }
}
