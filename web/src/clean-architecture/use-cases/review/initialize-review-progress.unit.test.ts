import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  InitializeReviewProgressUseCase,
  ReviewableItemNotFoundError,
} from "./initialize-review-progress.use-case";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";

describe("InitializeReviewProgressUseCase", () => {
  let useCase: InitializeReviewProgressUseCase;
  let mockProgressRepo: IReviewProgressRepository;
  let mockItemRepo: IReviewableItemRepository;

  const userId = "user-123";
  const reviewableItemId = 42;

  beforeEach(() => {
    mockProgressRepo = {
      findReviewProgressByUserIdAndReviewableItemId: vi.fn(),
      createReviewProgressBatch: vi.fn(),
      findReviewProgressDueForReview: vi.fn(),
      findReviewableItemIdsWithoutProgress: vi.fn(),
      updateReviewProgress: vi.fn(),
      getReviewStats: vi.fn(),
      findReviewProgressByUserId: vi.fn(),
      findReviewProgressByReviewableItemIds: vi.fn(),
    };
    mockItemRepo = {
      createReviewableItemsForQuestionsBatch: vi.fn(),
      createReviewableItemsForFlashcardsBatch: vi.fn(),
      findReviewableItemsByUserId: vi.fn(),
      findReviewableItemsByUserIdAndVideoId: vi.fn(),
      findReviewableItemByQuestionId: vi.fn(),
      findReviewableItemByFlashcardId: vi.fn(),
      findReviewableItemById: vi.fn(),
      findReviewableItemsByIds: vi.fn(),
    };
    useCase = new InitializeReviewProgressUseCase(mockProgressRepo, mockItemRepo);
  });

  describe("ID resolution", () => {
    beforeEach(() => {
      vi.mocked(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).mockResolvedValue(null);

      const createdProgress = new ReviewProgressEntity(
        1,
        userId,
        reviewableItemId,
        2,
        "2025-01-27",
        1,
        0,
        new Date().toISOString(),
        new Date().toISOString()
      );
      vi.mocked(mockProgressRepo.createReviewProgressBatch).mockResolvedValue([
        createdProgress,
      ]);
    });

    it("uses reviewableItemId directly when provided", async () => {
      await useCase.execute({
        userId,
        reviewableItemId,
        isCorrect: true,
      });

      expect(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).toHaveBeenCalledWith(userId, reviewableItemId);
      expect(mockItemRepo.findReviewableItemByQuestionId).not.toHaveBeenCalled();
      expect(mockItemRepo.findReviewableItemByFlashcardId).not.toHaveBeenCalled();
    });

    it("resolves reviewableItemId from questionId", async () => {
      const questionId = 100;
      const reviewableItem = new ReviewableItemEntity(
        reviewableItemId,
        userId,
        1,
        questionId,
        null,
        new Date().toISOString()
      );

      vi.mocked(mockItemRepo.findReviewableItemByQuestionId).mockResolvedValue(
        reviewableItem
      );

      await useCase.execute({
        userId,
        questionId,
        isCorrect: true,
      });

      expect(mockItemRepo.findReviewableItemByQuestionId).toHaveBeenCalledWith(
        questionId
      );
      expect(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).toHaveBeenCalledWith(userId, reviewableItemId);
    });

    it("resolves reviewableItemId from flashcardId", async () => {
      const flashcardId = 200;
      const reviewableItem = new ReviewableItemEntity(
        reviewableItemId,
        userId,
        1,
        null,
        flashcardId,
        new Date().toISOString()
      );

      vi.mocked(mockItemRepo.findReviewableItemByFlashcardId).mockResolvedValue(
        reviewableItem
      );

      await useCase.execute({
        userId,
        flashcardId,
        isCorrect: true,
      });

      expect(mockItemRepo.findReviewableItemByFlashcardId).toHaveBeenCalledWith(
        flashcardId
      );
      expect(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).toHaveBeenCalledWith(userId, reviewableItemId);
    });

    it("prioritizes reviewableItemId over questionId and flashcardId", async () => {
      await useCase.execute({
        userId,
        reviewableItemId,
        questionId: 100,
        flashcardId: 200,
        isCorrect: true,
      });

      expect(mockItemRepo.findReviewableItemByQuestionId).not.toHaveBeenCalled();
      expect(mockItemRepo.findReviewableItemByFlashcardId).not.toHaveBeenCalled();
      expect(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).toHaveBeenCalledWith(userId, reviewableItemId);
    });

    it("throws ReviewableItemNotFoundError when no valid identifier is provided", async () => {
      await expect(
        useCase.execute({
          userId,
          isCorrect: true,
        })
      ).rejects.toThrow(ReviewableItemNotFoundError);
    });

    it("throws ReviewableItemNotFoundError when questionId lookup returns null", async () => {
      vi.mocked(mockItemRepo.findReviewableItemByQuestionId).mockResolvedValue(
        null
      );

      await expect(
        useCase.execute({
          userId,
          questionId: 999,
          isCorrect: true,
        })
      ).rejects.toThrow(ReviewableItemNotFoundError);
    });

    it("throws ReviewableItemNotFoundError when flashcardId lookup returns null", async () => {
      vi.mocked(mockItemRepo.findReviewableItemByFlashcardId).mockResolvedValue(
        null
      );

      await expect(
        useCase.execute({
          userId,
          flashcardId: 999,
          isCorrect: true,
        })
      ).rejects.toThrow(ReviewableItemNotFoundError);
    });
  });

  describe("when no existing progress exists", () => {
    beforeEach(() => {
      vi.mocked(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).mockResolvedValue(null);
    });

    it("creates progress at box 2 when answer is correct", async () => {
      const createdProgress = new ReviewProgressEntity(
        1,
        userId,
        reviewableItemId,
        2, // box level 2 for correct
        "2025-01-27", // 3 days from now
        1,
        0,
        new Date().toISOString(),
        new Date().toISOString()
      );

      vi.mocked(mockProgressRepo.createReviewProgressBatch).mockResolvedValue([
        createdProgress,
      ]);

      const result = await useCase.execute({
        userId,
        reviewableItemId,
        isCorrect: true,
      });

      expect(result.created).toBe(true);
      expect(result.progress.boxLevel).toBe(2);
      expect(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).toHaveBeenCalledWith(userId, reviewableItemId);
      expect(mockProgressRepo.createReviewProgressBatch).toHaveBeenCalledWith([
        expect.objectContaining({
          userId,
          reviewableItemId,
          boxLevel: 2,
          timesCorrect: 1,
          timesIncorrect: 0,
        }),
      ]);
    });

    it("creates progress at box 1 when answer is incorrect", async () => {
      const createdProgress = new ReviewProgressEntity(
        1,
        userId,
        reviewableItemId,
        1, // box level 1 for incorrect
        "2025-01-25", // 1 day from now
        0,
        1,
        new Date().toISOString(),
        new Date().toISOString()
      );

      vi.mocked(mockProgressRepo.createReviewProgressBatch).mockResolvedValue([
        createdProgress,
      ]);

      const result = await useCase.execute({
        userId,
        reviewableItemId,
        isCorrect: false,
      });

      expect(result.created).toBe(true);
      expect(result.progress.boxLevel).toBe(1);
      expect(mockProgressRepo.createReviewProgressBatch).toHaveBeenCalledWith([
        expect.objectContaining({
          userId,
          reviewableItemId,
          boxLevel: 1,
          timesCorrect: 0,
          timesIncorrect: 1,
        }),
      ]);
    });

    it("throws an error if createReviewProgressBatch returns empty array", async () => {
      vi.mocked(mockProgressRepo.createReviewProgressBatch).mockResolvedValue(
        []
      );

      await expect(
        useCase.execute({
          userId,
          reviewableItemId,
          isCorrect: true,
        })
      ).rejects.toThrow(
        `Failed to create review progress for reviewableItemId: ${reviewableItemId}`
      );
    });
  });

  describe("when progress already exists", () => {
    it("returns existing progress unchanged with created: false", async () => {
      const existingProgress = new ReviewProgressEntity(
        1,
        userId,
        reviewableItemId,
        3, // already at box 3
        "2025-01-30",
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T10:00:00Z"
      );

      vi.mocked(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).mockResolvedValue(existingProgress);

      const result = await useCase.execute({
        userId,
        reviewableItemId,
        isCorrect: true,
      });

      expect(result.created).toBe(false);
      expect(result.progress).toBe(existingProgress);
      expect(result.progress.boxLevel).toBe(3); // unchanged
      expect(mockProgressRepo.createReviewProgressBatch).not.toHaveBeenCalled();
      expect(mockProgressRepo.updateReviewProgress).not.toHaveBeenCalled();
    });

    it("does not update existing progress even when answer is incorrect", async () => {
      const existingProgress = new ReviewProgressEntity(
        1,
        userId,
        reviewableItemId,
        4, // at box 4
        "2025-01-30",
        8,
        1,
        "2025-01-20T10:00:00Z",
        "2025-01-10T10:00:00Z"
      );

      vi.mocked(
        mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId
      ).mockResolvedValue(existingProgress);

      const result = await useCase.execute({
        userId,
        reviewableItemId,
        isCorrect: false,
      });

      expect(result.created).toBe(false);
      expect(result.progress.boxLevel).toBe(4); // still at box 4, not reset to 1
      expect(mockProgressRepo.createReviewProgressBatch).not.toHaveBeenCalled();
      expect(mockProgressRepo.updateReviewProgress).not.toHaveBeenCalled();
    });
  });
});
