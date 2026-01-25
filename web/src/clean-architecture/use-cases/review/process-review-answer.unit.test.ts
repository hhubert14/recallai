import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessReviewAnswerUseCase } from "./process-review-answer.use-case";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";

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

describe("ProcessReviewAnswerUseCase", () => {
  let useCase: ProcessReviewAnswerUseCase;
  let mockProgressRepo: IReviewProgressRepository;

  beforeEach(() => {
    mockProgressRepo = {
      createReviewProgressBatch: vi.fn(),
      findReviewProgressByUserIdAndReviewableItemId: vi.fn(),
      findReviewProgressDueForReview: vi.fn(),
      findReviewableItemIdsWithoutProgress: vi.fn(),
      updateReviewProgress: vi.fn(),
      getReviewStats: vi.fn(),
      findReviewProgressByUserId: vi.fn(),
      findReviewProgressByReviewableItemIds: vi.fn(),
    };

    useCase = new ProcessReviewAnswerUseCase(mockProgressRepo);
  });

  describe("when progress exists", () => {
    it("updates progress with incremented box level on correct answer", async () => {
      const existingProgress = createMockReviewProgress({
        boxLevel: 2,
        timesCorrect: 3,
        timesIncorrect: 1,
      });
      const updatedProgress = createMockReviewProgress({
        boxLevel: 3,
        timesCorrect: 4,
        timesIncorrect: 1,
      });

      vi.mocked(mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId).mockResolvedValue(
        existingProgress
      );
      vi.mocked(mockProgressRepo.updateReviewProgress).mockResolvedValue(updatedProgress);

      const result = await useCase.execute("user-1", 1, true);

      expect(result.boxLevel).toBe(3);
      expect(result.timesCorrect).toBe(4);
      expect(mockProgressRepo.updateReviewProgress).toHaveBeenCalledWith(
        "user-1",
        1,
        3, // new box level
        expect.any(String), // next review date
        4, // times correct
        1, // times incorrect
        expect.any(String) // last reviewed at
      );
    });

    it("resets to box 1 on incorrect answer", async () => {
      const existingProgress = createMockReviewProgress({
        boxLevel: 4,
        timesCorrect: 5,
        timesIncorrect: 0,
      });
      const updatedProgress = createMockReviewProgress({
        boxLevel: 1,
        timesCorrect: 5,
        timesIncorrect: 1,
      });

      vi.mocked(mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId).mockResolvedValue(
        existingProgress
      );
      vi.mocked(mockProgressRepo.updateReviewProgress).mockResolvedValue(updatedProgress);

      const result = await useCase.execute("user-1", 1, false);

      expect(result.boxLevel).toBe(1);
      expect(mockProgressRepo.updateReviewProgress).toHaveBeenCalledWith(
        "user-1",
        1,
        1, // reset to box 1
        expect.any(String),
        5, // times correct unchanged
        1, // times incorrect incremented
        expect.any(String)
      );
    });

    it("caps box level at 5 (mastered)", async () => {
      const existingProgress = createMockReviewProgress({
        boxLevel: 5,
        timesCorrect: 10,
        timesIncorrect: 0,
      });
      const updatedProgress = createMockReviewProgress({
        boxLevel: 5,
        timesCorrect: 11,
        timesIncorrect: 0,
      });

      vi.mocked(mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId).mockResolvedValue(
        existingProgress
      );
      vi.mocked(mockProgressRepo.updateReviewProgress).mockResolvedValue(updatedProgress);

      const result = await useCase.execute("user-1", 1, true);

      expect(result.boxLevel).toBe(5);
      expect(mockProgressRepo.updateReviewProgress).toHaveBeenCalledWith(
        "user-1",
        1,
        5, // stays at max box 5
        expect.any(String),
        11,
        0,
        expect.any(String)
      );
    });
  });

  describe("when progress does not exist", () => {
    it("creates new progress with box level 2 on correct answer", async () => {
      const createdProgress = createMockReviewProgress({
        boxLevel: 2,
        timesCorrect: 1,
        timesIncorrect: 0,
      });

      vi.mocked(mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId).mockResolvedValue(
        null
      );
      vi.mocked(mockProgressRepo.createReviewProgressBatch).mockResolvedValue([createdProgress]);

      const result = await useCase.execute("user-1", 1, true);

      expect(result.boxLevel).toBe(2);
      expect(result.timesCorrect).toBe(1);
      expect(result.timesIncorrect).toBe(0);
      expect(mockProgressRepo.createReviewProgressBatch).toHaveBeenCalledWith([
        {
          userId: "user-1",
          reviewableItemId: 1,
          boxLevel: 2,
          nextReviewDate: expect.any(String),
          timesCorrect: 1,
          timesIncorrect: 0,
          lastReviewedAt: expect.any(String),
        },
      ]);
    });

    it("creates new progress with box level 1 on incorrect answer", async () => {
      const createdProgress = createMockReviewProgress({
        boxLevel: 1,
        timesCorrect: 0,
        timesIncorrect: 1,
      });

      vi.mocked(mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId).mockResolvedValue(
        null
      );
      vi.mocked(mockProgressRepo.createReviewProgressBatch).mockResolvedValue([createdProgress]);

      const result = await useCase.execute("user-1", 1, false);

      expect(result.boxLevel).toBe(1);
      expect(result.timesCorrect).toBe(0);
      expect(result.timesIncorrect).toBe(1);
      expect(mockProgressRepo.createReviewProgressBatch).toHaveBeenCalledWith([
        {
          userId: "user-1",
          reviewableItemId: 1,
          boxLevel: 1,
          nextReviewDate: expect.any(String),
          timesCorrect: 0,
          timesIncorrect: 1,
          lastReviewedAt: expect.any(String),
        },
      ]);
    });
  });

  describe("spaced repetition intervals", () => {
    it("sets next review date based on box level intervals", async () => {
      // Box 1 = 1 day, Box 2 = 3 days, Box 3 = 7 days, Box 4 = 14 days, Box 5 = 30 days
      const existingProgress = createMockReviewProgress({
        boxLevel: 2,
        timesCorrect: 1,
        timesIncorrect: 0,
      });
      const updatedProgress = createMockReviewProgress({
        boxLevel: 3,
        nextReviewDate: "2026-01-27", // 7 days from now
      });

      vi.mocked(mockProgressRepo.findReviewProgressByUserIdAndReviewableItemId).mockResolvedValue(
        existingProgress
      );
      vi.mocked(mockProgressRepo.updateReviewProgress).mockResolvedValue(updatedProgress);

      await useCase.execute("user-1", 1, true);

      // The next review date should be set to 7 days from now (box 3 interval)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 7);
      const expectedDateString = expectedDate.toISOString().split("T")[0];

      expect(mockProgressRepo.updateReviewProgress).toHaveBeenCalledWith(
        "user-1",
        1,
        3,
        expectedDateString,
        expect.any(Number),
        expect.any(Number),
        expect.any(String)
      );
    });
  });
});
