import "server-only";
import { YouTubeData } from "./types";
import { logger } from "@/lib/logger";

export async function getYoutubeVideoData(
    videoId: string
): Promise<YouTubeData | undefined> {
    if (!videoId || typeof videoId !== "string") {
        return undefined;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        throw new Error("YouTube API key is not set in environment variables");
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch video data");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        logger.video.error("Error fetching YouTube video data", error, { videoId });
        throw error;
    }
}
