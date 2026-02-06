import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetItemsForReviewUseCase } from "./get-items-for-review.use-case";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

// Helper functions for creating mock entities
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
    // Use 'in' check to distinguish between "not provided" (use default) and "explicitly null"
    "videoId" in overrides ? (overrides.videoId as number | null) : 1,
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

function createMockQuestion(
  id: number,
  videoId: number = 1
): MultipleChoiceQuestionEntity {
  return new MultipleChoiceQuestionEntity(id, videoId, `Question ${id} text`, [
    new MultipleChoiceOption(id * 10 + 1, "Option A", true, "Explanation A"),
    new MultipleChoiceOption(id * 10 + 2, "Option B", false, "Explanation B"),
  ]);
}

function createMockFlashcard(
  id: number,
  videoId: number = 1,
  userId: string = "user-1"
): FlashcardEntity {
  return new FlashcardEntity(
    id,
    videoId,
    userId,
    `Front ${id}`,
    `Back ${id}`,
    "2026-01-01T00:00:00Z"
  );
}

function createMockVideo(id: number): VideoEntity {
  return new VideoEntity(
    id,
    "user-1",
    `Video ${id}`,
    `https://youtube.com/watch?v=test${id}`,
    "Test Channel",
    "2026-01-01T00:00:00Z"
  );
}

function createMockStudySet(id: number): StudySetEntity {
  return new StudySetEntity(
    id,
    `public-id-${id}`,
    "user-1",
    `Study Set ${id}`,
    null,
    "video",
    id,
    "2026-01-01T00:00:00Z",
    "2026-01-01T00:00:00Z"
  );
}

describe("GetItemsForReviewUseCase", () => {
  let useCase: GetItemsForReviewUseCase;
  let mockReviewableItemRepo: IReviewableItemRepository;
  let mockReviewProgressRepo: IReviewProgressRepository;
  let mockQuestionRepo: IQuestionRepository;
  let mockFlashcardRepo: IFlashcardRepository;
  let mockVideoRepo: IVideoRepository;
  let mockStudySetRepo: IStudySetRepository;

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
    mockQuestionRepo = {
      createMultipleChoiceQuestion: vi.fn(),
      findQuestionById: vi.fn(),
      findQuestionsByVideoId: vi.fn(),
      findQuestionsByIds: vi.fn(),
      countQuestionsByVideoIds: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
    };
    mockFlashcardRepo = {
      createFlashcards: vi.fn(),
      findFlashcardsByVideoId: vi.fn(),
      findFlashcardsByIds: vi.fn(),
      countFlashcardsByVideoIds: vi.fn(),
      findFlashcardById: vi.fn(),
      updateFlashcard: vi.fn(),
      deleteFlashcard: vi.fn(),
    };
    mockVideoRepo = {
      createVideo: vi.fn(),
      findVideoById: vi.fn(),
      findVideoByUserIdAndUrl: vi.fn(),
      findVideosByUserId: vi.fn(),
      findVideosByIds: vi.fn(),
    };
    mockStudySetRepo = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };

    useCase = new GetItemsForReviewUseCase(
      mockReviewableItemRepo,
      mockReviewProgressRepo,
      mockQuestionRepo,
      mockFlashcardRepo,
      mockVideoRepo,
      mockStudySetRepo
    );
  });

  describe("due mode", () => {
    it("returns items that are due for review with progress", async () => {
      // Setup: 2 reviewable items with progress records that are due
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          videoId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "flashcard",
          flashcardId: 1,
          videoId: 1,
          studySetId: 1,
        }),
      ];
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
      ];
      const questions = [createMockQuestion(1)];
      const flashcards = [createMockFlashcard(1)];
      const videos = [createMockVideo(1)];
      const studySets = [createMockStudySet(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue(
        studySets
      );

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(2);
      expect(result[0].progress).not.toBeNull();
      expect(result[0].content.type).toBe("question");
      expect(result[1].content.type).toBe("flashcard");
    });

    it("returns empty array when no items are due", async () => {
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue([]);

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(0);
    });

    it("respects limit parameter", async () => {
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
        createMockReviewProgress({ id: 3, reviewableItemId: 3 }),
      ];
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
      ];
      const questions = [createMockQuestion(1), createMockQuestion(2)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "due" }, 2);

      expect(result).toHaveLength(2);
    });

    it("prioritizes lower box levels (struggling items) when limiting", async () => {
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1, boxLevel: 3 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2, boxLevel: 1 }),
        createMockReviewProgress({ id: 3, reviewableItemId: 3, boxLevel: 2 }),
      ];
      const reviewableItems = [
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "question",
          questionId: 3,
        }),
      ];
      const questions = [createMockQuestion(2), createMockQuestion(3)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "due" }, 2);

      // Should prioritize box 1 and box 2 over box 3
      expect(result).toHaveLength(2);
      expect(result[0].progress?.boxLevel).toBe(1);
      expect(result[1].progress?.boxLevel).toBe(2);
    });
  });

  describe("new mode", () => {
    it("returns items without progress records", async () => {
      // All reviewable items for user
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      // Only item 1 has progress
      const itemIdsWithoutProgress = [2, 3];
      const newReviewableItems = [
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      const questions = [createMockQuestion(2)];
      const flashcards = [createMockFlashcard(1)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewableItemIdsWithoutProgress
      ).mockResolvedValue(itemIdsWithoutProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(newReviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "new" });

      // Should return items 2 and 3 (no progress)
      expect(result).toHaveLength(2);
      // Progress should be null for new items
      expect(result[0].progress).toBeNull();
      expect(result[1].progress).toBeNull();
    });

    it("returns empty array when all items have progress", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
      ];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewableItemIdsWithoutProgress
      ).mockResolvedValue([]);

      const result = await useCase.execute("user-1", { mode: "new" });

      expect(result).toHaveLength(0);
    });

    it("respects limit parameter", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "question",
          questionId: 3,
        }),
      ];
      const itemIdsWithoutProgress = [1, 2, 3];
      const limitedItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
      ];
      const questions = [createMockQuestion(1), createMockQuestion(2)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewableItemIdsWithoutProgress
      ).mockResolvedValue(itemIdsWithoutProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(limitedItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "new" }, 2);

      expect(result).toHaveLength(2);
    });
  });

  describe("random mode", () => {
    it("returns items regardless of progress state", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      // Only item 1 has progress
      const allProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
      ];
      const questions = [createMockQuestion(1), createMockQuestion(2)];
      const flashcards = [createMockFlashcard(1)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressByReviewableItemIds
      ).mockResolvedValue(allProgress);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "random" });

      // Should return all 3 items
      expect(result).toHaveLength(3);
      // Item 1 has progress, items 2 and 3 don't
      const item1 = result.find((r) => r.reviewableItem.id === 1);
      const item2 = result.find((r) => r.reviewableItem.id === 2);
      expect(item1?.progress).not.toBeNull();
      expect(item2?.progress).toBeNull();
    });

    it("respects limit parameter", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "question",
          questionId: 3,
        }),
        createMockReviewableItem({
          id: 4,
          itemType: "question",
          questionId: 4,
        }),
        createMockReviewableItem({
          id: 5,
          itemType: "question",
          questionId: 5,
        }),
      ];
      const questions = [
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
        createMockQuestion(4),
        createMockQuestion(5),
      ];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressByReviewableItemIds
      ).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "random" }, 3);

      expect(result).toHaveLength(3);
    });

    it("returns empty array when user has no items", async () => {
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue([]);

      const result = await useCase.execute("user-1", { mode: "random" });

      expect(result).toHaveLength(0);
    });
  });

  describe("item type filtering", () => {
    it("filters to questions only when itemType is 'question'", async () => {
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
      ];
      const questions = [createMockQuestion(1)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "due",
        itemType: "question",
      });

      expect(result).toHaveLength(1);
      expect(result[0].content.type).toBe("question");
    });

    it("filters to flashcards only when itemType is 'flashcard'", async () => {
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
      ];
      const flashcards = [createMockFlashcard(1)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "due",
        itemType: "flashcard",
      });

      expect(result).toHaveLength(1);
      expect(result[0].content.type).toBe("flashcard");
    });

    it("returns both types when itemType is 'all'", async () => {
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
      ];
      const questions = [createMockQuestion(1)];
      const flashcards = [createMockFlashcard(1)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "due",
        itemType: "all",
      });

      expect(result).toHaveLength(2);
      const types = result.map((r) => r.content.type);
      expect(types).toContain("question");
      expect(types).toContain("flashcard");
    });
  });

  describe("backward compatibility", () => {
    it("defaults to due mode when no params provided", async () => {
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue([]);

      const result = await useCase.execute("user-1");

      expect(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it("defaults to all item types when itemType not specified", async () => {
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "flashcard",
          flashcardId: 1,
        }),
      ];
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
      ];
      const questions = [createMockQuestion(1)];
      const flashcards = [createMockFlashcard(1)];
      const videos = [createMockVideo(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(2);
    });
  });

  describe("video and study set info", () => {
    it("includes video and study set info for each item", async () => {
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          videoId: 1,
          studySetId: 1,
        }),
      ];
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
      ];
      const questions = [createMockQuestion(1)];
      const videos = [createMockVideo(1)];
      const studySets = [createMockStudySet(1)];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue(videos);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue(
        studySets
      );

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result[0].video).toBeDefined();
      expect(result[0].video?.id).toBe(1);
      expect(result[0].video?.title).toBe("Video 1");
      expect(result[0].studySet).toBeDefined();
      expect(result[0].studySet.id).toBe(1);
      expect(result[0].studySet.publicId).toBe("public-id-1");
      expect(result[0].studySet.name).toBe("Study Set 1");
    });
  });

  describe("edge cases and filtering", () => {
    it("applies limit before itemType filtering in due mode, potentially yielding fewer results", async () => {
      // Two due progress records: first is flashcard, second is question
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1, boxLevel: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2, boxLevel: 2 }),
      ];
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "flashcard",
          flashcardId: 10,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 20,
        }),
      ];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      // Repository will be called with only the first ID due to the limit
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue([reviewableItems[0]]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([]);

      const result = await useCase.execute(
        "user-1",
        { mode: "due", itemType: "question" },
        1
      );

      // Because limit is applied before filtering by type, we end up with 0 items
      expect(result).toHaveLength(0);
    });

    it("excludes items with missing content entity (question/flashcard not found)", async () => {
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1, boxLevel: 1 }),
      ];
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 999,
          videoId: 1,
          studySetId: 1,
        }),
      ];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      // Missing question entity
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      // Video and study set exist but the item should still be excluded due to missing question
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(0);
    });

    it("excludes items with missing study set entity", async () => {
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1, boxLevel: 1 }),
      ];
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          videoId: 1,
          studySetId: 999,
        }),
      ];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      // Study set not found
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([]);

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(0);
    });

    it("includes items when video is null but study set exists", async () => {
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1, boxLevel: 1 }),
      ];
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          videoId: null,
          studySetId: 1,
        }),
      ];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(reviewableItems);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(1);
      expect(result[0].video).toBeNull();
      expect(result[0].studySet).toBeDefined();
      expect(result[0].studySet.id).toBe(1);
    });

    it("random mode respects itemType filter", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          videoId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "flashcard",
          flashcardId: 2,
          videoId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 3,
          videoId: 1,
          studySetId: 1,
        }),
      ];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressByReviewableItemIds
      ).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
        createMockFlashcard(2, 1),
        createMockFlashcard(3, 1),
      ]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "random",
        itemType: "flashcard",
      });

      expect(result).toHaveLength(2);
      result.forEach((r) => expect(r.content.type).toBe("flashcard"));
    });

    it("random mode shuffles deterministically when Math.random is mocked", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          videoId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
          videoId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "question",
          questionId: 3,
          videoId: 1,
          studySetId: 1,
        }),
      ];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressByReviewableItemIds
      ).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const randomSpy = vi
        .spyOn(Math, "random")
        .mockImplementationOnce(() => 0.0) // i=2 -> j=0, swap [1,2,3] -> [3,2,1]
        .mockImplementationOnce(() => 0.99); // i=1 -> j=1, stays [3,2,1]

      const result = await useCase.execute("user-1", { mode: "random" });

      // Expect order [3,2,1]
      expect(result.map((r) => r.reviewableItem.id)).toEqual([3, 2, 1]);

      randomSpy.mockRestore();
    });
  });

  describe("studySetId filtering", () => {
    it("due mode filters items by studySetId when provided", async () => {
      // Items from different study sets
      const reviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
          studySetId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
          studySetId: 1,
        }),
      ];
      // Progress for items in both study sets
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
        createMockReviewProgress({ id: 3, reviewableItemId: 3 }),
      ];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      // When studySetId is provided, should filter to only study set 1 items (ids 1, 3)
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue([reviewableItems[0], reviewableItems[2]]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
        createMockFlashcard(1),
      ]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "due",
        studySetId: 1,
      });

      // Should only return items from study set 1
      expect(result).toHaveLength(2);
      result.forEach((r) => expect(r.studySet.id).toBe(1));
    });

    it("new mode filters items by studySetId when provided", async () => {
      // All items across different study sets
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
          studySetId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
          studySetId: 1,
        }),
      ];

      // When studySetId is provided, should only fetch items from that study set
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).mockResolvedValue([allReviewableItems[0], allReviewableItems[2]]);
      vi.mocked(
        mockReviewProgressRepo.findReviewableItemIdsWithoutProgress
      ).mockResolvedValue([1, 3]);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue([allReviewableItems[0], allReviewableItems[2]]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
        createMockFlashcard(1),
      ]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "new",
        studySetId: 1,
      });

      // Should only return items from study set 1
      expect(result).toHaveLength(2);
      result.forEach((r) => expect(r.studySet.id).toBe(1));
      // Should have called the study-set-specific method
      expect(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).toHaveBeenCalledWith("user-1", 1);
      expect(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).not.toHaveBeenCalled();
    });

    it("random mode filters items by studySetId when provided", async () => {
      // All items across different study sets
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
          studySetId: 2,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
          studySetId: 1,
        }),
      ];

      // When studySetId is provided, should only fetch items from that study set
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).mockResolvedValue([allReviewableItems[0], allReviewableItems[2]]);
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressByReviewableItemIds
      ).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
        createMockFlashcard(1),
      ]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "random",
        studySetId: 1,
      });

      // Should only return items from study set 1
      expect(result).toHaveLength(2);
      result.forEach((r) => expect(r.studySet.id).toBe(1));
      // Should have called the study-set-specific method
      expect(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).toHaveBeenCalledWith("user-1", 1);
    });

    it("returns all items when studySetId is not provided (backward compatible)", async () => {
      const allReviewableItems = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 2,
          itemType: "question",
          questionId: 2,
          studySetId: 2,
        }),
      ];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).mockResolvedValue(allReviewableItems);
      vi.mocked(
        mockReviewProgressRepo.findReviewProgressByReviewableItemIds
      ).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
        createMockQuestion(2),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
        createMockStudySet(2),
      ]);

      const result = await useCase.execute("user-1", { mode: "random" });

      // Should return items from all study sets
      expect(result).toHaveLength(2);
      const studySetIds = result.map((r) => r.studySet.id);
      expect(studySetIds).toContain(1);
      expect(studySetIds).toContain(2);
      // Should have called the user-level method
      expect(
        mockReviewableItemRepo.findReviewableItemsByUserId
      ).toHaveBeenCalledWith("user-1");
    });

    it("due mode with studySetId filters progress records to only those items", async () => {
      // Progress exists for items from multiple study sets
      const dueProgress = [
        createMockReviewProgress({ id: 1, reviewableItemId: 1 }),
        createMockReviewProgress({ id: 2, reviewableItemId: 2 }),
        createMockReviewProgress({ id: 3, reviewableItemId: 3 }),
      ];
      // But we want items only from study set 1
      const studySet1Items = [
        createMockReviewableItem({
          id: 1,
          itemType: "question",
          questionId: 1,
          studySetId: 1,
        }),
        createMockReviewableItem({
          id: 3,
          itemType: "flashcard",
          flashcardId: 1,
          studySetId: 1,
        }),
      ];

      vi.mocked(
        mockReviewProgressRepo.findReviewProgressDueForReview
      ).mockResolvedValue(dueProgress);
      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByIds
      ).mockResolvedValue(studySet1Items);
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
        createMockQuestion(1),
      ]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
        createMockFlashcard(1),
      ]);
      vi.mocked(mockVideoRepo.findVideosByIds).mockResolvedValue([
        createMockVideo(1),
      ]);
      vi.mocked(mockStudySetRepo.findStudySetsByIds).mockResolvedValue([
        createMockStudySet(1),
      ]);

      const result = await useCase.execute("user-1", {
        mode: "due",
        studySetId: 1,
      });

      // Should only have 2 items (from study set 1)
      expect(result).toHaveLength(2);
      // Progress records should be filtered too
      expect(result[0].progress).not.toBeNull();
      expect(result[1].progress).not.toBeNull();
    });
  });
});
