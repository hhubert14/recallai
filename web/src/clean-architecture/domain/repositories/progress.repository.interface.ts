import { ProgressEntity } from "../entities/progress.entity";

export interface IProgressRepository {
  /**
   * Find all progress records for a user.
   * Used to identify which questions have been started (for "new" questions mode).
   */
  findProgressByUserId(userId: string): Promise<ProgressEntity[]>;

  createProgress(
    userId: string,
    questionId: number,
    boxLevel: number,
    nextReviewDate: string,
    timesCorrect: number,
    timesIncorrect: number,
    lastReviewedAt: string
  ): Promise<ProgressEntity>;

  createProgressBatch(
    items: Array<{
      userId: string;
      questionId: number;
      boxLevel: number;
      nextReviewDate: string;
      timesCorrect: number;
      timesIncorrect: number;
      lastReviewedAt: string;
    }>
  ): Promise<ProgressEntity[]>;

  findProgressByUserIdAndQuestionId(
    userId: string,
    questionId: number
  ): Promise<ProgressEntity | null>;

  updateProgress(
    userId: string,
    questionId: number,
    boxLevel: number,
    nextReviewDate: string,
    timesCorrect: number,
    timesIncorrect: number,
    lastReviewedAt: string
  ): Promise<ProgressEntity>;

  findProgressDueForReview(userId: string): Promise<ProgressEntity[]>;

  getProgressStats(userId: string): Promise<{
    questionsDueToday: number;
    totalQuestionsInSystem: number;
    questionsInBox1: number;
    questionsInBox2: number;
    questionsInBox3: number;
    questionsInBox4: number;
    questionsInBox5: number;
  }>;
}
