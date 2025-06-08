import "server-only";

// @ts-ignore
import TranscriptAPI from "youtube-transcript-api";
import { YoutubeTranscript } from "./types";

export async function getYoutubeTranscript(
    videoId: string
): Promise<YoutubeTranscript | null> {
    try {
        const transcript = await TranscriptAPI.getTranscript(videoId);

        if (
            !transcript ||
            transcript.length === 0 ||
            transcript.transcript === null
        ) {
            console.warn(`No transcript found for video ID: ${videoId}`);
            return null;
        }
        return transcript;
    } catch (error) {
        console.error("Error fetching transcript:", error);
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
