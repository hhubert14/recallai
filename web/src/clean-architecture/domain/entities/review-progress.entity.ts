export class ReviewProgressEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly reviewableItemId: number,
    public readonly boxLevel: number,
    public readonly nextReviewDate: string | null,
    public readonly timesCorrect: number,
    public readonly timesIncorrect: number,
    public readonly lastReviewedAt: string | null,
    public readonly createdAt: string
  ) {}

  isDue(): boolean {
    if (!this.nextReviewDate) {
      return false;
    }
    const today = new Date().toISOString().split("T")[0];
    return this.nextReviewDate <= today;
  }

  isNew(): boolean {
    return this.lastReviewedAt === null;
  }

  totalAttempts(): number {
    return this.timesCorrect + this.timesIncorrect;
  }

  accuracy(): number {
    const total = this.totalAttempts();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.timesCorrect / total) * 100);
  }
}
