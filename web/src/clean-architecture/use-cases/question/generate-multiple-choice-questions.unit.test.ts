import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerateMultipleChoiceQuestionsUseCase } from "./generate-multiple-choice-questions.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ITranscriptWindowRepository, WindowMatchResult } from "@/clean-architecture/domain/repositories/transcript-window.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { ITranscriptResolverService } from "@/clean-architecture/domain/services/transcript-resolver.interface";
import { IQuestionGeneratorService } from "@/clean-architecture/domain/services/question-generator.interface";
import { IEmbeddingService } from "@/clean-architecture/domain/services/embedding.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { TranscriptWindowEntity } from "@/clean-architecture/domain/entities/transcript-window.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import {
    MultipleChoiceQuestionEntity,
    MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";

// Helper to create mock VideoEntity
function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
    return new VideoEntity(
        overrides.id ?? 1,
        overrides.userId ?? "user-1",
        overrides.title ?? "Test Video",
        overrides.url ?? "https://www.youtube.com/watch?v=test123",
        overrides.channelName ?? "Test Channel",
        overrides.createdAt ?? new Date().toISOString(),
    );
}

// Helper to create mock question
function createMockQuestion(
    overrides: Partial<{
        id: number;
        videoId: number;
        questionText: string;
        options: MultipleChoiceOption[];
        sourceQuote: string | null;
        sourceTimestamp: number | null;
    }> = {}
): MultipleChoiceQuestionEntity {
    const defaultOptions = [
        new MultipleChoiceOption(1, "Option A", false, null),
        new MultipleChoiceOption(2, "Option B", true, "This is the correct answer"),
        new MultipleChoiceOption(3, "Option C", false, null),
        new MultipleChoiceOption(4, "Option D", false, null),
    ];

    return new MultipleChoiceQuestionEntity(
        overrides.id ?? 1,
        overrides.videoId ?? 1,
        overrides.questionText ?? "What is the main concept?",
        overrides.options ?? defaultOptions,
        overrides.sourceQuote ?? "This is the source quote from the video",
        overrides.sourceTimestamp ?? 120
    );
}

// Helper to create mock window match result
function createMockWindowMatch(startTime: number): WindowMatchResult {
    return {
        window: new TranscriptWindowEntity(
            1,
            1,
            0,
            startTime,
            startTime + 20,
            "Some transcript text",
            [0.1, 0.2, 0.3],
            new Date().toISOString()
        ),
        similarity: 0.95,
    };
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

describe("GenerateMultipleChoiceQuestionsUseCase", () => {
    let useCase: GenerateMultipleChoiceQuestionsUseCase;
    let mockVideoRepo: IVideoRepository;
    let mockQuestionRepo: IQuestionRepository;
    let mockTranscriptWindowRepo: ITranscriptWindowRepository;
    let mockReviewableItemRepo: IReviewableItemRepository;
    let mockStudySetRepo: IStudySetRepository;
    let mockTranscriptResolverService: ITranscriptResolverService;
    let mockQuestionGeneratorService: IQuestionGeneratorService;
    let mockEmbeddingService: IEmbeddingService;

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

        mockQuestionRepo = {
            createMultipleChoiceQuestion: vi.fn(),
            findQuestionById: vi.fn(),
            findQuestionsByVideoId: vi.fn(),
            findQuestionsByIds: vi.fn(),
            countQuestionsByVideoIds: vi.fn(),
            updateQuestion: vi.fn(),
        };

        mockTranscriptWindowRepo = {
            createWindowsBatch: vi.fn(),
            findWindowsByVideoId: vi.fn(),
            findMostSimilarWindow: vi.fn(),
            findTopKSimilarWindows: vi.fn(),
            deleteWindowsByVideoId: vi.fn(),
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

        mockQuestionGeneratorService = {
            generate: vi.fn(),
        };

        mockEmbeddingService = {
            embed: vi.fn(),
            embedBatch: vi.fn(),
        };

        useCase = new GenerateMultipleChoiceQuestionsUseCase(
            mockVideoRepo,
            mockQuestionRepo,
            mockTranscriptResolverService,
            mockQuestionGeneratorService,
            mockEmbeddingService,
            mockTranscriptWindowRepo,
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

    describe("question cap enforcement", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId })
            );
        });

        it("throws error when max questions (20) already reached", async () => {
            const existingQuestions = Array.from({ length: 20 }, (_, i) =>
                createMockQuestion({ id: i + 1 })
            );
            vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue(
                existingQuestions
            );

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Maximum questions reached (20). Delete some to generate more."
            );
        });

        it("throws error when requested count exceeds remaining capacity", async () => {
            const existingQuestions = Array.from({ length: 18 }, (_, i) =>
                createMockQuestion({ id: i + 1 })
            );
            vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue(
                existingQuestions
            );

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Cannot generate 5 questions. Only 2 more allowed (18 of 20 max)."
            );
        });
    });

    describe("successful question generation", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId, title: "TypeScript Tutorial" })
            );
            vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue([]);
            vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(
                createMockStudySet({ id: 10, videoId: testVideoId })
            );
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "This is the full transcript about TypeScript...",
                segments: [{ text: "segment", startTime: 0, endTime: 10 }],
            });
            vi.mocked(mockQuestionGeneratorService.generate).mockResolvedValue({
                questions: [
                    {
                        question: "What is TypeScript?",
                        options: ["A language", "A framework", "A library", "A tool"],
                        correctAnswerIndex: 0,
                        explanation: "TypeScript is a programming language",
                        sourceQuote: "TypeScript is a typed superset of JavaScript",
                    },
                    {
                        question: "What does TS compile to?",
                        options: ["JavaScript", "Python", "Java", "C++"],
                        correctAnswerIndex: 0,
                        explanation: "TypeScript compiles to JavaScript",
                        sourceQuote: "The compiler outputs JavaScript code",
                    },
                ],
            });
            vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
            vi.mocked(mockTranscriptWindowRepo.findMostSimilarWindow).mockResolvedValue(
                createMockWindowMatch(60)
            );
        });

        it("generates and saves questions with correct structure", async () => {
            const savedQuestion = createMockQuestion({ id: 1 });
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion).mockResolvedValue(
                savedQuestion
            );

            const result = await useCase.execute(testUserId, testVideoId, 5);

            expect(result.questions).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it("creates questions with correct option structure", async () => {
            const savedQuestion = createMockQuestion({ id: 1 });
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion).mockResolvedValue(
                savedQuestion
            );

            await useCase.execute(testUserId, testVideoId, 5);

            // Verify createMultipleChoiceQuestion was called with correct option structure
            expect(mockQuestionRepo.createMultipleChoiceQuestion).toHaveBeenCalledWith(
                testVideoId,
                "What is TypeScript?",
                expect.arrayContaining([
                    expect.objectContaining({
                        optionText: "A language",
                        isCorrect: true,
                        explanation: "TypeScript is a programming language",
                    }),
                    expect.objectContaining({
                        optionText: "A framework",
                        isCorrect: false,
                        explanation: null,
                    }),
                ]),
                "TypeScript is a typed superset of JavaScript",
                60 // sourceTimestamp from window match
            );
        });

        it("matches source quotes to timestamps via embeddings", async () => {
            const savedQuestion = createMockQuestion({ id: 1 });
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion).mockResolvedValue(
                savedQuestion
            );

            await useCase.execute(testUserId, testVideoId, 5);

            // Verify embedding service was called with source quotes
            expect(mockEmbeddingService.embed).toHaveBeenCalledWith(
                "TypeScript is a typed superset of JavaScript"
            );
            expect(mockTranscriptWindowRepo.findMostSimilarWindow).toHaveBeenCalledWith(
                testVideoId,
                [0.1, 0.2, 0.3]
            );
        });

        it("continues with null timestamp if embedding matching fails", async () => {
            const savedQuestion = createMockQuestion({ id: 1, sourceTimestamp: null });
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion).mockResolvedValue(
                savedQuestion
            );
            vi.mocked(mockEmbeddingService.embed).mockRejectedValue(
                new Error("Embedding service error")
            );

            const result = await useCase.execute(testUserId, testVideoId, 5);

            // Should still return questions despite embedding failure
            expect(result.questions).toHaveLength(2);

            // Verify createMultipleChoiceQuestion was called with null timestamp
            expect(mockQuestionRepo.createMultipleChoiceQuestion).toHaveBeenCalledWith(
                testVideoId,
                expect.any(String),
                expect.any(Array),
                expect.any(String),
                null // sourceTimestamp is null due to embedding failure
            );
        });

        it("creates reviewable items with study set ID", async () => {
            const savedQuestion1 = createMockQuestion({ id: 1 });
            const savedQuestion2 = createMockQuestion({ id: 2 });
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion)
                .mockResolvedValueOnce(savedQuestion1)
                .mockResolvedValueOnce(savedQuestion2);

            await useCase.execute(testUserId, testVideoId, 5);

            expect(mockReviewableItemRepo.createReviewableItemsForQuestionsBatch).toHaveBeenCalledWith([
                { userId: testUserId, questionId: 1, videoId: testVideoId, studySetId: 10 },
                { userId: testUserId, questionId: 2, videoId: testVideoId, studySetId: 10 },
            ]);
        });

        it("throws error when no study set exists for the video", async () => {
            vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(null);
            const savedQuestion1 = createMockQuestion({ id: 1 });
            const savedQuestion2 = createMockQuestion({ id: 2 });
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion)
                .mockResolvedValueOnce(savedQuestion1)
                .mockResolvedValueOnce(savedQuestion2);

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Study set not found for this video. Video may not have been processed correctly."
            );
        });
    });

    describe("duplicate prevention", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId, title: "TypeScript Tutorial" })
            );
            vi.mocked(mockStudySetRepo.findStudySetByVideoId).mockResolvedValue(
                createMockStudySet({ id: 10, videoId: testVideoId })
            );
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "This is the full transcript about TypeScript...",
                segments: [{ text: "segment", startTime: 0, endTime: 10 }],
            });
            vi.mocked(mockQuestionGeneratorService.generate).mockResolvedValue({
                questions: [
                    {
                        question: "New question about generics?",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswerIndex: 0,
                        explanation: "Explanation",
                        sourceQuote: "Source quote",
                    },
                ],
            });
            vi.mocked(mockEmbeddingService.embed).mockResolvedValue([0.1, 0.2, 0.3]);
            vi.mocked(mockTranscriptWindowRepo.findMostSimilarWindow).mockResolvedValue(
                createMockWindowMatch(60)
            );
            vi.mocked(mockQuestionRepo.createMultipleChoiceQuestion).mockResolvedValue(
                createMockQuestion({ id: 1 })
            );
        });

        it("passes existing question texts to the generator service", async () => {
            const existingQuestions = [
                createMockQuestion({ id: 1, questionText: "What is TypeScript?" }),
                createMockQuestion({ id: 2, questionText: "How do interfaces work?" }),
            ];
            vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue(existingQuestions);

            await useCase.execute(testUserId, testVideoId, 5);

            expect(mockQuestionGeneratorService.generate).toHaveBeenCalledWith(
                "TypeScript Tutorial",
                "This is the full transcript about TypeScript...",
                5,
                ["What is TypeScript?", "How do interfaces work?"]
            );
        });

        it("passes empty array when no existing questions", async () => {
            vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue([]);

            await useCase.execute(testUserId, testVideoId, 5);

            expect(mockQuestionGeneratorService.generate).toHaveBeenCalledWith(
                "TypeScript Tutorial",
                "This is the full transcript about TypeScript...",
                5,
                []
            );
        });
    });

    describe("error handling", () => {
        beforeEach(() => {
            vi.mocked(mockVideoRepo.findVideoById).mockResolvedValue(
                createMockVideo({ userId: testUserId })
            );
            vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue([]);
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

        it("throws error when question generation fails", async () => {
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "transcript",
                segments: [],
            });
            vi.mocked(mockQuestionGeneratorService.generate).mockResolvedValue(undefined);

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Failed to generate questions"
            );
        });

        it("throws error when question generation returns empty array", async () => {
            vi.mocked(mockTranscriptResolverService.getTranscript).mockResolvedValue({
                fullText: "transcript",
                segments: [],
            });
            vi.mocked(mockQuestionGeneratorService.generate).mockResolvedValue({
                questions: [],
            });

            await expect(useCase.execute(testUserId, testVideoId, 5)).rejects.toThrow(
                "Failed to generate questions"
            );
        });
    });
});
