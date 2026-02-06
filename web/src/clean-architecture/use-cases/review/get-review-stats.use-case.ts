import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewStats } from "./types";

export class GetReviewStatsUseCase {
  constructor(
    private reviewableItemRepository: IReviewableItemRepository,
    private reviewProgressRepository: IReviewProgressRepository
  ) {}

  async execute(userId: string, studySetId?: number): Promise<ReviewStats> {
    const [allReviewableItems, dueProgress, allProgress, repoStats] =
      await Promise.all([
        studySetId !== undefined
          ? this.reviewableItemRepository.findReviewableItemsByUserIdAndStudySetId(
              userId,
              studySetId
            )
          : this.reviewableItemRepository.findReviewableItemsByUserId(userId),
        this.reviewProgressRepository.findReviewProgressDueForReview(userId),
        this.reviewProgressRepository.findReviewProgressByUserId(userId),
        this.reviewProgressRepository.getReviewStats(userId),
      ]);

    // Create a set of valid item IDs for this scope (all items or study set items)
    const validItemIds = new Set(allReviewableItems.map((item) => item.id));

    // Count items by type
    const questionCount = allReviewableItems.filter(
      (item) => item.itemType === "question"
    ).length;
    const flashcardCount = allReviewableItems.filter(
      (item) => item.itemType === "flashcard"
    ).length;

    // Filter due progress to only include items in scope
    const filteredDueProgress = dueProgress.filter((p) =>
      validItemIds.has(p.reviewableItemId)
    );

    // Calculate new count (items without progress)
    const itemIdsWithProgress = new Set(
      allProgress.map((p) => p.reviewableItemId)
    );
    const newCount = allReviewableItems.filter(
      (item) => !itemIdsWithProgress.has(item.id)
    ).length;

    return {
      dueCount: filteredDueProgress.length,
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
