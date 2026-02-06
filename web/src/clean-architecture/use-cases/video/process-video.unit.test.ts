import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessVideoUseCase } from "./process-video.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IVideoInfoService } from "@/clean-architecture/domain/services/video-info.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { IVideoSummarizerService } from "@/clean-architecture/domain/services/video-summarizer.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

// Helper to create mock VideoEntity
function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
  return new VideoEntity(
    overrides.id ?? 1,
    overrides.userId ?? "user-1",
    overrides.title ?? "Test Video Title",
    overrides.url ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    overrides.channelName ?? "Test Channel",
    overrides.createdAt ?? new Date().toISOString()
  );
}

// Helper to create mock SummaryEntity
function createMockSummary(
  overrides: Partial<SummaryEntity> = {}
): SummaryEntity {
  return new SummaryEntity(
    overrides.id ?? 1,
    overrides.videoId ?? 1,
    overrides.content ?? "This is a test summary of the video content."
  );
}

// Helper to create mock StudySetEntity
function createMockStudySet(
  overrides: Partial<StudySetEntity> = {}
): StudySetEntity {
  return new StudySetEntity(
    overrides.id ?? 1,
    overrides.publicId ?? "study-set-public-id",
    overrides.userId ?? "user-1",
    overrides.name ?? "Test Video Title",
    overrides.description ?? null,
    overrides.sourceType ?? "video",
    overrides.videoId ?? 1,
    overrides.createdAt ?? new Date().toISOString(),
    overrides.updatedAt ?? new Date().toISOString()
  );
}

describe("ProcessVideoUseCase", () => {
  let useCase: ProcessVideoUseCase;
  let mockVideoRepo: IVideoRepository;
  let mockSummaryRepo: ISummaryRepository;
  let mockStudySetRepo: IStudySetRepository;
  let mockVideoInfoService: IVideoInfoService;
  let mockVideoTranscriptService: IVideoTranscriptService;
  let mockVideoSummarizerService: IVideoSummarizerService;

  const testVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const testUserId = "user-1";

  beforeEach(() => {
    // Create mock repositories
    mockVideoRepo = {
      createVideo: vi.fn(),
      findVideoById: vi.fn(),
      findVideoByUserIdAndUrl: vi.fn(),
      findVideosByUserId: vi.fn(),
      findVideosByIds: vi.fn(),
    };

    mockSummaryRepo = {
      createSummary: vi.fn(),
      findSummaryByVideoId: vi.fn(),
    };

    mockStudySetRepo = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };

    // Create mock services
    mockVideoInfoService = {
      get: vi.fn(),
    };

    mockVideoTranscriptService = {
      get: vi.fn(),
    };

    mockVideoSummarizerService = {
      generate: vi.fn(),
    };

    useCase = new ProcessVideoUseCase(
      mockVideoRepo,
      mockSummaryRepo,
      mockStudySetRepo,
      mockVideoInfoService,
      mockVideoTranscriptService,
      mockVideoSummarizerService
    );
  });

  describe("when video already exists", () => {
    it("returns existing video, summary, and study set without creating new ones", async () => {
      const existingVideo = createMockVideo({ id: 42, url: testVideoUrl });
      const existingSummary = createMockSummary({ videoId: 42 });
      const existingStudySet = createMockStudySet({ id: 10, videoId: 42 });

      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(
        existingVideo
      );
      vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(
        existingSummary
      );
      vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(
        existingStudySet
      );

      const result = await useCase.execute(testUserId, testVideoUrl);

      expect(result.alreadyExists).toBe(true);
      expect(result.video).toEqual(existingVideo);
      expect(result.summary).toEqual(existingSummary);
      expect(result.studySet).toEqual(existingStudySet);
      expect(mockVideoRepo.createVideo).not.toHaveBeenCalled();
      expect(mockSummaryRepo.createSummary).not.toHaveBeenCalled();
      expect(mockStudySetRepo.createStudySet).not.toHaveBeenCalled();
    });

    it("creates study set for legacy video without one", async () => {
      const existingVideo = createMockVideo({
        id: 42,
        url: testVideoUrl,
        title: "Legacy Video",
      });
      const existingSummary = createMockSummary({ videoId: 42 });
      const newStudySet = createMockStudySet({
        id: 10,
        videoId: 42,
        name: "Legacy Video",
      });

      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(
        existingVideo
      );
      vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(
        existingSummary
      );
      vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(null);
      vi.mocked(mockStudySetRepo.createStudySet).mockResolvedValue(newStudySet);

      const result = await useCase.execute(testUserId, testVideoUrl);

      expect(result.alreadyExists).toBe(true);
      expect(result.studySet).toEqual(newStudySet);
      expect(mockStudySetRepo.createStudySet).toHaveBeenCalledWith({
        userId: testUserId,
        name: "Legacy Video",
        description: null,
        sourceType: "video",
        videoId: 42,
      });
    });

    it("throws error if video exists but summary is missing", async () => {
      const existingVideo = createMockVideo({ id: 42, url: testVideoUrl });

      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(
        existingVideo
      );
      vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(null);

      await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
        "Video exists but summary not found"
      );
    });

    it("normalizes different URL formats to the same canonical URL", async () => {
      const existingVideo = createMockVideo({
        id: 42,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      });
      const existingSummary = createMockSummary({ videoId: 42 });
      const existingStudySet = createMockStudySet({ id: 10, videoId: 42 });

      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(
        existingVideo
      );
      vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(
        existingSummary
      );
      vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(
        existingStudySet
      );

      // Call with youtu.be URL with si parameter and timestamp
      const result = await useCase.execute(
        testUserId,
        "https://youtu.be/dQw4w9WgXcQ?si=abc&t=100"
      );

      // Should find existing video using normalized URL
      expect(mockVideoRepo.findVideoByUserIdAndUrl).toHaveBeenCalledWith(
        testUserId,
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      expect(result.alreadyExists).toBe(true);
    });
  });

  describe("when processing new video", () => {
    beforeEach(() => {
      // Set up default successful flow
      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(null);
      vi.mocked(mockVideoInfoService.get).mockResolvedValue({
        title: "Learn TypeScript",
        description: "A tutorial about TypeScript",
        channelName: "Code Channel",
      });
      vi.mocked(mockVideoTranscriptService.get).mockResolvedValue({
        fullText: "This is the full transcript text...",
        segments: [{ text: "segment 1", startTime: 0, endTime: 10 }],
      });
      vi.mocked(mockVideoSummarizerService.generate).mockResolvedValue({
        summary: "This is a summary of the TypeScript tutorial.",
      });
    });

    it("creates video, summary, and study set for new educational video", async () => {
      const newVideo = createMockVideo({
        id: 1,
        title: "Learn TypeScript",
        channelName: "Code Channel",
      });
      const newSummary = createMockSummary({
        videoId: 1,
        content: "This is a summary of the TypeScript tutorial.",
      });
      const newStudySet = createMockStudySet({
        id: 1,
        videoId: 1,
        name: "Learn TypeScript",
      });

      vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(newVideo);
      vi.mocked(mockSummaryRepo.createSummary).mockResolvedValue(newSummary);
      vi.mocked(mockStudySetRepo.createStudySet).mockResolvedValue(newStudySet);

      const result = await useCase.execute(testUserId, testVideoUrl);

      expect(result.alreadyExists).toBe(false);
      expect(result.video).toEqual(newVideo);
      expect(result.summary).toEqual(newSummary);
      expect(result.studySet).toEqual(newStudySet);

      // Verify video was created with correct parameters
      expect(mockVideoRepo.createVideo).toHaveBeenCalledWith(
        testUserId,
        "Learn TypeScript",
        testVideoUrl,
        "Code Channel"
      );

      // Verify study set was created
      expect(mockStudySetRepo.createStudySet).toHaveBeenCalledWith({
        userId: testUserId,
        name: "Learn TypeScript",
        description: null,
        sourceType: "video",
        videoId: 1,
      });

      // Verify summary was created
      expect(mockSummaryRepo.createSummary).toHaveBeenCalledWith(
        1,
        "This is a summary of the TypeScript tutorial."
      );

      // Verify transcript data is returned for background processing
      expect(result.transcriptData).toBeDefined();
      expect(result.transcriptData?.segments).toEqual([
        { text: "segment 1", startTime: 0, endTime: 10 },
      ]);
      expect(result.transcriptData?.fullText).toBe(
        "This is the full transcript text..."
      );
    });

    it("returns transcript data for background processing", async () => {
      const newVideo = createMockVideo({ id: 1 });
      const newSummary = createMockSummary({ videoId: 1 });
      const newStudySet = createMockStudySet({ id: 1, videoId: 1 });

      vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(newVideo);
      vi.mocked(mockSummaryRepo.createSummary).mockResolvedValue(newSummary);
      vi.mocked(mockStudySetRepo.createStudySet).mockResolvedValue(newStudySet);

      const result = await useCase.execute(testUserId, testVideoUrl);

      // Verify transcript data is returned (not stored by use case)
      expect(result.transcriptData).toBeDefined();
      expect(result.transcriptData?.segments).toEqual([
        { text: "segment 1", startTime: 0, endTime: 10 },
      ]);
      expect(result.transcriptData?.fullText).toBe(
        "This is the full transcript text..."
      );
    });
  });

  describe("error handling", () => {
    it("throws error for invalid YouTube URL", async () => {
      await expect(
        useCase.execute(testUserId, "https://invalid-url.com")
      ).rejects.toThrow("Invalid YouTube URL - could not extract video ID");
    });

    it("throws error when video info service fails", async () => {
      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(null);
      vi.mocked(mockVideoInfoService.get).mockResolvedValue(undefined);

      await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
        "Failed to fetch YouTube video data"
      );
    });

    it("throws error when transcript service fails", async () => {
      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(null);
      vi.mocked(mockVideoInfoService.get).mockResolvedValue({
        title: "Test",
        description: "Test",
        channelName: "Test",
      });
      vi.mocked(mockVideoTranscriptService.get).mockResolvedValue(null);

      await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
        "Failed to fetch video transcript - captions may be disabled"
      );
    });

    it("throws error when summary generation fails", async () => {
      vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(null);
      vi.mocked(mockVideoInfoService.get).mockResolvedValue({
        title: "Test",
        description: "Test",
        channelName: "Test",
      });
      vi.mocked(mockVideoTranscriptService.get).mockResolvedValue({
        fullText: "transcript",
        segments: [],
      });
      vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(createMockVideo());
      vi.mocked(mockStudySetRepo.createStudySet).mockResolvedValue(
        createMockStudySet()
      );
      vi.mocked(mockVideoSummarizerService.generate).mockResolvedValue(
        undefined
      );

      await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
        "Failed to generate video summary"
      );
    });
  });
});
