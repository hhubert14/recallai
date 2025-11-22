export type ProgressEntity = {
  readonly id: number;
  readonly userId: string;
  readonly questionId: number;
  readonly boxLevel: number;
  readonly nextReviewDate: string | null;
  readonly timesCorrect: number;
  readonly timesIncorrect: number;
  readonly lastReviewedAt: string | null;
  readonly createdAt: string;
};
