// Reference: https://strapi.io/blog/epic-next-js-14-tutorial-part-6-create-video-summary-with-next-js-and-open-ai?utm_campaign=DevRel%20Epic%20Next%20Course&utm_source=epic-next-6-post

import "server-only";

// @ts-ignore
import TranscriptAPI from "youtube-transcript-api";
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

        // if (!transcript) {
        //     console.warn(`Transcript API returned null/undefined for video ID: ${videoId}`);
        //     return null;
        // }

        // if (transcript.length === 0) {
        //     console.warn(`Empty transcript array returned for video ID: ${videoId}`);
        //     return null;
        // }

        // if (transcript.transcript === null) {
        //     console.warn(`Transcript property is null for video ID: ${videoId}`);
        //     return null;
        // }

        // console.log(`Successfully fetched transcript for video ID: ${videoId} with ${transcript.length} segments`);
        return transcript.text();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("unavailable")) {
                logger.video.warn("Video unavailable for transcript extraction", { videoId, error: error.message });
            } else if (error.message.includes("captions disabled")) {
                logger.video.warn("Captions are disabled for video", { videoId, error: error.message });
            } else if (error.message.includes("private")) {
                logger.video.warn("Video is private or restricted", { videoId, error: error.message });
            } else {
                logger.video.error("Unexpected error fetching transcript", error, { videoId });
            }
        } else {
            logger.video.error("Unknown error type fetching transcript", error, { videoId });
        }
        return null;
    }
}

/*
// Example returned data structure:
{
  "transcript": [
    {
      "start": "0.08",
      "text": "I just like going heavy as shit and",
      "duration": "3.799"
    },
    {
      "start": "2.04",
      "text": "going to fail your baby first heard that",
      "duration": "4.279"
    },
    {
      "start": "3.879",
      "text": "Philosophy from Mike",
      "duration": "4.68"
    },
    {
      "start": "6.319",
      "text": "mener what the's up with this Mike mener",
      "duration": "3.641"
    },
    {
      "start": "8.559",
      "text": "Resurgence bullshit you know like what",
      "duration": "3.24"
    },
    {
      "start": "9.96",
      "text": "did Albert Einstein think about fashion",
      "duration": "4.09"
}]
} */
