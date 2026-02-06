import "server-only";

import { logger } from "@/lib/logger";
import {
  IVideoInfoService,
  VideoInfoDto,
} from "@/clean-architecture/domain/services/video-info.interface";

type YouTubeApiResponse = {
  items?: {
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
    };
  }[];
};

export class YouTubeVideoInfoService implements IVideoInfoService {
  async get(videoId: string): Promise<VideoInfoDto | undefined> {
    if (!videoId || typeof videoId !== "string") {
      return undefined;
    }

    const apiKey = process.env.YOUTUBE_INFO_API_KEY;
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

      const data: YouTubeApiResponse = await response.json();

      if (!data.items?.[0]?.snippet) {
        return undefined;
      }

      const snippet = data.items[0].snippet;

      return {
        title: snippet.title || "Untitled",
        description: snippet.description || "",
        channelName: snippet.channelTitle || "Unknown Channel",
      };
    } catch (error) {
      logger.video.error("Error fetching YouTube video data", error, {
        videoId,
      });
      throw error;
    }
  }
}
