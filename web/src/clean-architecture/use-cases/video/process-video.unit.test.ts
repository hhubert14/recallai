import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessVideoUseCase } from "./process-video.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { ITranscriptRepository } from "@/clean-architecture/domain/repositories/transcript.repository.interface";
import { IVideoInfoService } from "@/clean-architecture/domain/services/video-info.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { IVideoClassifierService } from "@/clean-architecture/domain/services/video-classifier.interface";
import { IVideoSummarizerService } from "@/clean-architecture/domain/services/video-summarizer.interface";
import { ITranscriptWindowGeneratorService } from "@/clean-architecture/domain/services/transcript-window-generator.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";

// Helper to create mock VideoEntity
function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
    return new VideoEntity(
        overrides.id ?? 1,
        overrides.userId ?? "user-1",
        overrides.title ?? "Test Video Title",
        overrides.url ?? "https://www.youtube.com/watch?v=test123",
        overrides.channelName ?? "Test Channel",
        overrides.createdAt ?? new Date().toISOString(),
    );
}

// Helper to create mock SummaryEntity
function createMockSummary(overrides: Partial<SummaryEntity> = {}): SummaryEntity {
    return new SummaryEntity(
        overrides.id ?? 1,
        overrides.videoId ?? 1,
        overrides.content ?? "This is a test summary of the video content.",
    );
}

describe("ProcessVideoUseCase", () => {
    let useCase: ProcessVideoUseCase;
    let mockVideoRepo: IVideoRepository;
    let mockSummaryRepo: ISummaryRepository;
    let mockTranscriptRepo: ITranscriptRepository;
    let mockVideoInfoService: IVideoInfoService;
    let mockVideoTranscriptService: IVideoTranscriptService;
    let mockVideoClassifierService: IVideoClassifierService;
    let mockVideoSummarizerService: IVideoSummarizerService;
    let mockTranscriptWindowGeneratorService: ITranscriptWindowGeneratorService;

    const testVideoUrl = "https://www.youtube.com/watch?v=test123";
    const testUserId = "user-1";

    beforeEach(() => {
        // Create mock repositories
        mockVideoRepo = {
            createVideo: vi.fn(),
            findVideoById: vi.fn(),
            findVideoByUserIdAndUrl: vi.fn(),
            findVideosByUserId: vi.fn(),
        };

        mockSummaryRepo = {
            createSummary: vi.fn(),
            findSummaryByVideoId: vi.fn(),
        };

        mockTranscriptRepo = {
            createTranscript: vi.fn(),
            findTranscriptByVideoId: vi.fn(),
        };

        // Create mock services
        mockVideoInfoService = {
            get: vi.fn(),
        };

        mockVideoTranscriptService = {
            get: vi.fn(),
        };

        mockVideoClassifierService = {
            isEducational: vi.fn(),
        };

        mockVideoSummarizerService = {
            generate: vi.fn(),
        };

        mockTranscriptWindowGeneratorService = {
            generate: vi.fn(),
        };

        useCase = new ProcessVideoUseCase(
            mockVideoRepo,
            mockSummaryRepo,
            mockTranscriptRepo,
            mockVideoInfoService,
            mockVideoTranscriptService,
            mockVideoClassifierService,
            mockVideoSummarizerService,
            mockTranscriptWindowGeneratorService
        );
    });

    describe("when video already exists", () => {
        it("returns existing video and summary without creating new ones", async () => {
            const existingVideo = createMockVideo({ id: 42, url: testVideoUrl });
            const existingSummary = createMockSummary({ videoId: 42 });

            vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(existingVideo);
            vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(existingSummary);

            const result = await useCase.execute(testUserId, testVideoUrl);

            expect(result.alreadyExists).toBe(true);
            expect(result.video).toEqual(existingVideo);
            expect(result.summary).toEqual(existingSummary);
            expect(mockVideoRepo.createVideo).not.toHaveBeenCalled();
            expect(mockSummaryRepo.createSummary).not.toHaveBeenCalled();
        });

        it("throws error if video exists but summary is missing", async () => {
            const existingVideo = createMockVideo({ id: 42, url: testVideoUrl });

            vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(existingVideo);
            vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(null);

            await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
                "Video exists but summary not found"
            );
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
            vi.mocked(mockVideoClassifierService.isEducational).mockResolvedValue(true);
            vi.mocked(mockVideoSummarizerService.generate).mockResolvedValue({
                summary: "This is a summary of the TypeScript tutorial.",
            });
            vi.mocked(mockTranscriptWindowGeneratorService.generate).mockResolvedValue([]);
            vi.mocked(mockTranscriptRepo.createTranscript).mockResolvedValue({
                id: 1,
                videoId: 1,
                segments: [{ text: "segment 1", startTime: 0, endTime: 10 }],
                fullText: "This is the full transcript text...",
                createdAt: new Date().toISOString(),
            });
        });

        it("creates video and summary for new educational video", async () => {
            const newVideo = createMockVideo({
                id: 1,
                title: "Learn TypeScript",
                channelName: "Code Channel",
            });
            const newSummary = createMockSummary({
                videoId: 1,
                content: "This is a summary of the TypeScript tutorial.",
            });

            vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(newVideo);
            vi.mocked(mockSummaryRepo.createSummary).mockResolvedValue(newSummary);

            const result = await useCase.execute(testUserId, testVideoUrl);

            expect(result.alreadyExists).toBe(false);
            expect(result.video).toEqual(newVideo);
            expect(result.summary).toEqual(newSummary);

            // Verify video was created with correct parameters
            expect(mockVideoRepo.createVideo).toHaveBeenCalledWith(
                testUserId,
                "Learn TypeScript",
                testVideoUrl,
                "Code Channel"
            );

            // Verify summary was created
            expect(mockSummaryRepo.createSummary).toHaveBeenCalledWith(
                1,
                "This is a summary of the TypeScript tutorial."
            );
        });

        it("generates transcript windows after creating video", async () => {
            const newVideo = createMockVideo({ id: 1 });
            const newSummary = createMockSummary({ videoId: 1 });

            vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(newVideo);
            vi.mocked(mockSummaryRepo.createSummary).mockResolvedValue(newSummary);

            await useCase.execute(testUserId, testVideoUrl);

            expect(mockTranscriptWindowGeneratorService.generate).toHaveBeenCalledWith(
                1,
                [{ text: "segment 1", startTime: 0, endTime: 10 }]
            );
        });

        it("continues successfully even if transcript window generation fails", async () => {
            const newVideo = createMockVideo({ id: 1 });
            const newSummary = createMockSummary({ videoId: 1 });

            vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(newVideo);
            vi.mocked(mockSummaryRepo.createSummary).mockResolvedValue(newSummary);
            vi.mocked(mockTranscriptWindowGeneratorService.generate).mockRejectedValue(
                new Error("Window generation failed")
            );

            // Should not throw
            const result = await useCase.execute(testUserId, testVideoUrl);

            expect(result.video).toEqual(newVideo);
            expect(result.summary).toEqual(newSummary);
        });
    });

    describe("error handling", () => {
        it("throws error for invalid YouTube URL", async () => {
            await expect(useCase.execute(testUserId, "https://invalid-url.com")).rejects.toThrow(
                "Invalid YouTube URL - could not extract video ID"
            );
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

        it("throws error for non-educational video", async () => {
            vi.mocked(mockVideoRepo.findVideoByUserIdAndUrl).mockResolvedValue(null);
            vi.mocked(mockVideoInfoService.get).mockResolvedValue({
                title: "Funny Cat Video",
                description: "Just a cat video",
                channelName: "Cat Channel",
            });
            vi.mocked(mockVideoTranscriptService.get).mockResolvedValue({
                fullText: "meow meow",
                segments: [],
            });
            vi.mocked(mockVideoClassifierService.isEducational).mockResolvedValue(false);

            await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
                "Video does not appear to be educational content"
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
            vi.mocked(mockVideoClassifierService.isEducational).mockResolvedValue(true);
            vi.mocked(mockVideoRepo.createVideo).mockResolvedValue(createMockVideo());
            vi.mocked(mockVideoSummarizerService.generate).mockResolvedValue(undefined);

            await expect(useCase.execute(testUserId, testVideoUrl)).rejects.toThrow(
                "Failed to generate video summary"
            );
        });
    });
});
