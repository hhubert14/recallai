import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";

export type MasteryStatus = "mastered" | "learning" | "not_started";

export type StudySetProgress = {
  mastered: number;
  learning: number;
  notStarted: number;
  total: number;
};

export type TermProgress = {
  itemType: "question" | "flashcard";
  itemId: number;
  masteryStatus: MasteryStatus;
};

export type GetStudySetProgressResult = {
  terms: TermProgress[];
  summary: StudySetProgress;
};

function getMasteryStatusFromBoxLevel(boxLevel: number | null): MasteryStatus {
  if (boxLevel === null) {
    return "not_started";
  }
  if (boxLevel >= 5) {
    return "mastered";
  }
  return "learning";
}

export class GetStudySetProgressUseCase {
  constructor(
    private reviewableItemRepository: IReviewableItemRepository,
    private reviewProgressRepository: IReviewProgressRepository
  ) {}

  async execute(
    userId: string,
    studySetId: number
  ): Promise<GetStudySetProgressResult> {
    const reviewableItems =
      await this.reviewableItemRepository.findReviewableItemsByUserIdAndStudySetId(
        userId,
        studySetId
      );

    if (reviewableItems.length === 0) {
      return {
        terms: [],
        summary: {
          mastered: 0,
          learning: 0,
          notStarted: 0,
          total: 0,
        },
      };
    }

    const reviewableItemIds = reviewableItems.map((item) => item.id);
    const progressRecords =
      await this.reviewProgressRepository.findReviewProgressByReviewableItemIds(
        userId,
        reviewableItemIds
      );

    const progressByReviewableItemId = new Map(
      progressRecords.map((p) => [p.reviewableItemId, p])
    );

    const terms: TermProgress[] = reviewableItems.map((item) => {
      const progress = progressByReviewableItemId.get(item.id);
      const masteryStatus = getMasteryStatusFromBoxLevel(
        progress?.boxLevel ?? null
      );

      const itemId =
        item.itemType === "question" ? item.questionId : item.flashcardId;

      if (itemId === null) {
        throw new Error(
          `Invalid reviewable item: ${item.itemType} (id: ${item.id}) is missing its ${item.itemType}Id`
        );
      }

      return {
        itemType: item.itemType,
        itemId,
        masteryStatus,
      };
    });

    const summary: StudySetProgress = {
      mastered: terms.filter((t) => t.masteryStatus === "mastered").length,
      learning: terms.filter((t) => t.masteryStatus === "learning").length,
      notStarted: terms.filter((t) => t.masteryStatus === "not_started").length,
      total: terms.length,
    };

    return { terms, summary };
  }
}
