import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";

export type StudyModeStats = {
  dueCount: number;
  newCount: number;
  totalCount: number;
};

export class GetStudyModeStatsUseCase {
  constructor(
    private progressRepository: IProgressRepository,
    private questionRepository: IQuestionRepository
  ) {}

  async execute(userId: string): Promise<StudyModeStats> {
    const [dueProgress, allProgress, allQuestions] = await Promise.all([
      this.progressRepository.findProgressDueForReview(userId),
      this.progressRepository.findProgressByUserId(userId),
      this.questionRepository.findQuestionsByUserId(userId),
    ]);

    const questionIdsWithProgress = new Set(
      allProgress.map((p) => p.questionId)
    );

    const dueCount = dueProgress.length;
    const newCount = allQuestions.filter(
      (q) => !questionIdsWithProgress.has(q.id)
    ).length;
    const totalCount = allQuestions.length;

    return {
      dueCount,
      newCount,
      totalCount,
    };
  }
}
