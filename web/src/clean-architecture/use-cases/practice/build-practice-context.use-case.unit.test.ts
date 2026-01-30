import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuildPracticeContextUseCase } from "./build-practice-context.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

describe("BuildPracticeContextUseCase", () => {
  let useCase: BuildPracticeContextUseCase;
  let mockStudySetRepo: IStudySetRepository;
  let mockQuestionRepo: IQuestionRepository;
  let mockFlashcardRepo: IFlashcardRepository;

  beforeEach(() => {
    mockStudySetRepo = {
      findStudySetByPublicId: vi.fn(),
    } as unknown as IStudySetRepository;

    mockQuestionRepo = {
      findQuestionsByIds: vi.fn(),
    } as unknown as IQuestionRepository;

    mockFlashcardRepo = {
      findFlashcardsByIds: vi.fn(),
    } as unknown as IFlashcardRepository;

    useCase = new BuildPracticeContextUseCase(
      mockStudySetRepo,
      mockQuestionRepo,
      mockFlashcardRepo
    );
  });

  describe("validation", () => {
    it("throws error if study set not found", async () => {
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        null
      );

      await expect(
        useCase.execute("non-existent-id", "user-1", {
          conceptName: "Test",
          description: "Test desc",
          itemIds: ["q-1"],
        })
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

      await expect(
        useCase.execute("public-id", "different-user", {
          conceptName: "Test",
          description: "Test desc",
          itemIds: ["q-1"],
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("successful execution", () => {
    it("builds context with questions and flashcards", async () => {
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

      const questions = [
        new MultipleChoiceQuestionEntity(
          1,
          null,
          "What is a variable?",
          [],
          null,
          null,
          "2024-01-01"
        ),
        new MultipleChoiceQuestionEntity(
          2,
          null,
          "What is a function?",
          [],
          null,
          null,
          "2024-01-01"
        ),
      ];

      const flashcards = [
        new FlashcardEntity(
          1,
          null,
          "user-1",
          "Variable",
          "Stores data",
          "2024-01-01"
        ),
      ];

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );

      const result = await useCase.execute("public-id", "user-1", {
        conceptName: "Basic Syntax",
        description: "Variables and functions",
        itemIds: ["q-1", "q-2", "f-1"],
      });

      expect(result).toEqual({
        conceptName: "Basic Syntax",
        conceptDescription: "Variables and functions",
        relatedItems: [
          "What is a variable?",
          "What is a function?",
          "Variable | Stores data",
        ],
      });

      expect(mockQuestionRepo.findQuestionsByIds).toHaveBeenCalledWith([1, 2]);
      expect(mockFlashcardRepo.findFlashcardsByIds).toHaveBeenCalledWith([1]);
    });

    it("builds context with only questions", async () => {
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

      const questions = [
        new MultipleChoiceQuestionEntity(
          5,
          null,
          "Question 1",
          [],
          null,
          null,
          "2024-01-01"
        ),
        new MultipleChoiceQuestionEntity(
          10,
          null,
          "Question 2",
          [],
          null,
          null,
          "2024-01-01"
        ),
      ];

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);

      const result = await useCase.execute("public-id", "user-1", {
        conceptName: "Questions Only",
        description: "Testing questions",
        itemIds: ["q-5", "q-10"],
      });

      expect(result).toEqual({
        conceptName: "Questions Only",
        conceptDescription: "Testing questions",
        relatedItems: ["Question 1", "Question 2"],
      });

      expect(mockFlashcardRepo.findFlashcardsByIds).toHaveBeenCalledWith([]);
    });

    it("builds context with only flashcards", async () => {
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

      const flashcards = [
        new FlashcardEntity(
          3,
          null,
          "user-1",
          "Front 1",
          "Back 1",
          "2024-01-01"
        ),
        new FlashcardEntity(
          7,
          null,
          "user-1",
          "Front 2",
          "Back 2",
          "2024-01-01"
        ),
      ];

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue([]);
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue(
        flashcards
      );

      const result = await useCase.execute("public-id", "user-1", {
        conceptName: "Flashcards Only",
        description: "Testing flashcards",
        itemIds: ["f-3", "f-7"],
      });

      expect(result).toEqual({
        conceptName: "Flashcards Only",
        conceptDescription: "Testing flashcards",
        relatedItems: ["Front 1 | Back 1", "Front 2 | Back 2"],
      });

      expect(mockQuestionRepo.findQuestionsByIds).toHaveBeenCalledWith([]);
    });

    it("handles item IDs that don't exist gracefully", async () => {
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

      // Request IDs 1 and 2, but only 1 exists
      const questions = [
        new MultipleChoiceQuestionEntity(
          1,
          null,
          "Question 1",
          [],
          null,
          null,
          "2024-01-01"
        ),
      ];

      vi.mocked(mockQuestionRepo.findQuestionsByIds).mockResolvedValue(
        questions
      );
      vi.mocked(mockFlashcardRepo.findFlashcardsByIds).mockResolvedValue([]);

      const result = await useCase.execute("public-id", "user-1", {
        conceptName: "Test",
        description: "Test desc",
        itemIds: ["q-1", "q-2"], // q-2 doesn't exist
      });

      expect(result.relatedItems).toEqual(["Question 1"]);
    });
  });
});
