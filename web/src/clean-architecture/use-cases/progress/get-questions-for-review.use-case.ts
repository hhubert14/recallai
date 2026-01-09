import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";

export type QuestionWithProgress = {
  progress: {
    id: number;
    userId: string;
    questionId: number;
    boxLevel: number;
    nextReviewDate: string | null;
    timesCorrect: number;
    timesIncorrect: number;
    lastReviewedAt: string | null;
    createdAt: string;
  };
  question: {
    id: number;
    videoId: number;
    questionText: string;
    options: {
      id: number;
      optionText: string;
      isCorrect: boolean;
      explanation: string | null;
    }[];
  };
};

export class GetQuestionsForReviewUseCase {
  constructor(
    private progressRepository: IProgressRepository,
    private questionRepository: IQuestionRepository
  ) {}

  async execute(userId: string): Promise<QuestionWithProgress[]> {
    const progressRecords = await this.progressRepository.findProgressDueForReview(userId);

    if (progressRecords.length === 0) {
      return [];
    }

    const results: QuestionWithProgress[] = [];

    for (const progress of progressRecords) {
      const questionEntity = await this.questionRepository.findQuestionById(progress.questionId);
      if (questionEntity) {
        results.push({
          progress: {
            id: progress.id,
            userId: progress.userId,
            questionId: progress.questionId,
            boxLevel: progress.boxLevel,
            nextReviewDate: progress.nextReviewDate,
            timesCorrect: progress.timesCorrect,
            timesIncorrect: progress.timesIncorrect,
            lastReviewedAt: progress.lastReviewedAt,
            createdAt: progress.createdAt,
          },
          question: {
            id: questionEntity.id,
            videoId: questionEntity.videoId,
            questionText: questionEntity.questionText,
            options: questionEntity.options.map((opt) => ({
              id: opt.id,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              explanation: opt.explanation,
            })),
          },
        });
      }
    }

    return results;
  }
}
