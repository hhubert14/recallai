export class ProgressEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly questionId: number,
    public readonly boxLevel: number,
    public readonly nextReviewDate: string | null,
    public readonly timesCorrect: number,
    public readonly timesIncorrect: number,
    public readonly lastReviewedAt: string | null,
    public readonly createdAt: string,
  ) {}
}
