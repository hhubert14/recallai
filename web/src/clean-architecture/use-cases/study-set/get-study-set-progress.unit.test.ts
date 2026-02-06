import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetStudySetProgressUseCase,
  TermProgress,
} from "./get-study-set-progress.use-case";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";

describe("GetStudySetProgressUseCase", () => {
  let useCase: GetStudySetProgressUseCase;
  let mockReviewableItemRepo: IReviewableItemRepository;
  let mockReviewProgressRepo: IReviewProgressRepository;

  const userId = "user-123";
  const studySetId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
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
    useCase = new GetStudySetProgressUseCase(
      mockReviewableItemRepo,
      mockReviewProgressRepo
    );
  });

  it("returns empty summary when study set has no items", async () => {
    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue([]);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue([]);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms).toEqual([]);
    expect(result.summary).toEqual({
      mastered: 0,
      learning: 0,
      notStarted: 0,
      total: 0,
    });
  });

  it("marks items without progress as not_started", async () => {
    const reviewableItem = new ReviewableItemEntity(
      1,
      userId,
      "question",
      10,
      null,
      null,
      studySetId,
      "2025-01-01"
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue([reviewableItem]);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue([]);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms).toHaveLength(1);
    expect(result.terms[0]).toEqual({
      itemType: "question",
      itemId: 10,
      masteryStatus: "not_started",
    });
    expect(result.summary.notStarted).toBe(1);
  });

  it("marks items with boxLevel 1-3 as learning", async () => {
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "question",
        10,
        null,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        2,
        userId,
        "flashcard",
        null,
        20,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        3,
        userId,
        "question",
        30,
        null,
        null,
        studySetId,
        "2025-01-01"
      ),
    ];

    const progressRecords = [
      new ReviewProgressEntity(
        1,
        userId,
        1,
        1,
        "2025-01-02",
        1,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
      new ReviewProgressEntity(
        2,
        userId,
        2,
        2,
        "2025-01-04",
        2,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
      new ReviewProgressEntity(
        3,
        userId,
        3,
        3,
        "2025-01-08",
        3,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
    ];

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue(reviewableItems);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue(progressRecords);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms).toHaveLength(3);
    expect(result.terms.every((t) => t.masteryStatus === "learning")).toBe(
      true
    );
    expect(result.summary.learning).toBe(3);
  });

  it("marks items with boxLevel 5 as mastered", async () => {
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "question",
        10,
        null,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        2,
        userId,
        "flashcard",
        null,
        20,
        null,
        studySetId,
        "2025-01-01"
      ),
    ];

    const progressRecords = [
      new ReviewProgressEntity(
        1,
        userId,
        1,
        5,
        "2025-01-31",
        5,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
      new ReviewProgressEntity(
        2,
        userId,
        2,
        5,
        "2025-01-31",
        5,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
    ];

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue(reviewableItems);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue(progressRecords);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms).toHaveLength(2);
    expect(result.terms.every((t) => t.masteryStatus === "mastered")).toBe(
      true
    );
    expect(result.summary.mastered).toBe(2);
  });

  it("correctly calculates summary counts with mixed mastery levels", async () => {
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "question",
        10,
        null,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        2,
        userId,
        "flashcard",
        null,
        20,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        3,
        userId,
        "question",
        30,
        null,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        4,
        userId,
        "flashcard",
        null,
        40,
        null,
        studySetId,
        "2025-01-01"
      ),
      new ReviewableItemEntity(
        5,
        userId,
        "question",
        50,
        null,
        null,
        studySetId,
        "2025-01-01"
      ),
    ];

    // Item 1: mastered (box 5)
    // Item 2: learning (box 2)
    // Item 3: no progress (not_started)
    // Item 4: learning (box 4) - only box 5 is mastered
    // Item 5: learning (box 1)
    const progressRecords = [
      new ReviewProgressEntity(
        1,
        userId,
        1,
        5,
        "2025-01-31",
        5,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
      new ReviewProgressEntity(
        2,
        userId,
        2,
        2,
        "2025-01-04",
        2,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
      new ReviewProgressEntity(
        4,
        userId,
        4,
        4,
        "2025-01-15",
        4,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
      new ReviewProgressEntity(
        5,
        userId,
        5,
        1,
        "2025-01-02",
        1,
        0,
        "2025-01-01",
        "2025-01-01"
      ),
    ];

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue(reviewableItems);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue(progressRecords);

    const result = await useCase.execute(userId, studySetId);

    expect(result.summary).toEqual({
      mastered: 1,
      learning: 3,
      notStarted: 1,
      total: 5,
    });
  });

  it("marks boxLevel 4 as learning", async () => {
    const reviewableItem = new ReviewableItemEntity(
      1,
      userId,
      "question",
      10,
      null,
      null,
      studySetId,
      "2025-01-01"
    );

    const progressRecord = new ReviewProgressEntity(
      1,
      userId,
      1,
      4,
      "2025-01-15",
      4,
      0,
      "2025-01-01",
      "2025-01-01"
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue([reviewableItem]);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue([progressRecord]);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms[0].masteryStatus).toBe("learning");
    expect(result.summary.learning).toBe(1);
  });

  it("correctly maps question items to their itemId", async () => {
    const reviewableItem = new ReviewableItemEntity(
      1,
      userId,
      "question",
      42,
      null,
      null,
      studySetId,
      "2025-01-01"
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue([reviewableItem]);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue([]);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms[0]).toEqual({
      itemType: "question",
      itemId: 42,
      masteryStatus: "not_started",
    });
  });

  it("correctly maps flashcard items to their itemId", async () => {
    const reviewableItem = new ReviewableItemEntity(
      1,
      userId,
      "flashcard",
      null,
      99,
      null,
      studySetId,
      "2025-01-01"
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
    ).mockResolvedValue([reviewableItem]);
    vi.mocked(
      mockReviewProgressRepo.findReviewProgressByReviewableItemIds
    ).mockResolvedValue([]);

    const result = await useCase.execute(userId, studySetId);

    expect(result.terms[0]).toEqual({
      itemType: "flashcard",
      itemId: 99,
      masteryStatus: "not_started",
    });
  });
});
