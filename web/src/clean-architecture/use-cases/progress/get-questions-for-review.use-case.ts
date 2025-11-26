import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";

export type QuestionWithProgress = {
  progress: ProgressEntity;
  question: {
    id: number;
    videoId: number;
    questionText: string;
    options: {
      id: number;
      optionText: string;
      isCorrect: boolean;
      orderIndex: number | null;
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
          progress,
          question: {
            id: questionEntity.id,
            videoId: questionEntity.videoId,
            questionText: questionEntity.questionText,
            options: questionEntity.options.map((opt) => ({
              id: opt.id,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              orderIndex: opt.orderIndex,
              explanation: opt.explanation,
            })),
          },
        });
      }
    }

    return results;
  }
}
