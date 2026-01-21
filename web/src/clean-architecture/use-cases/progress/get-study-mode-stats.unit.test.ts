import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetStudyModeStatsUseCase } from "./get-study-mode-stats.use-case";
import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";
import { MultipleChoiceQuestionEntity, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";

function createMockProgress(overrides: Partial<ProgressEntity> = {}): ProgressEntity {
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

function createMockQuestion(id: number): MultipleChoiceQuestionEntity {
  return new MultipleChoiceQuestionEntity(
    id,
    1, // videoId
    "Question text",
    [new MultipleChoiceOption(1, "Option A", true, "Explanation")],
    null,
    null
  );
}

describe("GetStudyModeStatsUseCase", () => {
  let useCase: GetStudyModeStatsUseCase;
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
    useCase = new GetStudyModeStatsUseCase(mockProgressRepo, mockQuestionRepo);
  });

  it("returns correct due count from progress due for review", async () => {
    const dueProgress = [
      createMockProgress({ id: 1, questionId: 1 }),
      createMockProgress({ id: 2, questionId: 2 }),
      createMockProgress({ id: 3, questionId: 3 }),
    ];
    vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue(dueProgress);
    vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue(dueProgress);
    vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue([
      createMockQuestion(1),
      createMockQuestion(2),
      createMockQuestion(3),
    ]);

    const result = await useCase.execute("user-1");

    expect(result.dueCount).toBe(3);
  });

  it("returns correct new count (questions without progress)", async () => {
    // User has progress for questions 1 and 2
    const allProgress = [
      createMockProgress({ id: 1, questionId: 1 }),
      createMockProgress({ id: 2, questionId: 2 }),
    ];
    // User has 5 total questions
    const allQuestions = [
      createMockQuestion(1),
      createMockQuestion(2),
      createMockQuestion(3),
      createMockQuestion(4),
      createMockQuestion(5),
    ];

    vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue([]);
    vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue(allProgress);
    vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue(allQuestions);

    const result = await useCase.execute("user-1");

    // 5 questions - 2 with progress = 3 new
    expect(result.newCount).toBe(3);
  });

  it("returns correct total count (all questions for user)", async () => {
    vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue([]);
    vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue([]);
    vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue([
      createMockQuestion(1),
      createMockQuestion(2),
      createMockQuestion(3),
      createMockQuestion(4),
    ]);

    const result = await useCase.execute("user-1");

    expect(result.totalCount).toBe(4);
  });

  it("returns zero counts when user has no questions", async () => {
    vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue([]);
    vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue([]);
    vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue([]);

    const result = await useCase.execute("user-1");

    expect(result.dueCount).toBe(0);
    expect(result.newCount).toBe(0);
    expect(result.totalCount).toBe(0);
  });

  it("handles case where all questions have progress (no new questions)", async () => {
    const allProgress = [
      createMockProgress({ id: 1, questionId: 1 }),
      createMockProgress({ id: 2, questionId: 2 }),
    ];
    const allQuestions = [
      createMockQuestion(1),
      createMockQuestion(2),
    ];

    vi.mocked(mockProgressRepo.findProgressDueForReview).mockResolvedValue([]);
    vi.mocked(mockProgressRepo.findProgressByUserId).mockResolvedValue(allProgress);
    vi.mocked(mockQuestionRepo.findQuestionsByUserId).mockResolvedValue(allQuestions);

    const result = await useCase.execute("user-1");

    expect(result.newCount).toBe(0);
  });
});
