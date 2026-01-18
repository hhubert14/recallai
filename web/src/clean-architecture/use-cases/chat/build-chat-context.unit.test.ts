import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuildChatContextUseCase } from "./build-chat-context.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { ITranscriptWindowRepository } from "@/clean-architecture/domain/repositories/transcript-window.repository.interface";
import { IEmbeddingService } from "@/clean-architecture/domain/services/embedding.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { TranscriptWindowEntity } from "@/clean-architecture/domain/entities/transcript-window.entity";

// Helper to create mock VideoEntity
function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
    return new VideoEntity(
        overrides.id ?? 1,
        overrides.userId ?? "user-1",
        overrides.title ?? "Test Video",
        overrides.url ?? "https://www.youtube.com/watch?v=test123",
        overrides.channelName ?? "Test Channel",
        overrides.createdAt ?? new Date().toISOString()
    );
}

// Helper to create mock SummaryEntity
function createMockSummary(overrides: Partial<SummaryEntity> = {}): SummaryEntity {
    return new SummaryEntity(
        overrides.id ?? 1,
        overrides.videoId ?? 1,
        overrides.content ?? "This is a test video summary about programming."
    );
}

// Helper to create mock TranscriptWindowEntity
function createMockWindow(
    id: number,
    text: string,
    startTime: number
): TranscriptWindowEntity {
    return new TranscriptWindowEntity(
        id,
        1,
        0,
        startTime,
        startTime + 20,
        text,
        [0.1, 0.2, 0.3],
        new Date().toISOString()
    );
}

describe("BuildChatContextUseCase", () => {
    let useCase: BuildChatContextUseCase;
    let mockVideoRepo: IVideoRepository;
    let mockSummaryRepo: ISummaryRepository;
    let mockTranscriptWindowRepo: ITranscriptWindowRepository;
    let mockEmbeddingService: IEmbeddingService;

    const testUserId = "user-1";
    const testVideoId = 1;
    const testMessage = "What is this video about?";

    beforeEach(() => {
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

        mockTranscriptWindowRepo = {
            createWindowsBatch: vi.fn(),
            findWindowsByVideoId: vi.fn(),
            findMostSimilarWindow: vi.fn(),
            findTopKSimilarWindows: vi.fn(),
            deleteWindowsByVideoId: vi.fn(),
        };

        mockEmbeddingService = {
            embed: vi.fn(),
            embedBatch: vi.fn(),
        };

        useCase = new BuildChatContextUseCase(
            mockVideoRepo,
            mockSummaryRepo,
            mockTranscriptWindowRepo,
            mockEmbeddingService
        );
    });

    describe("execute", () => {
        describe("authorization", () => {
            it("throws error when video not found", async () => {
                vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(null);

                await expect(
                    useCase.execute(testUserId, testVideoId, testMessage)
                ).rejects.toThrow("Video not found");
            });

            it("throws error when user does not own the video", async () => {
                const otherUsersVideo = createMockVideo({ userId: "other-user" });
                vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(otherUsersVideo);

                // Returns generic "Video not found" to avoid leaking info about other users' videos
                await expect(
                    useCase.execute(testUserId, testVideoId, testMessage)
                ).rejects.toThrow("Video not found");
            });
        });

        describe("summary validation", () => {
            it("throws error when summary not found", async () => {
                vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                    createMockVideo({ userId: testUserId })
                );
                vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(null);

                await expect(
                    useCase.execute(testUserId, testVideoId, testMessage)
                ).rejects.toThrow("Video summary not found");
            });
        });

        describe("context building", () => {
            beforeEach(() => {
                vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                    createMockVideo({ userId: testUserId, title: "TypeScript Tutorial" })
                );
                vi.mocked(mockSummaryRepo.findSummaryByVideoId).mockResolvedValue(
                    createMockSummary({ content: "A comprehensive TypeScript guide." })
                );
            });

            it("returns context with video title and summary", async () => {
                vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
                vi.mocked(mockTranscriptWindowRepo.findTopKSimilarWindows).mockResolvedValue([]);

                const context = await useCase.execute(testUserId, testVideoId, testMessage);

                expect(context.videoTitle).toBe("TypeScript Tutorial");
                expect(context.summary).toBe("A comprehensive TypeScript guide.");
            });

            it("returns context with relevant transcript windows", async () => {
                vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
                vi.mocked(mockTranscriptWindowRepo.findTopKSimilarWindows).mockResolvedValue([
                    {
                        window: createMockWindow(1, "TypeScript is a typed superset of JavaScript", 0),
                        similarity: 0.95,
                    },
                    {
                        window: createMockWindow(2, "It compiles to plain JavaScript", 20),
                        similarity: 0.90,
                    },
                ]);

                const context = await useCase.execute(testUserId, testVideoId, testMessage);

                expect(context.relevantTranscriptWindows).toHaveLength(2);
                expect(context.relevantTranscriptWindows[0]).toBe(
                    "TypeScript is a typed superset of JavaScript"
                );
                expect(context.relevantTranscriptWindows[1]).toBe(
                    "It compiles to plain JavaScript"
                );
            });

            it("returns empty transcript windows when embedding fails", async () => {
                vi.mocked(mockEmbeddingService.embed).mockRejectedValue(
                    new Error("Embedding service error")
                );

                const context = await useCase.execute(testUserId, testVideoId, testMessage);

                expect(context.relevantTranscriptWindows).toHaveLength(0);
            });

            it("embeds the user message for similarity search", async () => {
                vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
                vi.mocked(mockTranscriptWindowRepo.findTopKSimilarWindows).mockResolvedValue([]);

                await useCase.execute(testUserId, testVideoId, testMessage);

                expect(mockEmbeddingService.embed).toHaveBeenCalledWith(testMessage);
            });

            it("searches for top 3 similar windows", async () => {
                vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
                vi.mocked(mockTranscriptWindowRepo.findTopKSimilarWindows).mockResolvedValue([]);

                await useCase.execute(testUserId, testVideoId, testMessage);

                expect(mockTranscriptWindowRepo.findTopKSimilarWindows).toHaveBeenCalledWith(
                    testVideoId,
                    [0.1, 0.2, 0.3],
                    3
                );
            });

            it("filters out transcript windows below similarity threshold", async () => {
                vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
                vi.mocked(mockTranscriptWindowRepo.findTopKSimilarWindows).mockResolvedValue([
                    {
                        window: createMockWindow(1, "High similarity window", 0),
                        similarity: 0.8,
                    },
                    {
                        window: createMockWindow(2, "Low similarity window", 20),
                        similarity: 0.3, // Below threshold
                    },
                ]);

                const context = await useCase.execute(testUserId, testVideoId, testMessage);

                expect(context.relevantTranscriptWindows).toHaveLength(1);
                expect(context.relevantTranscriptWindows[0]).toBe("High similarity window");
            });
        });
    });
});
