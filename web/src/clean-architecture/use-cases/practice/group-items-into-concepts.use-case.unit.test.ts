import { describe, it, expect, vi, beforeEach } from "vitest";
import { GroupItemsIntoConceptsUseCase } from "./group-items-into-concepts.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IConceptGrouperService } from "@/clean-architecture/domain/services/concept-grouper.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

describe("GroupItemsIntoConceptsUseCase", () => {
  let useCase: GroupItemsIntoConceptsUseCase;
  let mockStudySetRepo: IStudySetRepository;
  let mockReviewableItemRepo: IReviewableItemRepository;
  let mockQuestionRepo: IQuestionRepository;
  let mockFlashcardRepo: IFlashcardRepository;
  let mockConceptGrouper: IConceptGrouperService;

  beforeEach(() => {
    mockStudySetRepo = {
      findStudySetByPublicId: vi.fn(),
    } as unknown as IStudySetRepository;

    mockReviewableItemRepo = {
      findReviewableItemsByUserIdAndStudySetId: vi.fn(),
    } as unknown as IReviewableItemRepository;

    mockQuestionRepo = {
      findQuestionsByIds: vi.fn(),
    } as unknown as IQuestionRepository;

    mockFlashcardRepo = {
      findFlashcardsByIds: vi.fn(),
    } as unknown as IFlashcardRepository;

    mockConceptGrouper = {
      groupConcepts: vi.fn(),
    } as unknown as IConceptGrouperService;

    useCase = new GroupItemsIntoConceptsUseCase(
      mockStudySetRepo,
      mockReviewableItemRepo,
      mockQuestionRepo,
      mockFlashcardRepo,
      mockConceptGrouper
    );
  });

  describe("validation", () => {
    it("throws error if study set not found", async () => {
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        null
      );

      await expect(
        useCase.execute("non-existent-id", "user-1")
      ).rejects.toThrow("Study set not found");
    });

    it("throws error if user does not own study set", async () => {
      const studySet = new StudySetEntity(
        1,
        "public-id",
        "owner-id",
        "Test Set",
        null,
        "manual",
        null,
        "2024-01-01",
        "2024-01-01"
      );

      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        studySet
      );

      await expect(useCase.execute("public-id", "different-user")).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("throws error if study set has fewer than 5 items", async () => {
      const studySet = new StudySetEntity(
        1,
        "public-id",
        "user-1",
        "Test Set",
        null,
        "manual",
        null,
        "2024-01-01",
        "2024-01-01"
      );

      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        studySet
      );

      const items = [
        new ReviewableItemEntity(
          1,
          "user-1",
          "question",
          1,
          null,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          2,
          "user-1",
          "flashcard",
          null,
          1,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          3,
          "user-1",
          "question",
          2,
          null,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          4,
          "user-1",
          "flashcard",
          null,
          2,
          null,
          1,
          "2024-01-01"
        ),
      ];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).mockResolvedValue(items);

      await expect(useCase.execute("public-id", "user-1")).rejects.toThrow(
        "Practice requires at least 5 items in your study set"
      );
    });
  });

  describe("successful execution", () => {
    it("groups items into concepts with questions and flashcards", async () => {
      const studySet = new StudySetEntity(
        1,
        "public-id",
        "user-1",
        "JavaScript Basics",
        null,
        "manual",
        null,
        "2024-01-01",
        "2024-01-01"
      );

      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        studySet
      );

      const reviewableItems = [
        new ReviewableItemEntity(
          1,
          "user-1",
          "question",
          1,
          null,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          2,
          "user-1",
          "question",
          2,
          null,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          3,
          "user-1",
          "flashcard",
          null,
          1,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          4,
          "user-1",
          "flashcard",
          null,
          2,
          null,
          1,
          "2024-01-01"
        ),
        new ReviewableItemEntity(
          5,
          "user-1",
          "question",
          3,
          null,
          null,
          1,
          "2024-01-01"
        ),
      ];

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).mockResolvedValue(reviewableItems);

      const questions = [
        new MultipleChoiceQuestionEntity(
          1,
          null,
          "What is a variable?",
          [
            { id: 1, optionText: "A container", isCorrect: true, explanation: null },
          ],
          null,
          null,
          "2024-01-01"
        ),
        new MultipleChoiceQuestionEntity(
          2,
          null,
          "What is a function?",
          [
            { id: 2, optionText: "Reusable code", isCorrect: true, explanation: null },
          ],
          null,
          null,
          "2024-01-01"
        ),
        new MultipleChoiceQuestionEntity(
          3,
          null,
          "What is an array?",
          [
            { id: 3, optionText: "A list", isCorrect: true, explanation: null },
          ],
          null,
          null,
          "2024-01-01"
        ),
      ];

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );

      const flashcards = [
        new FlashcardEntity(1, null, "user-1", "Variable", "Stores data", "2024-01-01"),
        new FlashcardEntity(2, null, "user-1", "Function", "Executes code", "2024-01-01"),
      ];

      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );

      const mockConcepts = [
        {
          conceptName: "Basic Syntax",
          description: "Variables and data storage",
          itemIds: ["q-1", "f-1"],
        },
        {
          conceptName: "Functions and Arrays",
          description: "Code organization and data structures",
          itemIds: ["q-2", "q-3", "f-2"],
        },
      ];

      vi.mocked(mockConceptGrouper.groupConcepts).mockResolvedValue(
        mockConcepts
      );

      const result = await useCase.execute("public-id", "user-1");

      expect(result).toEqual(mockConcepts);
      expect(mockConceptGrouper.groupConcepts).toHaveBeenCalledWith({
        items: expect.arrayContaining([
          expect.objectContaining({ id: "q-1", type: "question" }),
          expect.objectContaining({ id: "q-2", type: "question" }),
          expect.objectContaining({ id: "q-3", type: "question" }),
          expect.objectContaining({ id: "f-1", type: "flashcard" }),
          expect.objectContaining({ id: "f-2", type: "flashcard" }),
        ]),
        studySetTitle: "JavaScript Basics",
      });
    });

    it("handles study sets with only questions", async () => {
      const studySet = new StudySetEntity(
        1,
        "public-id",
        "user-1",
        "Quiz Practice",
        null,
        "manual",
        null,
        "2024-01-01",
        "2024-01-01"
      );

      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        studySet
      );

      const reviewableItems = Array.from({ length: 5 }, (_, i) =>
        new ReviewableItemEntity(
          i + 1,
          "user-1",
          "question",
          i + 1,
          null,
          null,
          1,
          "2024-01-01"
        )
      );

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).mockResolvedValue(reviewableItems);

      const questions = Array.from({ length: 5 }, (_, i) =>
        new MultipleChoiceQuestionEntity(
          i + 1,
          null,
          `Question ${i + 1}`,
          [{ id: i + 1, optionText: "Answer", isCorrect: true, explanation: null }],
          null,
          null,
          "2024-01-01"
        )
      );

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );

      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);

      const mockConcepts = [
        {
          conceptName: "Concept A",
          description: "Description A",
          itemIds: ["q-1", "q-2"],
        },
        {
          conceptName: "Concept B",
          description: "Description B",
          itemIds: ["q-3", "q-4", "q-5"],
        },
      ];

      vi.mocked(mockConceptGrouper.groupConcepts).mockResolvedValue(
        mockConcepts
      );

      const result = await useCase.execute("public-id", "user-1");

      expect(result).toEqual(mockConcepts);
      expect(mockFlashcardRepo.findFlashcardsByIds).toHaveBeenCalledWith([]);
    });

    it("handles study sets with only flashcards", async () => {
      const studySet = new StudySetEntity(
        1,
        "public-id",
        "user-1",
        "Vocabulary",
        null,
        "manual",
        null,
        "2024-01-01",
        "2024-01-01"
      );

      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        studySet
      );

      const reviewableItems = Array.from({ length: 5 }, (_, i) =>
        new ReviewableItemEntity(
          i + 1,
          "user-1",
          "flashcard",
          null,
          i + 1,
          null,
          1,
          "2024-01-01"
        )
      );

      vi.mocked(
        mockReviewableItemRepo.findReviewableItemsByUserIdAndStudySetId
      ).mockResolvedValue(reviewableItems);

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([]);

      const flashcards = Array.from({ length: 5 }, (_, i) =>
        new FlashcardEntity(
          i + 1,
          null,
          "user-1",
          `Front ${i + 1}`,
          `Back ${i + 1}`,
          "2024-01-01"
        )
      );

      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );

      const mockConcepts = [
        {
          conceptName: "Concept A",
          description: "Description A",
          itemIds: ["f-1", "f-2", "f-3"],
        },
        {
          conceptName: "Concept B",
          description: "Description B",
          itemIds: ["f-4", "f-5"],
        },
      ];

      vi.mocked(mockConceptGrouper.groupConcepts).mockResolvedValue(
        mockConcepts
      );

      const result = await useCase.execute("public-id", "user-1");

      expect(result).toEqual(mockConcepts);
      expect(mockQuestionRepo.findQuestionsByIds).toHaveBeenCalledWith([]);
    });
  });
});
