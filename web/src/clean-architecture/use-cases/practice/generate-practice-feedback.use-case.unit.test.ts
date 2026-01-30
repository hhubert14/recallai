import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeneratePracticeFeedbackUseCase } from "./generate-practice-feedback.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IFeedbackGeneratorService } from "@/clean-architecture/domain/services/feedback-generator.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

describe("GeneratePracticeFeedbackUseCase", () => {
  let useCase: GeneratePracticeFeedbackUseCase;
  let mockStudySetRepo: IStudySetRepository;
  let mockFeedbackGenerator: IFeedbackGeneratorService;

  beforeEach(() => {
    mockStudySetRepo = {
      findStudySetByPublicId: vi.fn(),
    } as unknown as IStudySetRepository;

    mockFeedbackGenerator = {
      generateFeedback: vi.fn(),
    } as unknown as IFeedbackGeneratorService;

    useCase = new GeneratePracticeFeedbackUseCase(
      mockStudySetRepo,
      mockFeedbackGenerator
    );
  });

  describe("validation", () => {
    it("throws error if study set not found", async () => {
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        null
      );

      await expect(
        useCase.execute("non-existent-id", "user-1", "Test Concept", [
          { role: "user", content: "Explanation" },
        ])
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
        useCase.execute("public-id", "different-user", "Test Concept", [
          { role: "user", content: "Explanation" },
        ])
      ).rejects.toThrow("Unauthorized");
    });

    it("throws error if conversation history is empty", async () => {
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

      await expect(
        useCase.execute("public-id", "user-1", "Test Concept", [])
      ).rejects.toThrow("Conversation history cannot be empty");
    });
  });

  describe("successful execution", () => {
    it("generates feedback for a practice session", async () => {
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

      const conversationHistory = [
        {
          role: "user" as const,
          content: "A variable is like a container that stores data.",
        },
        {
          role: "assistant" as const,
          content: "Can you give me an example?",
        },
        {
          role: "user" as const,
          content: "Sure! let x = 5; creates a variable called x that stores the number 5.",
        },
      ];

      const mockFeedback =
        "Great job explaining variables with a clear analogy! Your example was specific and accurate. Consider explaining why variables are useful in programming.";

      vi.mocked(mockFeedbackGenerator.generateFeedback).mockResolvedValue(
        mockFeedback
      );

      const result = await useCase.execute(
        "public-id",
        "user-1",
        "Variables",
        conversationHistory
      );

      expect(result).toBe(mockFeedback);
      expect(mockFeedbackGenerator.generateFeedback).toHaveBeenCalledWith({
        conceptName: "Variables",
        conversationHistory,
      });
    });

    it("passes through feedback from service", async () => {
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

      const conversationHistory = [
        { role: "user" as const, content: "Short explanation" },
      ];

      const mockFeedback = "Try to provide more detailed explanations.";

      vi.mocked(mockFeedbackGenerator.generateFeedback).mockResolvedValue(
        mockFeedback
      );

      const result = await useCase.execute(
        "public-id",
        "user-1",
        "Concept",
        conversationHistory
      );

      expect(result).toBe(mockFeedback);
    });
  });
});
