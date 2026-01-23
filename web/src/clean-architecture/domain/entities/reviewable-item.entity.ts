export type ReviewableItemType = "question" | "flashcard";

export class ReviewableItemEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly itemType: ReviewableItemType,
    public readonly questionId: number | null,
    public readonly flashcardId: number | null,
    public readonly videoId: number,
    public readonly createdAt: string
  ) {}

  isQuestion(): boolean {
    return this.itemType === "question";
  }

  isFlashcard(): boolean {
    return this.itemType === "flashcard";
  }
}
