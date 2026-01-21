import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuestionsForReviewUseCase } from "./get-questions-for-review.use-case";
import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";

function createMockProgress(
  overrides: Partial<ProgressEntity> = {}
): ProgressEntity {
  return new ProgressEntity(
    overrides.id ?? 1,
    overrides.userId ?? "user-1",
    overrides.questionId ?? 1,
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
  return new MultipleChoiceQuestionEntity(
    id,
    videoId,
    `Question ${id} text`,
    [
      new MultipleChoiceOption(id * 10 + 1, "Option A", true, "Explanation A"),
      new MultipleChoiceOption(id * 10 + 2, "Option B", false, "Explanation B"),
    ],
    null,
    null
  );
}

describe("GetQuestionsForReviewUseCase", () => {
  let useCase: GetQuestionsForReviewUseCase;
  let mockProgressRepo: IProgressRepository;
  let mockQuestionRepo: IQuestionRepository;

  beforeEach(() => {
    mockProgressRepo = {
      findProgressByUserId: vi.fn(),
      findProgressDueForReview: vi.fn(),
      findProgressByUserIdAndQuestionId: vi.fn(),
      createProgress: vi.fn(),
      createProgressBatch: vi.fn(),
      updateProgress: vi.fn(),
      getProgressStats: vi.fn(),
    };
    mockQuestionRepo = {
      createMultipleChoiceQuestion: vi.fn(),
      findQuestionById: vi.fn(),
      findQuestionsByVideoId: vi.fn(),
      findQuestionsByUserId: vi.fn(),
      findQuestionsByIds: vi.fn(),
      countQuestionsByVideoIds: vi.fn(),
    };
    useCase = new GetQuestionsForReviewUseCase(
      mockProgressRepo,
      mockQuestionRepo
    );
  });

  describe("due mode", () => {
    it("returns questions that are due for review with progress", async () => {
      const dueProgress = [
        createMockProgress({ id: 1, questionId: 1 }),
        createMockProgress({ id: 2, questionId: 2 }),
      ];
      const questions = [createMockQuestion(1), createMockQuestion(2)];

      vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue(
        dueProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(2);
      expect(result[0].progress).not.toBeNull();
      expect(result[0].progress?.boxLevel).toBe(1);
      expect(result[0].question.id).toBe(1);
    });

    it("returns empty array when no questions are due", async () => {
      vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue(
        []
      );

      const result = await useCase.execute("user-1", { mode: "due" });

      expect(result).toHaveLength(0);
    });

    it("respects limit parameter", async () => {
      const dueProgress = [
        createMockProgress({ id: 1, questionId: 1 }),
        createMockProgress({ id: 2, questionId: 2 }),
        createMockProgress({ id: 3, questionId: 3 }),
      ];
      const questions = [
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
      ];

      vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue(
        dueProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions.slice(0, 2)
      );

      const result = await useCase.execute("user-1", { mode: "due" }, 2);

      expect(result).toHaveLength(2);
    });

    it("prioritizes lower box levels (struggling questions) when limiting", async () => {
      const dueProgress = [
        createMockProgress({ id: 1, questionId: 1, boxLevel: 3 }),
        createMockProgress({ id: 2, questionId: 2, boxLevel: 1 }),
        createMockProgress({ id: 3, questionId: 3, boxLevel: 2 }),
      ];

      vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue(
        dueProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockImplementation(
        async (ids) => ids.map((id) => createMockQuestion(id))
      );

      const result = await useCase.execute("user-1", { mode: "due" }, 2);

      // Should prioritize box 1 and box 2 over box 3
      expect(result).toHaveLength(2);
      expect(result[0].progress?.boxLevel).toBe(1);
      expect(result[1].progress?.boxLevel).toBe(2);
    });
  });

  describe("new mode", () => {
    it("returns questions without progress records", async () => {
      // User has progress for question 1 only
      const allProgress = [createMockProgress({ id: 1, questionId: 1 })];
      // User has 3 total questions
      const allQuestions = [
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
      ];

      vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue(
        allProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue(
        allQuestions
      );

      const result = await useCase.execute("user-1", { mode: "new" });

      // Should return questions 2 and 3 (no progress)
      expect(result).toHaveLength(2);
      expect(result[0].question.id).toBe(2);
      expect(result[1].question.id).toBe(3);
      // Progress should be null for new questions
      expect(result[0].progress).toBeNull();
      expect(result[1].progress).toBeNull();
    });

    it("returns empty array when all questions have progress", async () => {
      const allProgress = [
        createMockProgress({ id: 1, questionId: 1 }),
        createMockProgress({ id: 2, questionId: 2 }),
      ];
      const allQuestions = [createMockQuestion(1), createMockQuestion(2)];

      vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue(
        allProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue(
        allQuestions
      );

      const result = await useCase.execute("user-1", { mode: "new" });

      expect(result).toHaveLength(0);
    });

    it("respects limit parameter", async () => {
      vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue([
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
        createMockQuestion(4),
        createMockQuestion(5),
      ]);

      const result = await useCase.execute("user-1", { mode: "new" }, 3);

      expect(result).toHaveLength(3);
    });
  });

  describe("random mode", () => {
    it("returns questions regardless of progress state", async () => {
      const allProgress = [createMockProgress({ id: 1, questionId: 1 })];
      const allQuestions = [
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
      ];

      vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue(
        allProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue(
        allQuestions
      );

      const result = await useCase.execute("user-1", { mode: "random" });

      // Should return all 3 questions
      expect(result).toHaveLength(3);
      // Question 1 has progress, questions 2 and 3 don't
      const q1 = result.find((r) => r.question.id === 1);
      const q2 = result.find((r) => r.question.id === 2);
      expect(q1?.progress).not.toBeNull();
      expect(q2?.progress).toBeNull();
    });

    it("respects limit parameter", async () => {
      vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue([
        createMockQuestion(1),
        createMockQuestion(2),
        createMockQuestion(3),
        createMockQuestion(4),
        createMockQuestion(5),
      ]);

      const result = await useCase.execute("user-1", { mode: "random" }, 3);

      expect(result).toHaveLength(3);
    });

    it("returns empty array when user has no questions", async () => {
      vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue([]);
      vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue([]);

      const result = await useCase.execute("user-1", { mode: "random" });

      expect(result).toHaveLength(0);
    });
  });

  describe("backward compatibility", () => {
    it("defaults to due mode when no params provided", async () => {
      const dueProgress = [createMockProgress({ id: 1, questionId: 1 })];
      const questions = [createMockQuestion(1)];

      vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue(
        dueProgress
      );
      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );

      const result = await useCase.execute("user-1");

      expect(mockProgressRepo.findProgressDueForReview).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
