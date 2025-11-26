import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";
import { getNextReviewDate } from "./spaced-repetition.utils";

export class CreateProgressForVideoUseCase {
  constructor(
    private progressRepository: IProgressRepository,
    private answerRepository: IAnswerRepository
  ) {}

  async execute(userId: string, videoId: number): Promise<ProgressEntity[]> {
    const answeredQuestionIds = await this.answerRepository.findAnsweredQuestionIdsByVideoId(
      userId,
      videoId
    );

    if (answeredQuestionIds.length === 0) {
      return [];
    }

    const questionsToAdd: number[] = [];
    for (const questionId of answeredQuestionIds) {
      const existingProgress = await this.progressRepository.findProgressByUserIdAndQuestionId(
        userId,
        questionId
      );
      if (!existingProgress) {
        questionsToAdd.push(questionId);
      }
    }

    if (questionsToAdd.length === 0) {
      return [];
    }

    const now = new Date().toISOString();
    const progressItems = questionsToAdd.map((questionId) => ({
      userId,
      questionId,
      boxLevel: 1,
      nextReviewDate: getNextReviewDate(1),
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewedAt: now,
    }));

    return this.progressRepository.createProgressBatch(progressItems);
  }
}
