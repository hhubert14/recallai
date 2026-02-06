import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerateSuggestionsUseCase } from "./generate-suggestions.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ITranscriptResolverService } from "@/clean-architecture/domain/services/transcript-resolver.interface";
import { ISuggestionGeneratorService } from "@/clean-architecture/domain/services/suggestion-generator.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

// Helper to create mock StudySetEntity
function createMockStudySet(
  overrides: Partial<StudySetEntity> = {}
): StudySetEntity {
  return new StudySetEntity(
    overrides.id ?? 1,
    overrides.publicId ?? "study-set-public-id",
    overrides.userId ?? "user-1",
    overrides.name ?? "Test Study Set",
    overrides.description ?? null,
    overrides.sourceType ?? "video",
    overrides.videoId ?? 1,
    overrides.createdAt ?? new Date().toISOString(),
    overrides.updatedAt ?? new Date().toISOString()
  );
}

// Helper to create mock VideoEntity
function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
  return new VideoEntity(
    overrides.id ?? 1,
    overrides.userId ?? "user-1",
    overrides.title ?? "Test Video",
    overrides.url ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    overrides.channelName ?? "Test Channel",
    overrides.createdAt ?? new Date().toISOString()
  );
}

describe("GenerateSuggestionsUseCase", () => {
  let useCase: GenerateSuggestionsUseCase;
  let mockStudySetRepo: IStudySetRepository;
  let mockVideoRepo: IVideoRepository;
  let mockTranscriptResolverService: ITranscriptResolverService;
  let mockSuggestionGeneratorService: ISuggestionGeneratorService;

  const testUserId = "user-1";
  const testPublicId = "study-set-public-id";

  beforeEach(() => {
    mockStudySetRepo = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };

    mockVideoRepo = {
      createVideo: vi.fn(),
      findVideoById: vi.fn(),
      findVideoByUserIdAndUrl: vi.fn(),
      findVideosByUserId: vi.fn(),
      findVideosByIds: vi.fn(),
    };

    mockTranscriptResolverService = {
      getTranscript: vi.fn(),
    };

    mockSuggestionGeneratorService = {
      generate: vi.fn(),
    };

    useCase = new GenerateSuggestionsUseCase(
      mockStudySetRepo,
      mockVideoRepo,
      mockTranscriptResolverService,
      mockSuggestionGeneratorService
    );
  });

  describe("validation", () => {
    it("throws error when prompt is empty", async () => {
      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Prompt is required");
    });

    it("throws error when prompt is only whitespace", async () => {
      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "   ",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Prompt is required");
    });

    it("throws error when count is less than 1", async () => {
      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Generate flashcards about TypeScript",
          count: 0,
          itemType: "mix",
        })
      ).rejects.toThrow("Count must be between 1 and 100");
    });

    it("throws error when count is greater than 100", async () => {
      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Generate flashcards about TypeScript",
          count: 101,
          itemType: "mix",
        })
      ).rejects.toThrow("Count must be between 1 and 100");
    });

    it("accepts valid count values", async () => {
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        null
      );

      // Should fail at study set lookup, not count validation
      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 1,
          itemType: "mix",
        })
      ).rejects.toThrow("Study set not found");

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 50,
          itemType: "mix",
        })
      ).rejects.toThrow("Study set not found");

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 100,
          itemType: "mix",
        })
      ).rejects.toThrow("Study set not found");
    });
  });

  describe("authorization", () => {
    it("throws error when study set not found", async () => {
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        null
      );

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Study set not found");
    });

    it("throws error when user does not own the study set", async () => {
      const otherUsersStudySet = createMockStudySet({
        userId: "other-user",
      });
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        otherUsersStudySet
      );

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Not authorized to access this study set");
    });
  });

  describe("video-sourced study set", () => {
    beforeEach(() => {
      const videoSourcedStudySet = createMockStudySet({
        userId: testUserId,
        sourceType: "video",
        videoId: 1,
      });
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        videoSourcedStudySet
      );
      vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
        createMockVideo({ id: 1, title: "TypeScript Tutorial" })
      );
      vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
        fullText: "This is a transcript about TypeScript...",
        segments: [{ text: "segment", startTime: 0, endTime: 10 }],
      });
    });

    it("fetches transcript for video-sourced study set", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is TypeScript?",
            back: "A typed superset of JavaScript",
          },
        ],
      });

      await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "Key concepts",
        count: 5,
        itemType: "mix",
      });

      expect(mockTranscriptResolverService.getTranscript).toHaveBeenCalledWith(
        1,
        "dQw4w9WgXcQ"
      );
    });

    it("passes transcript to suggestion generator", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is TypeScript?",
            back: "A typed superset of JavaScript",
          },
        ],
      });

      await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "Key concepts",
        count: 5,
        itemType: "mix",
      });

      expect(mockSuggestionGeneratorService.generate).toHaveBeenCalledWith({
        prompt: "Key concepts",
        count: 5,
        itemType: "mix",
        title: "TypeScript Tutorial",
        transcript: "This is a transcript about TypeScript...",
      });
    });

    it("throws error when video not found for video-sourced study set", async () => {
      vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(null);

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Video not found for this study set");
    });

    it("throws error when video URL is invalid", async () => {
      vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
        createMockVideo({ url: "invalid-url" })
      );

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Invalid video URL - could not extract video ID");
    });
  });

  describe("manual study set", () => {
    beforeEach(() => {
      const manualStudySet = createMockStudySet({
        userId: testUserId,
        sourceType: "manual",
        videoId: null,
      });
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        manualStudySet
      );
    });

    it("does not fetch transcript for manual study set", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is JavaScript?",
            back: "A programming language",
          },
        ],
      });

      await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
      });

      expect(
        mockTranscriptResolverService.getTranscript
      ).not.toHaveBeenCalled();
      expect(mockVideoRepo.findVideoById).not.toHaveBeenCalled();
    });

    it("passes only prompt to suggestion generator without transcript", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is JavaScript?",
            back: "A programming language",
          },
        ],
      });

      await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
      });

      expect(mockSuggestionGeneratorService.generate).toHaveBeenCalledWith({
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
        title: undefined,
        transcript: undefined,
      });
    });
  });

  describe("successful generation", () => {
    beforeEach(() => {
      const studySet = createMockStudySet({
        userId: testUserId,
        sourceType: "manual",
        videoId: null,
      });
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        studySet
      );
    });

    it("returns flashcard suggestions with tempId", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is JavaScript?",
            back: "A programming language",
          },
          {
            tempId: "temp-2",
            itemType: "flashcard",
            front: "What is a function?",
            back: "A reusable block of code",
          },
        ],
      });

      const result = await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
      });

      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0]).toEqual({
        tempId: "temp-1",
        itemType: "flashcard",
        front: "What is JavaScript?",
        back: "A programming language",
      });
    });

    it("returns question suggestions with tempId", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "question",
            questionText: "What does JS stand for?",
            options: [
              {
                optionText: "JavaScript",
                isCorrect: true,
                explanation: "JS is short for JavaScript",
              },
              {
                optionText: "Java Script",
                isCorrect: false,
                explanation: "This is incorrect",
              },
              {
                optionText: "JustScript",
                isCorrect: false,
                explanation: "This is incorrect",
              },
              {
                optionText: "JavaSystem",
                isCorrect: false,
                explanation: "This is incorrect",
              },
            ],
          },
        ],
      });

      const result = await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
      });

      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].itemType).toBe("question");
      expect(result.suggestions[0]).toHaveProperty("questionText");
      expect(result.suggestions[0]).toHaveProperty("options");
    });

    it("returns mixed flashcard and question suggestions", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is JavaScript?",
            back: "A programming language",
          },
          {
            tempId: "temp-2",
            itemType: "question",
            questionText: "Which is a JS framework?",
            options: [
              { optionText: "React", isCorrect: true, explanation: "Correct" },
              { optionText: "Django", isCorrect: false, explanation: "Python" },
              { optionText: "Rails", isCorrect: false, explanation: "Ruby" },
              { optionText: "Laravel", isCorrect: false, explanation: "PHP" },
            ],
          },
        ],
      });

      const result = await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
      });

      expect(result.suggestions).toHaveLength(2);
      const types = result.suggestions.map((s) => s.itemType);
      expect(types).toContain("flashcard");
      expect(types).toContain("question");
    });

    it("passes itemType to suggestion generator service", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "question",
            questionText: "What is JS?",
            options: [
              {
                optionText: "JavaScript",
                isCorrect: true,
                explanation: "Correct",
              },
              { optionText: "Java", isCorrect: false, explanation: "Wrong" },
              { optionText: "JSON", isCorrect: false, explanation: "Wrong" },
              { optionText: "JSX", isCorrect: false, explanation: "Wrong" },
            ],
          },
        ],
      });

      await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript questions",
        count: 5,
        itemType: "questions",
      });

      expect(mockSuggestionGeneratorService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          itemType: "questions",
        })
      );
    });

    it("does NOT persist suggestions to database", async () => {
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [
          {
            tempId: "temp-1",
            itemType: "flashcard",
            front: "What is JavaScript?",
            back: "A programming language",
          },
        ],
      });

      await useCase.execute({
        studySetPublicId: testPublicId,
        userId: testUserId,
        prompt: "JavaScript basics",
        count: 5,
        itemType: "mix",
      });

      // Ensure no database writes occurred
      expect(mockStudySetRepo.createStudySet).not.toHaveBeenCalled();
      expect(mockStudySetRepo.updateStudySet).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      const videoSourcedStudySet = createMockStudySet({
        userId: testUserId,
        sourceType: "video",
        videoId: 1,
      });
      vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(
        videoSourcedStudySet
      );
      vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
        createMockVideo({ id: 1 })
      );
    });

    it("throws error when transcript fetch fails", async () => {
      vi.mocked(mockTranscriptResolverService.getTranscript).mockRejectedValue(
        new Error("Failed to fetch video transcript - captions may be disabled")
      );

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow(
        "Failed to fetch video transcript - captions may be disabled"
      );
    });

    it("throws error when suggestion generation fails", async () => {
      vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
        fullText: "transcript",
        segments: [],
      });
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue(
        undefined
      );

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Failed to generate suggestions");
    });

    it("throws error when suggestion generation returns empty array", async () => {
      vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
        fullText: "transcript",
        segments: [],
      });
      vi.mocked(mockSuggestionGeneratorService.generate).mockResolvedValue({
        suggestions: [],
      });

      await expect(
        useCase.execute({
          studySetPublicId: testPublicId,
          userId: testUserId,
          prompt: "Test prompt",
          count: 5,
          itemType: "mix",
        })
      ).rejects.toThrow("Failed to generate suggestions");
    });
  });
});
