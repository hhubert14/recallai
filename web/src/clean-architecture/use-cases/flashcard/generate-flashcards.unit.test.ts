import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerateFlashcardsUseCase } from "./generate-flashcards.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { ITranscriptResolverService } from "@/clean-architecture/domain/services/transcript-resolver.interface";
import { IFlashcardGeneratorService } from "@/clean-architecture/domain/services/flashcard-generator.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

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

// Helper to create mock FlashcardEntity
function createMockFlashcard(
    overrides: Partial<{
        id: number;
        videoId: number;
        userId: string;
        front: string;
        back: string;
        createdAt: string;
    }> = {}
): FlashcardEntity {
    return new FlashcardEntity(
        overrides.id ?? 1,
        overrides.videoId ?? 1,
        overrides.userId ?? "user-1",
        overrides.front ?? "What is the main concept?",
        overrides.back ?? "The main concept is...",
        overrides.createdAt ?? new Date().toISOString()
    );
}

// Helper to create mock StudySetEntity
function createMockStudySet(overrides: Partial<StudySetEntity> = {}): StudySetEntity {
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

describe("GenerateFlashcardsUseCase", () => {
    let useCase: GenerateFlashcardsUseCase;
    let mockVideoRepo: IVideoRepository;
    let mockFlashcardRepo: IFlashcardRepository;
    let mockReviewableItemRepo: IReviewableItemRepository;
    let mockStudySetRepo: IStudySetRepository;
    let mockTranscriptResolverService: ITranscriptResolverService;
    let mockFlashcardGeneratorService: IFlashcardGeneratorService;

    const testUserId = "user-1";
    const testVideoId = 1;

    beforeEach(() => {
        mockVideoRepo = {
            createVideo: vi.fn(),
            findVideoById: vi.fn(),
            findVideoByUserIdAndUrl: vi.fn(),
            findVideosByUserId: vi.fn(),
            findVideosByIds: vi.fn(),
        };

        mockFlashcardRepo = {
            createFlashcards: vi.fn(),
            findFlashcardsByVideoId: vi.fn(),
            findFlashcardsByIds: vi.fn(),
            countFlashcardsByVideoIds: vi.fn(),
        };

        mockReviewableItemRepo = {
            createReviewableItemsForQuestionsBatch: vi.fn().mockResolvedValue([]),
            createReviewableItemsForFlashcardsBatch: vi.fn().mockResolvedValue([]),
            findReviewableItemsByUserId: vi.fn(),
            findReviewableItemsByUserIdAndVideoId: vi.fn(),
            findReviewableItemsByStudySetId: vi.fn(),
            findReviewableItemsByUserIdAndStudySetId: vi.fn(),
            findReviewableItemByQuestionId: vi.fn(),
            findReviewableItemByFlashcardId: vi.fn(),
            findReviewableItemById: vi.fn(),
            findReviewableItemsByIds: vi.fn(),
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

        mockTranscriptResolverService = {
            getTranscript: vi.fn(),
        };

        mockFlashcardGeneratorService = {
            generate: vi.fn(),
        };

        useCase = new GenerateFlashcardsUseCase(
            mockVideoRepo,
            mockFlashcardRepo,
            mockTranscriptResolverService,
            mockFlashcardGeneratorService,
            mockReviewableItemRepo,
            mockStudySetRepo
        );
    });

    describe("validation", () => {
        it("throws error for invalid count", async () => {
            await expect(useCase.execute(testUserId, testVideoId, 7)).rejects.toThrow(
                "Invalid count: 7. Must be one of: 5, 10, 20"
            );
        });

        it("accepts valid counts: 5, 10, 20", async () => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(null);

            // Should fail at video lookup, not count validation
            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Video not found"
            );
            await expect(useCase.execute(testUserId, testVideoId, 10)).rejects.toThrow(
                "Video not found"
            );
            await expect(useCase.execute(testUserId, testVideoId, 20)).rejects.toThrow(
                "Video not found"
            );
        });
    });

    describe("authorization", () => {
        it("throws error when video not found", async () => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(null);

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Video not found"
            );
        });

        it("throws error when user does not own the video", async () => {
            const otherUsersVideo = createMockVideo({ userId: "other-user" });
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(otherUsersVideo);

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Not authorized to access this video"
            );
        });
    });

    describe("flashcard cap enforcement", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId })
            );
        });

        it("throws error when max flashcards (20) already reached", async () => {
            const existingFlashcards = Array.from({ length: 20 }, (_, i) =>
                createMockFlashcard({ id: i + 1 })
            );
            vi.mocked(mockFlashcardRepo.findFlashcardsByVideoId).mockResolvedValue(
                existingFlashcards
            );

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Maximum flashcards reached (20). Delete some to generate more."
            );
        });

        it("throws error when requested count exceeds remaining capacity", async () => {
            const existingFlashcards = Array.from({ length: 18 }, (_, i) =>
                createMockFlashcard({ id: i + 1 })
            );
            vi.mocked(mockFlashcardRepo.findFlashcardsByVideoId).mockResolvedValue(
                existingFlashcards
            );

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Cannot generate 5 flashcards. Only 2 more allowed (18 of 20 max)."
            );
        });
    });

    describe("successful flashcard generation", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId, title: "TypeScript Tutorial" })
            );
            vi.mocked(mockFlashcardRepo.findFlashcardsByVideoId).mockResolvedValue([]);
            vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(
                createMockStudySet({ id: 10, videoId: testVideoId })
            );
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "This is the full transcript about TypeScript...",
                segments: [{ text: "segment", startTime: 0, endTime: 10 }],
            });
            vi.mocked(mockFlashcardGeneratorService.generate).mockResolvedValue({
                flashcards: [
                    { front: "What is TypeScript?", back: "A typed superset of JavaScript" },
                    { front: "What does TS compile to?", back: "JavaScript" },
                ],
            });
        });

        it("generates and saves flashcards with correct structure", async () => {
            const savedFlashcards = [
                createMockFlashcard({ id: 1, front: "What is TypeScript?", back: "A typed superset of JavaScript" }),
                createMockFlashcard({ id: 2, front: "What does TS compile to?", back: "JavaScript" }),
            ];
            vi.mocked(mockFlashcardRepo.createFlashcards).mockResolvedValue(savedFlashcards);

            const result = await useCase.execute(testUserId, testVideoId, 5);

            expect(result.flashcards).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it("creates flashcards with correct data", async () => {
            const savedFlashcards = [
                createMockFlashcard({ id: 1 }),
                createMockFlashcard({ id: 2 }),
            ];
            vi.mocked(mockFlashcardRepo.createFlashcards).mockResolvedValue(savedFlashcards);

            await useCase.execute(testUserId, testVideoId, 5);

            expect(mockFlashcardRepo.createFlashcards).toHaveBeenCalledWith([
                { videoId: testVideoId, userId: testUserId, front: "What is TypeScript?", back: "A typed superset of JavaScript" },
                { videoId: testVideoId, userId: testUserId, front: "What does TS compile to?", back: "JavaScript" },
            ]);
        });

        it("creates reviewable items with study set ID", async () => {
            const savedFlashcards = [
                createMockFlashcard({ id: 1 }),
                createMockFlashcard({ id: 2 }),
            ];
            vi.mocked(mockFlashcardRepo.createFlashcards).mockResolvedValue(savedFlashcards);

            await useCase.execute(testUserId, testVideoId, 5);

            expect(mockReviewableItemRepo.createReviewableItemsForFlashcardsBatch).toHaveBeenCalledWith([
                { userId: testUserId, flashcardId: 1, videoId: testVideoId, studySetId: 10 },
                { userId: testUserId, flashcardId: 2, videoId: testVideoId, studySetId: 10 },
            ]);
        });

        it("throws error when no study set exists for the video", async () => {
            vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(null);
            const savedFlashcards = [
                createMockFlashcard({ id: 1 }),
                createMockFlashcard({ id: 2 }),
            ];
            vi.mocked(mockFlashcardRepo.createFlashcards).mockResolvedValue(savedFlashcards);

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Study set not found for this video. Video may not have been processed correctly."
            );
        });

        it("returns correct total when existing flashcards present", async () => {
            const existingFlashcards = Array.from({ length: 5 }, (_, i) =>
                createMockFlashcard({ id: i + 1 })
            );
            vi.mocked(mockFlashcardRepo.findFlashcardsByVideoId).mockResolvedValue(existingFlashcards);

            const savedFlashcards = [
                createMockFlashcard({ id: 6 }),
                createMockFlashcard({ id: 7 }),
            ];
            vi.mocked(mockFlashcardRepo.createFlashcards).mockResolvedValue(savedFlashcards);

            const result = await useCase.execute(testUserId, testVideoId, 5);

            expect(result.flashcards).toHaveLength(2);
            expect(result.total).toBe(7); // 5 existing + 2 new
        });
    });

    describe("error handling", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId })
            );
            vi.mocked(mockFlashcardRepo.findFlashcardsByVideoId).mockResolvedValue([]);
        });

        it("throws error for invalid video URL", async () => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId, url: "invalid-url" })
            );

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Invalid video URL - could not extract video ID"
            );
        });

        it("throws error when transcript fetch fails", async () => {
            vi.mocked(mockTranscriptResolverService.getTranscript).mockRejectedValue(
                new Error("Failed to fetch video transcript - captions may be disabled")
            );

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Failed to fetch video transcript - captions may be disabled"
            );
        });

        it("throws error when flashcard generation fails", async () => {
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "transcript",
                segments: [],
            });
            vi.mocked(mockFlashcardGeneratorService.generate).mockResolvedValue(undefined);

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Failed to generate flashcards"
            );
        });

        it("throws error when flashcard generation returns empty array", async () => {
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "transcript",
                segments: [],
            });
            vi.mocked(mockFlashcardGeneratorService.generate).mockResolvedValue({
                flashcards: [],
            });

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Failed to generate flashcards"
            );
        });
    });
});
