import { logger } from "@/lib/logger";
import { extractYouTubeVideoId, normalizeYouTubeUrl } from "@/lib/youtube";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IVideoInfoService } from "@/clean-architecture/domain/services/video-info.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { IVideoSummarizerService } from "@/clean-architecture/domain/services/video-summarizer.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";

export type ProcessVideoResult = {
  video: VideoEntity;
  summary: SummaryEntity;
  studySet: StudySetEntity;
  alreadyExists: boolean;
  // Return transcript data for background processing (only for new videos)
  transcriptData?: {
    segments: TranscriptSegment[];
    fullText: string;
  };
};

export class ProcessVideoUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly summaryRepository: ISummaryRepository,
    private readonly studySetRepository: IStudySetRepository,
    private readonly videoInfoService: IVideoInfoService,
    private readonly videoTranscriptService: IVideoTranscriptService,
    private readonly videoSummarizerService: IVideoSummarizerService
  ) {}

  async execute(userId: string, videoUrl: string): Promise<ProcessVideoResult> {
    logger.extension.info("Processing video request", { videoUrl, userId });

    // 1. Normalize YouTube URL to canonical format for consistent duplicate detection
    const normalizedUrl = normalizeYouTubeUrl(videoUrl);
    if (!normalizedUrl) {
      throw new Error("Invalid YouTube URL - could not extract video ID");
    }
    const youtubeVideoId = extractYouTubeVideoId(normalizedUrl)!;

    // 2. Check if video already exists for this user (using normalized URL)
    logger.extension.debug("Checking if video already exists");
    const existingVideo = await this.videoRepository.findVideoByUserIdAndUrl(
      userId,
      normalizedUrl
    );
    if (existingVideo) {
      logger.extension.info("Video already exists, returning existing data", {
        videoId: existingVideo.id,
      });

      // Fetch existing summary
      const existingSummary = await this.summaryRepository.findSummaryByVideoId(
        existingVideo.id
      );

      if (!existingSummary) {
        throw new Error("Video exists but summary not found");
      }

      // Fetch existing study set (or create one if migration hasn't happened yet)
      let existingStudySet =
        await this.studySetRepository.findStudySetByVideoId(existingVideo.id);
      if (!existingStudySet) {
        // Create study set for legacy video that doesn't have one
        existingStudySet = await this.studySetRepository.createStudySet({
          userId,
          name: existingVideo.title,
          description: null,
          sourceType: "video",
          videoId: existingVideo.id,
        });
        logger.extension.info("Created study set for legacy video", {
          videoId: existingVideo.id,
          studySetId: existingStudySet.id,
        });
      }

      return {
        video: existingVideo,
        summary: existingSummary,
        studySet: existingStudySet,
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
    const transcriptResult =
      await this.videoTranscriptService.get(youtubeVideoId);
    if (!transcriptResult) {
      throw new Error(
        "Failed to fetch video transcript - captions may be disabled"
      );
    }

    // 4. Create video record (using normalized URL for consistent storage)
    logger.extension.debug("Creating video record");
    const video = await this.videoRepository.createVideo(
      userId,
      title,
      normalizedUrl,
      channelName
    );
    logger.extension.info("Video created successfully", { videoId: video.id });

    // 5. Create study set for the video
    logger.extension.debug("Creating study set for video");
    const studySet = await this.studySetRepository.createStudySet({
      userId,
      name: title,
      description: null,
      sourceType: "video",
      videoId: video.id,
    });
    logger.extension.info("Study set created successfully", {
      videoId: video.id,
      studySetId: studySet.id,
    });

    // 6. Generate and save summary
    logger.extension.debug("Generating summary");
    const summaryResult = await this.videoSummarizerService.generate(
      title,
      description,
      {
        fullText: transcriptResult.fullText,
        segments: transcriptResult.segments,
      }
    );
    if (!summaryResult) {
      throw new Error("Failed to generate video summary");
    }

    const summary = await this.summaryRepository.createSummary(
      video.id,
      summaryResult.summary
    );
    logger.extension.info("Summary created successfully", {
      videoId: video.id,
      summaryLength: summary.content.length,
    });

    // Return result with transcript data for background processing
    return {
      video,
      summary,
      studySet,
      alreadyExists: false,
      transcriptData: {
        segments: transcriptResult.segments,
        fullText: transcriptResult.fullText,
      },
    };
  }
}
