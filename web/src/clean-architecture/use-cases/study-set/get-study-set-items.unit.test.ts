import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetStudySetItemsUseCase } from "./get-study-set-items.use-case";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

describe("GetStudySetItemsUseCase", () => {
  let useCase: GetStudySetItemsUseCase;
  let mockReviewableItemRepo: IReviewableItemRepository;
  let mockFlashcardRepo: IFlashcardRepository;
  let mockQuestionRepo: IQuestionRepository;

  const studySetId = 1;
  const userId = "user-123";

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

    mockFlashcardRepo = {
      createFlashcards: vi.fn(),
      findFlashcardsByVideoId: vi.fn(),
      findFlashcardsByIds: vi.fn(),
      countFlashcardsByVideoIds: vi.fn(),
      findFlashcardById: vi.fn(),
      updateFlashcard: vi.fn(),
      deleteFlashcard: vi.fn(),
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

    useCase = new GetStudySetItemsUseCase(
      mockReviewableItemRepo,
      mockFlashcardRepo,
      mockQuestionRepo
    );
  });

  it("returns empty items array when study set has no items", async () => {
    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByStudySetId
    ).mockResolvedValue([]);

    const result = await useCase.execute(studySetId);

    expect(result).toEqual({ items: [] });
    expect(mockFlashcardRepo.findFlashcardsByIds).not.toHaveBeenCalled();
    expect(mockQuestionRepo.findQuestionsByIds).not.toHaveBeenCalled();
  });

  it("returns flashcards for a study set with only flashcards", async () => {
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "flashcard",
        null,
        100,
        null,
        studySetId,
        "2025-01-27"
      ),
      new ReviewableItemEntity(
        2,
        userId,
        "flashcard",
        null,
        101,
        null,
        studySetId,
        "2025-01-27"
      ),
    ];

    const flashcard1 = new FlashcardEntity(
      100,
      null,
      userId,
      "Front 1",
      "Back 1",
      "2025-01-27"
    );
    const flashcard2 = new FlashcardEntity(
      101,
      null,
      userId,
      "Front 2",
      "Back 2",
      "2025-01-27"
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByStudySetId
    ).mockResolvedValue(reviewableItems);
    vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
      flashcard1,
      flashcard2,
    ]);

    const result = await useCase.execute(studySetId);

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      itemType: "flashcard",
      flashcard: flashcard1,
    });
    expect(result.items[1]).toEqual({
      itemType: "flashcard",
      flashcard: flashcard2,
    });
    expect(mockFlashcardRepo.findFlashcardsByIds).toHaveBeenCalledWith([
      100, 101,
    ]);
    expect(mockQuestionRepo.findQuestionsByIds).not.toHaveBeenCalled();
  });

  it("returns questions for a study set with only questions", async () => {
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "question",
        200,
        null,
        null,
        studySetId,
        "2025-01-27"
      ),
      new ReviewableItemEntity(
        2,
        userId,
        "question",
        201,
        null,
        null,
        studySetId,
        "2025-01-27"
      ),
    ];

    const question1 = new MultipleChoiceQuestionEntity(
      200,
      null,
      "Question 1?",
      [
        { id: 1, optionText: "A", isCorrect: true, explanation: null },
        { id: 2, optionText: "B", isCorrect: false, explanation: null },
      ]
    );
    const question2 = new MultipleChoiceQuestionEntity(
      201,
      null,
      "Question 2?",
      [
        { id: 3, optionText: "C", isCorrect: false, explanation: null },
        { id: 4, optionText: "D", isCorrect: true, explanation: null },
      ]
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByStudySetId
    ).mockResolvedValue(reviewableItems);
    vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
      question1,
      question2,
    ]);

    const result = await useCase.execute(studySetId);

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      itemType: "question",
      question: question1,
    });
    expect(result.items[1]).toEqual({
      itemType: "question",
      question: question2,
    });
    expect(mockFlashcardRepo.findFlashcardsByIds).not.toHaveBeenCalled();
    expect(mockQuestionRepo.findQuestionsByIds).toHaveBeenCalledWith([
      200, 201,
    ]);
  });

  it("returns items in reviewable_items order (preserves insertion order)", async () => {
    // Items were added in this order: flashcard, question, flashcard
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "flashcard",
        null,
        100,
        null,
        studySetId,
        "2025-01-27"
      ),
      new ReviewableItemEntity(
        2,
        userId,
        "question",
        200,
        null,
        null,
        studySetId,
        "2025-01-27"
      ),
      new ReviewableItemEntity(
        3,
        userId,
        "flashcard",
        null,
        101,
        null,
        studySetId,
        "2025-01-27"
      ),
    ];

    const flashcard1 = new FlashcardEntity(
      100,
      null,
      userId,
      "Front 1",
      "Back 1",
      "2025-01-27"
    );
    const flashcard2 = new FlashcardEntity(
      101,
      null,
      userId,
      "Front 2",
      "Back 2",
      "2025-01-27"
    );
    const question1 = new MultipleChoiceQuestionEntity(
      200,
      null,
      "Question 1?",
      [{ id: 1, optionText: "A", isCorrect: true, explanation: null }]
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByStudySetId
    ).mockResolvedValue(reviewableItems);
    // Note: repository might return in different order, but we should preserve reviewable_items order
    vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
      flashcard2,
      flashcard1,
    ]);
    vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([
      question1,
    ]);

    const result = await useCase.execute(studySetId);

    // Should be in insertion order: flashcard1, question1, flashcard2
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toEqual({
      itemType: "flashcard",
      flashcard: flashcard1,
    });
    expect(result.items[1]).toEqual({
      itemType: "question",
      question: question1,
    });
    expect(result.items[2]).toEqual({
      itemType: "flashcard",
      flashcard: flashcard2,
    });
  });

  it("works with video-sourced study sets (items have videoId)", async () => {
    const videoId = 42;
    const reviewableItems = [
      new ReviewableItemEntity(
        1,
        userId,
        "flashcard",
        null,
        100,
        videoId,
        studySetId,
        "2025-01-27"
      ),
    ];

    const flashcard = new FlashcardEntity(
      100,
      videoId,
      userId,
      "Front",
      "Back",
      "2025-01-27"
    );

    vi.mocked(
      mockReviewableItemRepo.findReviewableItemsByStudySetId
    ).mockResolvedValue(reviewableItems);
    vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([
      flashcard,
    ]);

    const result = await useCase.execute(studySetId);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({ itemType: "flashcard", flashcard });
    expect(
      (result.items[0] as { itemType: "flashcard"; flashcard: FlashcardEntity })
        .flashcard.videoId
    ).toBe(videoId);
  });
});
