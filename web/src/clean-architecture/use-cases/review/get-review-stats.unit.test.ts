import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetReviewStatsUseCase } from "./get-review-stats.use-case";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";

function createMockReviewableItem(
  overrides: Partial<{
    id: number;
    userId: string;
    itemType: "question" | "flashcard";
    questionId: number | null;
    flashcardId: number | null;
    videoId: number | null;
    studySetId: number;
    createdAt: string;
  }> = {}
): ReviewableItemEntity {
  const itemType = overrides.itemType ?? "question";
  return new ReviewableItemEntity(
    overrides.id ?? 1,
    overrides.userId ?? "user-1",
    itemType,
    itemType === "question" ? (overrides.questionId ?? 1) : null,
    itemType === "flashcard" ? (overrides.flashcardId ?? 1) : null,
    overrides.videoId ?? 1,
    overrides.studySetId ?? 1,
    overrides.createdAt ?? "2026-01-01T00:00:00Z"
  );
}

function createMockReviewProgress(
  overrides: Partial<{
    id: number;
    userId: string;
    reviewableItemId: number;
    boxLevel: number;
    nextReviewDate: string | null;
    timesCorrect: number;
    timesIncorrect: number;
    lastReviewedAt: string | null;
    createdAt: string;
  }> = {}
): ReviewProgressEntity {
  return new ReviewProgressEntity(
    overrides.id ?? 1,
    overrides.userId ?? "user-1",
    overrides.reviewableItemId ?? 1,
    overrides.boxLevel ?? 1,
    overrides.nextReviewDate ?? "2026-01-20",
    overrides.timesCorrect ?? 0,
    overrides.timesIncorrect ?? 0,
    overrides.lastReviewedAt ?? null,
    overrides.createdAt ?? "2026-01-01T00:00:00Z"
  );
}

describe("GetReviewStatsUseCase", () => {
  let useCase: GetReviewStatsUseCase;
  let mockReviewableItemRepo: IReviewableItemRepository;
  let mockReviewProgressRepo: IReviewProgressRepository;

  beforeEach(() => {
    mockReviewableItemRepo = {
      createReviewableItemsForQuestionsBatch: vi.fn(),
      createReviewableItemsForFlashcardsBatch: vi.fn(),
      findReviewableItemsByUserId: vi.fn(),
      findReviewableItemsByUserIdAndVideoId: vi.fn(),
      findReviewableItemsByStudySetId: vi.fn(),
      findReviewableItemsByUserIdAndStudySetId: vi.fn(),
      findReviewableItemByQuestionId: vi.fn(),
      findReviewableItemByFlashcardId: vi.fn(),
      findReviewableItemById: vi.fn(),
      findReviewableItemsByIds: vi.fn(),
      countItemsByStudySetId: vi.fn(),
      countItemsByStudySetIdsBatch: vi.fn(),
    };
    mockReviewProgressRepo = {
      createReviewProgressBatch: vi.fn(),
      findReviewProgressByUserIdAndReviewableItemId: vi.fn(),
      findReviewProgressDueForReview: vi.fn(),
      findReviewableItemIdsWithoutProgress: vi.fn(),
      updateReviewProgress: vi.fn(),
      getReviewStats: vi.fn(),
      findReviewProgressByUserId: vi.fn(),
      findReviewProgressByReviewableItemIds: vi.fn(),
    };

    useCase = new GetReviewStatsUseCase(
      mockReviewableItemRepo,
      mockReviewProgressRepo
    );
  });

  describe("basic stats", () => {
    it("returns correct counts for all items", async () => {
      // 3 questions, 2 flashcards = 5 total items
      const allItems = [
        createMockReviewableItem({ id: 1, itemType: "question", questionId: 1 }),
        createMockReviewableItem({ id: 2, itemType: "question", questionId: 2 }),
        createMockReviewableItem({ id: 3, itemType: "question", questionId: 3 }),
        createMockReviewableItem({ id: 4, itemType: "flashcard", flashcardId: 1 }),
        createMockReviewableItem({ id: 5, itemType: "flashcard", flashcardId: 2 }),
      ];

      // Item 1 and 4 are due for review
      const dueProgress = [
        createMockReviewProgress({ reviewableItemId: 1 }),
        createMockReviewProgress({ reviewableItemId: 4 }),
      ];

      // Items 1, 2, 4 have progress - items 3, 5 are new
      const allProgress = [
        createMockReviewProgress({ reviewableItemId: 1 }),
        createMockReviewProgress({ reviewableItemId: 2 }),
        createMockReviewProgress({ reviewableItemId: 4 }),
      ];

      vi.mocked(mockReviewableItemRepo.findReviewableItemsByUserId).mockResolvedValue(allItems);
      vi.mocked(mockReviewProgressRepo.findReviewProgressDueForReview).mockResolvedValue(dueProgress);
      vi.mocked(mockReviewProgressRepo.findReviewProgressByUserId).mockResolvedValue(allProgress);
      vi.mocked(mockReviewProgressRepo.getReviewStats).mockResolvedValue({
        dueCount: 2,
        totalCount: 3,
        boxDistribution: [2, 1, 0, 0, 0],
      });

      const result = await useCase.execute("user-1");

      expect(result.dueCount).toBe(2);
      expect(result.newCount).toBe(2); // items 3 and 5
      expect(result.totalCount).toBe(5);
    });

    it("returns type breakdown", async () => {
      const allItems = [
        createMockReviewableItem({ id: 1, itemType: "question", questionId: 1 }),
        createMockReviewableItem({ id: 2, itemType: "question", questionId: 2 }),
        createMockReviewableItem({ id: 3, itemType: "flashcard", flashcardId: 1 }),
      ];

      vi.mocked(mockReviewableItemRepo.findReviewableItemsByUserId).mockResolvedValue(allItems);
      vi.mocked(mockReviewProgressRepo.findReviewProgressDueForReview).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.findReviewProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.getReviewStats).mockResolvedValue({
        dueCount: 0,
        totalCount: 0,
        boxDistribution: [0, 0, 0, 0, 0],
      });

      const result = await useCase.execute("user-1");

      expect(result.byType.questions).toBe(2);
      expect(result.byType.flashcards).toBe(1);
    });

    it("returns box distribution", async () => {
      const allItems = [
        createMockReviewableItem({ id: 1, itemType: "question", questionId: 1 }),
        createMockReviewableItem({ id: 2, itemType: "question", questionId: 2 }),
        createMockReviewableItem({ id: 3, itemType: "question", questionId: 3 }),
      ];

      vi.mocked(mockReviewableItemRepo.findReviewableItemsByUserId).mockResolvedValue(allItems);
      vi.mocked(mockReviewProgressRepo.findReviewProgressDueForReview).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.findReviewProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.getReviewStats).mockResolvedValue({
        dueCount: 0,
        totalCount: 3,
        boxDistribution: [1, 1, 1, 0, 0], // 1 in box 1, 1 in box 2, 1 in box 3
      });

      const result = await useCase.execute("user-1");

      expect(result.boxDistribution).toEqual([1, 1, 1, 0, 0]);
    });
  });

  describe("edge cases", () => {
    it("returns zeros when user has no items", async () => {
      vi.mocked(mockReviewableItemRepo.findReviewableItemsByUserId).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.findReviewProgressDueForReview).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.findReviewProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.getReviewStats).mockResolvedValue({
        dueCount: 0,
        totalCount: 0,
        boxDistribution: [0, 0, 0, 0, 0],
      });

      const result = await useCase.execute("user-1");

      expect(result.dueCount).toBe(0);
      expect(result.newCount).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.byType.questions).toBe(0);
      expect(result.byType.flashcards).toBe(0);
      expect(result.boxDistribution).toEqual([0, 0, 0, 0, 0]);
    });

    it("handles all items being new (no progress)", async () => {
      const allItems = [
        createMockReviewableItem({ id: 1, itemType: "question", questionId: 1 }),
        createMockReviewableItem({ id: 2, itemType: "flashcard", flashcardId: 1 }),
      ];

      vi.mocked(mockReviewableItemRepo.findReviewableItemsByUserId).mockResolvedValue(allItems);
      vi.mocked(mockReviewProgressRepo.findReviewProgressDueForReview).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.findReviewProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.getReviewStats).mockResolvedValue({
        dueCount: 0,
        totalCount: 0,
        boxDistribution: [0, 0, 0, 0, 0],
      });

      const result = await useCase.execute("user-1");

      expect(result.dueCount).toBe(0);
      expect(result.newCount).toBe(2);
      expect(result.totalCount).toBe(2);
    });

    it("handles all items having progress (none new)", async () => {
      const allItems = [
        createMockReviewableItem({ id: 1, itemType: "question", questionId: 1 }),
        createMockReviewableItem({ id: 2, itemType: "flashcard", flashcardId: 1 }),
      ];

      const allProgress = [
        createMockReviewProgress({ reviewableItemId: 1 }),
        createMockReviewProgress({ reviewableItemId: 2 }),
      ];

      vi.mocked(mockReviewableItemRepo.findReviewableItemsByUserId).mockResolvedValue(allItems);
      vi.mocked(mockReviewProgressRepo.findReviewProgressDueForReview).mockResolvedValue([]);
      vi.mocked(mockReviewProgressRepo.findReviewProgressByUserId).mockResolvedValue(allProgress);
      vi.mocked(mockReviewProgressRepo.getReviewStats).mockResolvedValue({
        dueCount: 0,
        totalCount: 2,
        boxDistribution: [2, 0, 0, 0, 0],
      });

      const result = await useCase.execute("user-1");

      expect(result.dueCount).toBe(0);
      expect(result.newCount).toBe(0);
      expect(result.totalCount).toBe(2);
    });
  });
});
