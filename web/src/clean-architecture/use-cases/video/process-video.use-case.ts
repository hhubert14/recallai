import { logger } from "@/lib/logger";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { IVideoInfoService } from "@/clean-architecture/domain/services/video-info.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { IVideoClassifierService } from "@/clean-architecture/domain/services/video-classifier.interface";
import { IVideoSummarizerService } from "@/clean-architecture/domain/services/video-summarizer.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";

export type ProcessVideoResult = {
    video: VideoEntity;
    summary: SummaryEntity;
    alreadyExists: boolean;
};

export class ProcessVideoUseCase {
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly summaryRepository: ISummaryRepository,
        private readonly videoInfoService: IVideoInfoService,
        private readonly videoTranscriptService: IVideoTranscriptService,
        private readonly videoClassifierService: IVideoClassifierService,
        private readonly videoSummarizerService: IVideoSummarizerService
    ) {}

    async execute(userId: string, videoUrl: string): Promise<ProcessVideoResult> {
        logger.extension.info("Processing video request", { videoUrl, userId });

        // 1. Extract YouTube video ID from URL
        const youtubeVideoId = extractYouTubeVideoId(videoUrl);
        if (!youtubeVideoId) {
            throw new Error("Invalid YouTube URL - could not extract video ID");
        }

        // 2. Check if video already exists for this user
        logger.extension.debug("Checking if video already exists");
        const existingVideo = await this.videoRepository.findVideoByUserIdAndUrl(userId, videoUrl);
        if (existingVideo) {
            logger.extension.info("Video already exists, returning existing data", {
                videoId: existingVideo.id,
            });

            // Fetch existing summary
            const existingSummary = await this.summaryRepository.findSummaryByVideoId(existingVideo.id);

            if (!existingSummary) {
                throw new Error("Video exists but summary not found");
            }

            return {
                video: existingVideo,
                summary: existingSummary,
                alreadyExists: true,
            };
        }

        // 3. Fetch YouTube data and transcript
        logger.extension.debug("Fetching YouTube video data");
        const videoInfo = await this.videoInfoService.get(youtubeVideoId);
        if (!videoInfo) {
            throw new Error("Failed to fetch YouTube video data");
        }

        const { title, description, channelName } = videoInfo;

        logger.extension.debug("Fetching transcript");
        const transcript = await this.videoTranscriptService.get(youtubeVideoId);
        if (!transcript) {
            throw new Error("Failed to fetch video transcript - captions may be disabled");
        }

        // 4. Check if video is educational
        logger.extension.debug("Checking if video is educational");
        const isEducational = await this.videoClassifierService.isEducational(title, description, transcript);
        if (!isEducational) {
            throw new Error("Video does not appear to be educational content");
        }

        // 5. Create video record
        logger.extension.debug("Creating video record");
        const video = await this.videoRepository.createVideo(
            userId,
            "YouTube",
            title,
            videoUrl,
            channelName,
            null // duration - could be extracted from YouTube API if needed
        );
        logger.extension.info("Video created successfully", { videoId: video.id });

        // 6. Generate and save summary
        logger.extension.debug("Generating summary");
        const summaryResult = await this.videoSummarizerService.generate(title, description, transcript);
        if (!summaryResult) {
            throw new Error("Failed to generate video summary");
        }

        const summary = await this.summaryRepository.createSummary(video.id, summaryResult.summary);
        logger.extension.info("Summary created successfully", {
            videoId: video.id,
            summaryLength: summary.content.length,
        });

        return {
            video,
            summary,
            alreadyExists: false,
        };
    }
}
