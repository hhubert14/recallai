import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  FindStudySetByVideoUrlUseCase,
  StudySetContentResult,
} from "./find-study-set-by-video-url.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

describe("FindStudySetByVideoUrlUseCase", () => {
  let useCase: FindStudySetByVideoUrlUseCase;
  let mockVideoRepository: IVideoRepository;
  let mockStudySetRepository: IStudySetRepository;
  let mockSummaryRepository: ISummaryRepository;
  let mockQuestionRepository: IQuestionRepository;
  let mockFlashcardRepository: IFlashcardRepository;

  // Test data
  const userId = "user-123";
  const videoUrl = "https://www.youtube.com/watch?v=abc123";

  const video = new VideoEntity(
    1,
    userId,
    "Test Video Title",
    videoUrl,
    "Test Channel",
    "2025-01-20T10:00:00Z"
  );

  const studySet = new StudySetEntity(
    1,
    "public-id-123",
    userId,
    "Test Video Title",
    null,
    "video",
    1,
    "2025-01-20T10:00:00Z",
    "2025-01-20T10:00:00Z"
  );

  const summary = new SummaryEntity(1, 1, "## Summary\nThis is the summary.");

  const questions = [
    new MultipleChoiceQuestionEntity(1, 1, "What is the main topic?", [
      new MultipleChoiceOption(1, "Option A", true, "This is correct"),
      new MultipleChoiceOption(2, "Option B", false, null),
      new MultipleChoiceOption(3, "Option C", false, null),
      new MultipleChoiceOption(4, "Option D", false, null),
    ], "Source quote", 120),
    new MultipleChoiceQuestionEntity(2, 1, "What was discussed?", [
      new MultipleChoiceOption(5, "Choice A", false, null),
      new MultipleChoiceOption(6, "Choice B", true, "Correct!"),
      new MultipleChoiceOption(7, "Choice C", false, null),
      new MultipleChoiceOption(8, "Choice D", false, null),
    ], null, null),
  ];

  const flashcards = [
    new FlashcardEntity(1, 1, userId, "Front 1", "Back 1", "2025-01-20T10:00:00Z"),
    new FlashcardEntity(2, 1, userId, "Front 2", "Back 2", "2025-01-20T10:00:00Z"),
  ];

  beforeEach(() => {
    mockVideoRepository = {
      createVideo: vi.fn(),
      findVideoById: vi.fn(),
      findVideoByUserIdAndUrl: vi.fn(),
      findVideosByUserId: vi.fn(),
      findVideosByIds: vi.fn(),
    };

    mockStudySetRepository = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };

    mockSummaryRepository = {
      createSummary: vi.fn(),
      findSummaryByVideoId: vi.fn(),
    };

    mockQuestionRepository = {
      createMultipleChoiceQuestion: vi.fn(),
      findQuestionById: vi.fn(),
      findQuestionsByVideoId: vi.fn(),
      findQuestionsByIds: vi.fn(),
      countQuestionsByVideoIds: vi.fn(),
      updateQuestion: vi.fn(),
    };

    mockFlashcardRepository = {
      createFlashcards: vi.fn(),
      findFlashcardsByVideoId: vi.fn(),
      findFlashcardsByIds: vi.fn(),
      countFlashcardsByVideoIds: vi.fn(),
      findFlashcardById: vi.fn(),
      updateFlashcard: vi.fn(),
    };

    useCase = new FindStudySetByVideoUrlUseCase(
      mockVideoRepository,
      mockStudySetRepository,
      mockSummaryRepository,
      mockQuestionRepository,
      mockFlashcardRepository
    );
  });

  describe("when video exists with all content", () => {
    beforeEach(() => {
      vi.mocked(mockVideoRepository.findVideoByUserIdAndUrl).mockResolvedValue(video);
      vi.mocked(mockStudySetRepository.findStudySetByVideoId).mockResolvedValue(studySet);
      vi.mocked(mockSummaryRepository.findSummaryByVideoId).mockResolvedValue(summary);
      vi.mocked(mockQuestionRepository.findQuestionsByVideoId).mockResolvedValue(questions);
      vi.mocked(mockFlashcardRepository.findFlashcardsByVideoId).mockResolvedValue(flashcards);
    });

    it("returns exists: true with all content", async () => {
      const result = await useCase.execute(userId, videoUrl);

      expect(result.exists).toBe(true);
      expect(result.studySet).toEqual(studySet);
      expect(result.video).toEqual(video);
      expect(result.summary).toEqual(summary);
      expect(result.questions).toEqual(questions);
      expect(result.flashcards).toEqual(flashcards);
    });

    it("queries video by user ID and URL", async () => {
      await useCase.execute(userId, videoUrl);

      expect(mockVideoRepository.findVideoByUserIdAndUrl).toHaveBeenCalledWith(
        userId,
        videoUrl
      );
    });

    it("queries study set by video ID", async () => {
      await useCase.execute(userId, videoUrl);

      expect(mockStudySetRepository.findStudySetByVideoId).toHaveBeenCalledWith(
        video.id
      );
    });

    it("queries content by video ID", async () => {
      await useCase.execute(userId, videoUrl);

      expect(mockSummaryRepository.findSummaryByVideoId).toHaveBeenCalledWith(video.id);
      expect(mockQuestionRepository.findQuestionsByVideoId).toHaveBeenCalledWith(video.id);
      expect(mockFlashcardRepository.findFlashcardsByVideoId).toHaveBeenCalledWith(video.id);
    });
  });

  describe("when video does not exist", () => {
    beforeEach(() => {
      vi.mocked(mockVideoRepository.findVideoByUserIdAndUrl).mockResolvedValue(null);
    });

    it("returns exists: false with null content", async () => {
      const result = await useCase.execute(userId, videoUrl);

      expect(result.exists).toBe(false);
      expect(result.studySet).toBeNull();
      expect(result.video).toBeNull();
      expect(result.summary).toBeNull();
      expect(result.questions).toEqual([]);
      expect(result.flashcards).toEqual([]);
    });

    it("does not query for content", async () => {
      await useCase.execute(userId, videoUrl);

      expect(mockStudySetRepository.findStudySetByVideoId).not.toHaveBeenCalled();
      expect(mockSummaryRepository.findSummaryByVideoId).not.toHaveBeenCalled();
      expect(mockQuestionRepository.findQuestionsByVideoId).not.toHaveBeenCalled();
      expect(mockFlashcardRepository.findFlashcardsByVideoId).not.toHaveBeenCalled();
    });
  });

  describe("when video exists but study set is missing", () => {
    beforeEach(() => {
      vi.mocked(mockVideoRepository.findVideoByUserIdAndUrl).mockResolvedValue(video);
      vi.mocked(mockStudySetRepository.findStudySetByVideoId).mockResolvedValue(null);
      vi.mocked(mockSummaryRepository.findSummaryByVideoId).mockResolvedValue(summary);
      vi.mocked(mockQuestionRepository.findQuestionsByVideoId).mockResolvedValue(questions);
      vi.mocked(mockFlashcardRepository.findFlashcardsByVideoId).mockResolvedValue(flashcards);
    });

    it("returns exists: true with null study set but other content", async () => {
      const result = await useCase.execute(userId, videoUrl);

      expect(result.exists).toBe(true);
      expect(result.studySet).toBeNull();
      expect(result.video).toEqual(video);
      expect(result.summary).toEqual(summary);
      expect(result.questions).toEqual(questions);
      expect(result.flashcards).toEqual(flashcards);
    });
  });

  describe("when video exists but summary is missing", () => {
    beforeEach(() => {
      vi.mocked(mockVideoRepository.findVideoByUserIdAndUrl).mockResolvedValue(video);
      vi.mocked(mockStudySetRepository.findStudySetByVideoId).mockResolvedValue(studySet);
      vi.mocked(mockSummaryRepository.findSummaryByVideoId).mockResolvedValue(null);
      vi.mocked(mockQuestionRepository.findQuestionsByVideoId).mockResolvedValue(questions);
      vi.mocked(mockFlashcardRepository.findFlashcardsByVideoId).mockResolvedValue(flashcards);
    });

    it("returns exists: true with null summary", async () => {
      const result = await useCase.execute(userId, videoUrl);

      expect(result.exists).toBe(true);
      expect(result.summary).toBeNull();
      expect(result.questions).toEqual(questions);
      expect(result.flashcards).toEqual(flashcards);
    });
  });

  describe("when video exists but has no questions or flashcards", () => {
    beforeEach(() => {
      vi.mocked(mockVideoRepository.findVideoByUserIdAndUrl).mockResolvedValue(video);
      vi.mocked(mockStudySetRepository.findStudySetByVideoId).mockResolvedValue(studySet);
      vi.mocked(mockSummaryRepository.findSummaryByVideoId).mockResolvedValue(summary);
      vi.mocked(mockQuestionRepository.findQuestionsByVideoId).mockResolvedValue([]);
      vi.mocked(mockFlashcardRepository.findFlashcardsByVideoId).mockResolvedValue([]);
    });

    it("returns exists: true with empty arrays", async () => {
      const result = await useCase.execute(userId, videoUrl);

      expect(result.exists).toBe(true);
      expect(result.questions).toEqual([]);
      expect(result.flashcards).toEqual([]);
    });
  });
});
