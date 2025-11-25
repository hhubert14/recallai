// Reference: https://strapi.io/blog/epic-next-js-14-tutorial-part-6-create-video-summary-with-next-js-and-open-ai?utm_campaign=DevRel%20Epic%20Next%20Course&utm_source=epic-next-6-post

import "server-only";

// import TranscriptAPI from "youtube-transcript-api";
import { logger } from "@/lib/logger";
// import { YoutubeTranscript } from "./types";

export async function getYoutubeTranscript(
    videoId: string
) /*: Promise<YoutubeTranscript | null>*/ {
    try {
        // const transcript = await TranscriptAPI.getTranscript(videoId);
        const transcript = await fetch(
            `https://deserving-harmony-9f5ca04daf.strapiapp.com/utilai/yt-transcript/${videoId}`
        );
        return transcript.text();
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
