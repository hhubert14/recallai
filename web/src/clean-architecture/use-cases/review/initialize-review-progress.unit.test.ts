import { describe, it, expect, vi, beforeEach } from "vitest";
import { InitializeReviewProgressUseCase } from "./initialize-review-progress.use-case";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";

describe("InitializeReviewProgressUseCase", () => {
  let useCase: InitializeReviewProgressUseCase;
  let mockProgressRepo: IReviewProgressRepository;

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
    useCase = new InitializeReviewProgressUseCase(mockProgressRepo);
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

      const result = await useCase.execute(userId, reviewableItemId, true);

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

      const result = await useCase.execute(userId, reviewableItemId, false);

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
        useCase.execute(userId, reviewableItemId, true)
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

      const result = await useCase.execute(userId, reviewableItemId, true);

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

      const result = await useCase.execute(userId, reviewableItemId, false);

      expect(result.created).toBe(false);
      expect(result.progress.boxLevel).toBe(4); // still at box 4, not reset to 1
      expect(mockProgressRepo.createReviewProgressBatch).not.toHaveBeenCalled();
      expect(mockProgressRepo.updateReviewProgress).not.toHaveBeenCalled();
    });
  });
});
