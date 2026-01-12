import { describe, it, expect, vi, beforeEach } from "vitest";
import { TranscriptResolverService } from "./transcript-resolver.service";
import { ITranscriptRepository } from "@/clean-architecture/domain/repositories/transcript.repository.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { TranscriptEntity } from "@/clean-architecture/domain/entities/transcript.entity";

describe("TranscriptResolverService", () => {
    let service: TranscriptResolverService;
    let mockTranscriptRepo: ITranscriptRepository;
    let mockVideoTranscriptService: IVideoTranscriptService;

    const testVideoId = 1;
    const testYoutubeVideoId = "abc123";

    beforeEach(() => {
        mockTranscriptRepo = {
            createTranscript: vi.fn(),
            findTranscriptByVideoId: vi.fn(),
        };

        mockVideoTranscriptService = {
            get: vi.fn(),
        };

        service = new TranscriptResolverService(
            mockTranscriptRepo,
            mockVideoTranscriptService
        );
    });

    describe("getTranscript", () => {
        it("returns transcript from database when found", async () => {
            const storedTranscript = new TranscriptEntity(
                1,
                testVideoId,
                [{ text: "Hello world", startTime: 0, endTime: 5 }],
                "Hello world",
                new Date().toISOString()
            );

            vi.mocked(mockTranscriptRepo.findTranscriptByVideoId).mockResolvedValue(
                storedTranscript
            );

            const result = await service.getTranscript(testVideoId, testYoutubeVideoId);

            expect(result).toEqual({
                fullText: "Hello world",
                segments: [{ text: "Hello world", startTime: 0, endTime: 5 }],
            });
            expect(mockTranscriptRepo.findTranscriptByVideoId).toHaveBeenCalledWith(testVideoId);
            expect(mockVideoTranscriptService.get).not.toHaveBeenCalled();
        });

        it("falls back to YouTube API when not in database", async () => {
            const youtubeTranscript = {
                fullText: "YouTube transcript",
                segments: [{ text: "YouTube transcript", startTime: 0, endTime: 10 }],
            };

            vi.mocked(mockTranscriptRepo.findTranscriptByVideoId).mockResolvedValue(null);
            vi.mocked(mockVideoTranscriptService.get).mockResolvedValue(youtubeTranscript);
            vi.mocked(mockTranscriptRepo.createTranscript).mockResolvedValue(
                new TranscriptEntity(
                    1,
                    testVideoId,
                    youtubeTranscript.segments,
                    youtubeTranscript.fullText,
                    new Date().toISOString()
                )
            );

            const result = await service.getTranscript(testVideoId, testYoutubeVideoId);

            expect(result).toEqual(youtubeTranscript);
            expect(mockVideoTranscriptService.get).toHaveBeenCalledWith(testYoutubeVideoId);
        });

        it("stores transcript for future use after fetching from YouTube", async () => {
            const youtubeTranscript = {
                fullText: "YouTube transcript",
                segments: [{ text: "YouTube transcript", startTime: 0, endTime: 10 }],
            };

            vi.mocked(mockTranscriptRepo.findTranscriptByVideoId).mockResolvedValue(null);
            vi.mocked(mockVideoTranscriptService.get).mockResolvedValue(youtubeTranscript);
            vi.mocked(mockTranscriptRepo.createTranscript).mockResolvedValue(
                new TranscriptEntity(
                    1,
                    testVideoId,
                    youtubeTranscript.segments,
                    youtubeTranscript.fullText,
                    new Date().toISOString()
                )
            );

            await service.getTranscript(testVideoId, testYoutubeVideoId);

            expect(mockTranscriptRepo.createTranscript).toHaveBeenCalledWith(
                testVideoId,
                youtubeTranscript.segments,
                youtubeTranscript.fullText
            );
        });

        it("throws error when YouTube API returns null", async () => {
            vi.mocked(mockTranscriptRepo.findTranscriptByVideoId).mockResolvedValue(null);
            vi.mocked(mockVideoTranscriptService.get).mockResolvedValue(null);

            await expect(
                service.getTranscript(testVideoId, testYoutubeVideoId)
            ).rejects.toThrow("Failed to fetch video transcript - captions may be disabled");
        });

        it("continues and returns transcript even if backfill storage fails", async () => {
            const youtubeTranscript = {
                fullText: "YouTube transcript",
                segments: [{ text: "YouTube transcript", startTime: 0, endTime: 10 }],
            };

            vi.mocked(mockTranscriptRepo.findTranscriptByVideoId).mockResolvedValue(null);
            vi.mocked(mockVideoTranscriptService.get).mockResolvedValue(youtubeTranscript);
            vi.mocked(mockTranscriptRepo.createTranscript).mockRejectedValue(
                new Error("Database error")
            );

            const result = await service.getTranscript(testVideoId, testYoutubeVideoId);

            // Should still return the transcript despite storage failure
            expect(result).toEqual(youtubeTranscript);
        });
    });
});
