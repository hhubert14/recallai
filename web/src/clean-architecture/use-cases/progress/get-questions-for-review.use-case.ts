import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { StudyModeParams } from "./types";

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
  } | null;
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

  async execute(
    userId: string,
    params: StudyModeParams = { mode: "due" },
    limit?: number
  ): Promise<QuestionWithProgress[]> {
    switch (params.mode) {
      case "due":
        return this.getDueQuestions(userId, limit);
      case "new":
        return this.getNewQuestions(userId, limit);
      case "random":
        return this.getRandomQuestions(userId, limit);
      default:
        return this.getDueQuestions(userId, limit);
    }
  }

  private async getDueQuestions(
    userId: string,
    limit?: number
  ): Promise<QuestionWithProgress[]> {
    let progressRecords =
      await this.progressRepository.findProgressDueForReview(userId);

    if (progressRecords.length === 0) {
      return [];
    }

    // Sort by box level (lowest first - struggling questions get priority)
    progressRecords.sort((a, b) => a.boxLevel - b.boxLevel);

    // Apply limit if specified
    if (limit && progressRecords.length > limit) {
      progressRecords = progressRecords.slice(0, limit);
    }

    const questionIds = progressRecords.map((p) => p.questionId);
    const questions =
      await this.questionRepository.findQuestionsByIds(questionIds);

    return this.mapToQuestionWithProgress(progressRecords, questions);
  }

  private async getNewQuestions(
    userId: string,
    limit?: number
  ): Promise<QuestionWithProgress[]> {
    const [allProgress, allQuestions] = await Promise.all([
      this.progressRepository.findProgressByUserId(userId),
      this.questionRepository.findQuestionsByUserId(userId),
    ]);

    const questionIdsWithProgress = new Set(allProgress.map((p) => p.questionId));

    let newQuestions = allQuestions.filter(
      (q) => !questionIdsWithProgress.has(q.id)
    );

    // Apply limit if specified
    if (limit && newQuestions.length > limit) {
      newQuestions = newQuestions.slice(0, limit);
    }

    // New questions have no progress
    return newQuestions.map((q) => ({
      progress: null,
      question: this.mapQuestion(q),
    }));
  }

  private async getRandomQuestions(
    userId: string,
    limit?: number
  ): Promise<QuestionWithProgress[]> {
    const [allProgress, allQuestions] = await Promise.all([
      this.progressRepository.findProgressByUserId(userId),
      this.questionRepository.findQuestionsByUserId(userId),
    ]);

    // Create a map of question ID to progress for quick lookup
    const progressByQuestionId = new Map(
      allProgress.map((p) => [p.questionId, p])
    );

    // Shuffle questions for randomness
    let shuffledQuestions = this.shuffleArray([...allQuestions]);

    // Apply limit if specified
    if (limit && shuffledQuestions.length > limit) {
      shuffledQuestions = shuffledQuestions.slice(0, limit);
    }

    return shuffledQuestions.map((q) => {
      const progress = progressByQuestionId.get(q.id);
      return {
        progress: progress ? this.mapProgress(progress) : null,
        question: this.mapQuestion(q),
      };
    });
  }

  private mapToQuestionWithProgress(
    progressRecords: ProgressEntity[],
    questions: MultipleChoiceQuestionEntity[]
  ): QuestionWithProgress[] {
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const result: QuestionWithProgress[] = [];

    for (const progress of progressRecords) {
      const question = questionMap.get(progress.questionId);
      if (!question) continue;

      result.push({
        progress: this.mapProgress(progress),
        question: this.mapQuestion(question),
      });
    }

    return result;
  }

  private mapProgress(progress: ProgressEntity) {
    return {
      id: progress.id,
      userId: progress.userId,
      questionId: progress.questionId,
      boxLevel: progress.boxLevel,
      nextReviewDate: progress.nextReviewDate,
      timesCorrect: progress.timesCorrect,
      timesIncorrect: progress.timesIncorrect,
      lastReviewedAt: progress.lastReviewedAt,
      createdAt: progress.createdAt,
    };
  }

  private mapQuestion(question: MultipleChoiceQuestionEntity) {
    return {
      id: question.id,
      videoId: question.videoId,
      questionText: question.questionText,
      options: question.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
        explanation: opt.explanation,
      })),
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
