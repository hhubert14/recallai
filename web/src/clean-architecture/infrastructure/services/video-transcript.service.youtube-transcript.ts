import "server-only";

import { logger } from "@/lib/logger";
import {
    IVideoTranscriptService,
    TranscriptResult,
    TranscriptSegment,
} from "@/clean-architecture/domain/services/video-transcript.interface";

// Only type fields we actually use - ignore everything else from the API
interface YoutubeTranscriptResponse {
    text: string;
    tracks: {
        transcript: {
            start: string;
            dur: string;
            text: string;
        }[];
    }[];
}

export class YoutubeTranscriptVideoTranscriptService implements IVideoTranscriptService {
    private readonly apiKey: string;

    constructor() {
        const apiKey = process.env.YOUTUBE_TRANSCRIPT_API_KEY;
        if (!apiKey) {
            throw new Error(
                "YOUTUBE_TRANSCRIPT_API_KEY environment variable is required"
            );
        }
        this.apiKey = apiKey;
    }

    async get(videoId: string): Promise<TranscriptResult | null> {
        try {
            const response = await fetch("https://www.youtube-transcript.io/api/transcripts", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ids: [videoId],
                }),
            });

            if (!response.ok) {
                logger.video.error("YouTube Transcript API returned error", {
                    videoId,
                    status: response.status,
                    statusText: response.statusText,
                });
                return null;
            }

            const data: YoutubeTranscriptResponse[] = await response.json();

            if (!data || data.length === 0) {
                logger.video.warn("No transcript data returned from API", {
                    videoId,
                });
                return null;
            }

            const videoData = data[0];

            if (!videoData.tracks || videoData.tracks.length === 0) {
                logger.video.warn("No transcript tracks available", { videoId });
                return null;
            }

            const track = videoData.tracks[0];
            const segments = this.parseSegments(track.transcript);

            return {
                fullText: videoData.text,
                segments,
            };
        } catch (error) {
            this.handleError(error, videoId);
            return null;
        }
    }

    private parseSegments(
        trackSegments: YoutubeTranscriptResponse["tracks"][0]["transcript"]
    ): TranscriptSegment[] {
        return trackSegments.map((segment) => {
            const startTime = parseFloat(segment.start);
            const endTime = startTime + parseFloat(segment.dur);
            return {
                text: segment.text,
                startTime: Number(startTime.toFixed(2)),
                endTime: Number(endTime.toFixed(2)),
            };
        });
    }

    private handleError(error: unknown, videoId: string): void {
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
    }
}
