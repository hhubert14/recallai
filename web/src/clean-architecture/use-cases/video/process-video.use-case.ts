import { logger } from "@/lib/logger";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

// External API services
import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";
import { generateVideoSummary } from "@/data-access/external-apis/generate-video-summary";
import { generateVideoQuestions } from "@/data-access/external-apis/generate-video-questions";

export type ProcessVideoResult = {
    video: VideoEntity;
    summary: SummaryEntity;
    questions: MultipleChoiceQuestionEntity[];
    alreadyExists?: boolean;
};

export class ProcessVideoUseCase {
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly summaryRepository: ISummaryRepository,
        private readonly questionRepository: IQuestionRepository
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

            // Fetch existing summary and questions
            const [existingSummary, existingQuestions] = await Promise.all([
                this.summaryRepository.findSummaryByVideoId(existingVideo.id),
                this.questionRepository.findQuestionsByVideoId(existingVideo.id),
            ]);

            if (!existingSummary) {
                throw new Error("Video exists but summary not found");
            }

            return {
                video: existingVideo,
                summary: existingSummary,
                questions: existingQuestions,
                alreadyExists: true,
            };
        }

        // 3. Fetch YouTube data and transcript
        logger.extension.debug("Fetching YouTube video data");
        const videoData = await getYoutubeVideoData(youtubeVideoId);
        if (!videoData || !videoData.items?.[0]?.snippet) {
            throw new Error("Failed to fetch YouTube video data");
        }

        const snippet = videoData.items[0].snippet;
        const title = snippet.title || "Untitled";
        const description = snippet.description || "";
        const channelName = snippet.channelTitle || "Unknown Channel";

        logger.extension.debug("Fetching transcript");
        const transcript = await getYoutubeTranscript(youtubeVideoId);
        if (!transcript) {
            throw new Error("Failed to fetch video transcript - captions may be disabled");
        }

        // 4. Check if video is educational
        logger.extension.debug("Checking if video is educational");
        const isEducational = await checkVideoEducational(title, description, transcript);
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
        const summaryResult = await generateVideoSummary(title, description, transcript);
        if (!summaryResult) {
            throw new Error("Failed to generate video summary");
        }

        const summary = await this.summaryRepository.createSummary(video.id, summaryResult.summary);
        logger.extension.info("Summary created successfully", {
            videoId: video.id,
            summaryLength: summary.content.length,
        });

        // 7. Generate and save questions
        logger.extension.debug("Generating questions");
        const questionsResult = await generateVideoQuestions(title, description, transcript);
        if (!questionsResult || !questionsResult.questions) {
            throw new Error("Failed to generate video questions");
        }

        const questions: MultipleChoiceQuestionEntity[] = [];
        for (const q of questionsResult.questions) {
            const options = q.options.map((optionText, index) => ({
                optionText,
                isCorrect: index === q.correctAnswerIndex,
                orderIndex: index,
                explanation: index === q.correctAnswerIndex ? q.explanation : null,
            }));

            const question = await this.questionRepository.createMultipleChoiceQuestion(
                video.id,
                q.question,
                options
            );
            questions.push(question);
        }

        logger.extension.info("Questions created successfully", {
            videoId: video.id,
            questionCount: questions.length,
        });

        return {
            video,
            summary,
            questions,
        };
    }
}
