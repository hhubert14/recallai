import { ITranscriptResolverService } from "@/clean-architecture/domain/services/transcript-resolver.interface";
import { ITranscriptRepository } from "@/clean-architecture/domain/repositories/transcript.repository.interface";
import { IVideoTranscriptService, TranscriptResult } from "@/clean-architecture/domain/services/video-transcript.interface";
import { logger } from "@/lib/logger";

export class TranscriptResolverService implements ITranscriptResolverService {
    constructor(
        private readonly transcriptRepository: ITranscriptRepository,
        private readonly videoTranscriptService: IVideoTranscriptService,
    ) {}

    async getTranscript(videoId: number, youtubeVideoId: string): Promise<TranscriptResult> {
        // Try database first
        const storedTranscript = await this.transcriptRepository.findTranscriptByVideoId(videoId);

        if (storedTranscript) {
            logger.video.info("Transcript found in database - completed");
            return {
                fullText: storedTranscript.fullText,
                segments: storedTranscript.segments,
            };
        }

        // Fallback to YouTube API (for videos processed before transcript storage)
        logger.video.info("Transcript cache miss - YouTube fetch processed");
        const fetched = await this.videoTranscriptService.get(youtubeVideoId);
        if (!fetched) {
            throw new Error(
                "Failed to fetch video transcript - captions may be disabled"
            );
        }

        // Store for future use (on-demand backfill)
        try {
            await this.transcriptRepository.createTranscript(
                videoId,
                fetched.segments,
                fetched.fullText
            );
            logger.video.info("Transcript backfill completed");
        } catch (error) {
            logger.video.warn("Failed to store transcript for backfill", { error });
        }

        return fetched;
    }
}
