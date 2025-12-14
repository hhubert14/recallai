import { extractYouTubeVideoId } from "@/lib/youtube";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { IFlashcardGeneratorService } from "@/clean-architecture/domain/services/flashcard-generator.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

const MAX_FLASHCARDS_PER_VIDEO = 20;
const VALID_COUNTS = [5, 10, 20] as const;
type ValidCount = (typeof VALID_COUNTS)[number];

export type GenerateFlashcardsResult = {
    flashcards: FlashcardEntity[];
    total: number;
};

export class GenerateFlashcardsUseCase {
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly flashcardRepository: IFlashcardRepository,
        private readonly videoTranscriptService: IVideoTranscriptService,
        private readonly flashcardGeneratorService: IFlashcardGeneratorService
    ) {}

    async execute(
        userId: string,
        videoId: number,
        count: number
    ): Promise<GenerateFlashcardsResult> {
        // Validate count
        if (!VALID_COUNTS.includes(count as ValidCount)) {
            throw new Error(
                `Invalid count: ${count}. Must be one of: ${VALID_COUNTS.join(", ")}`
            );
        }

        // Fetch video and verify ownership
        const video = await this.videoRepository.findVideoById(videoId);
        if (!video) {
            throw new Error("Video not found");
        }
        if (video.userId !== userId) {
            throw new Error("Not authorized to access this video");
        }

        // Check current flashcard count against cap
        const existingFlashcards =
            await this.flashcardRepository.findFlashcardsByVideoId(videoId);
        const existingCount = existingFlashcards.length;

        if (existingCount >= MAX_FLASHCARDS_PER_VIDEO) {
            throw new Error(
                `Maximum flashcards reached (${MAX_FLASHCARDS_PER_VIDEO}). Delete some to generate more.`
            );
        }

        const remainingCapacity = MAX_FLASHCARDS_PER_VIDEO - existingCount;
        if (count > remainingCapacity) {
            throw new Error(
                `Cannot generate ${count} flashcards. Only ${remainingCapacity} more allowed (${existingCount} of ${MAX_FLASHCARDS_PER_VIDEO} max).`
            );
        }

        // Extract YouTube video ID from URL
        const youtubeVideoId = extractYouTubeVideoId(video.url);
        if (!youtubeVideoId) {
            throw new Error("Invalid video URL - could not extract video ID");
        }

        // Fetch transcript
        const transcriptResult =
            await this.videoTranscriptService.get(youtubeVideoId);
        if (!transcriptResult) {
            throw new Error(
                "Failed to fetch video transcript - captions may be disabled"
            );
        }

        // Generate flashcards using full text (timestamps will be used when available)
        const generatedFlashcards = await this.flashcardGeneratorService.generate(
            video.title,
            transcriptResult.fullText,
            count
        );

        if (!generatedFlashcards || generatedFlashcards.flashcards.length === 0) {
            throw new Error("Failed to generate flashcards");
        }

        // Save flashcards to database (bulk insert)
        const flashcardsData = generatedFlashcards.flashcards.map((f) => ({
            videoId,
            userId,
            front: f.front,
            back: f.back,
        }));

        const savedFlashcards =
            await this.flashcardRepository.createFlashcards(flashcardsData);

        return {
            flashcards: savedFlashcards,
            total: existingCount + savedFlashcards.length,
        };
    }
}
