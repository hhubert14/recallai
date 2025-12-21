import "server-only";

import { logger } from "@/lib/logger";
import {
    IVideoTranscriptService,
    TranscriptResult,
} from "@/clean-architecture/domain/services/video-transcript.interface";

export class StrapiVideoTranscriptService implements IVideoTranscriptService {
    async get(videoId: string): Promise<TranscriptResult | null> {
        try {
            const response = await fetch(
                `https://deserving-harmony-9f5ca04daf.strapiapp.com/utilai/yt-transcript/${videoId}`
            );
            const fullText = await response.text();

            // Strapi service returns plain text without timestamps
            // Return empty segments array until we switch to a timestamp-capable service
            return {
                fullText,
                segments: [],
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("unavailable")) {
                    logger.video.warn(
                        "Video unavailable for transcript extraction",
                        { videoId, error: error.message }
                    );
                } else if (error.message.includes("captions disabled")) {
                    logger.video.warn("Captions are disabled for video", {
                        videoId,
                        error: error.message,
                    });
                } else if (error.message.includes("private")) {
                    logger.video.warn("Video is private or restricted", {
                        videoId,
                        error: error.message,
                    });
                } else {
                    logger.video.error(
                        "Unexpected error fetching transcript",
                        error,
                        { videoId }
                    );
                }
            } else {
                logger.video.error(
                    "Unknown error type fetching transcript",
                    error,
                    { videoId }
                );
            }
            return null;
        }
    }
}
