import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewStats } from "./types";

export class GetReviewStatsUseCase {
  constructor(
    private reviewableItemRepository: IReviewableItemRepository,
    private reviewProgressRepository: IReviewProgressRepository
  ) {}

  async execute(userId: string): Promise<ReviewStats> {
    const [allReviewableItems, dueProgress, allProgress, repoStats] =
      await Promise.all([
        this.reviewableItemRepository.findReviewableItemsByUserId(userId),
        this.reviewProgressRepository.findReviewProgressDueForReview(userId),
        this.reviewProgressRepository.findReviewProgressByUserId(userId),
        this.reviewProgressRepository.getReviewStats(userId),
      ]);

    // Count items by type
    const questionCount = allReviewableItems.filter(
      (item) => item.itemType === "question"
    ).length;
    const flashcardCount = allReviewableItems.filter(
      (item) => item.itemType === "flashcard"
    ).length;

    // Calculate new count (items without progress)
    const itemIdsWithProgress = new Set(
      allProgress.map((p) => p.reviewableItemId)
    );
    const newCount = allReviewableItems.filter(
      (item) => !itemIdsWithProgress.has(item.id)
    ).length;

    return {
      dueCount: dueProgress.length,
      newCount,
      totalCount: allReviewableItems.length,
      byType: {
        questions: questionCount,
        flashcards: flashcardCount,
      },
      boxDistribution: repoStats.boxDistribution,
    };
  }
}
