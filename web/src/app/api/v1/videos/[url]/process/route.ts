import { NextRequest } from "next/server";
import { after } from "next/server";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";
import { ProcessVideoUseCase } from "@/clean-architecture/use-cases/video/process-video.use-case";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleTranscriptRepository } from "@/clean-architecture/infrastructure/repositories/transcript.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { YouTubeVideoInfoService } from "@/clean-architecture/infrastructure/services/video-info.service.youtube";
import { YoutubeTranscriptVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.youtube-transcript";
import { LangChainVideoSummarizerService } from "@/clean-architecture/infrastructure/services/video-summarizer.service.langchain";
import { TranscriptWindowGeneratorService } from "@/clean-architecture/infrastructure/services/transcript-window-generator.service";
import { SupabaseEmbeddingService } from "@/clean-architecture/infrastructure/services/embedding.service.supabase";
import { DrizzleTranscriptWindowRepository } from "@/clean-architecture/infrastructure/repositories/transcript-window.repository.drizzle";
import { UpdateStreakUseCase } from "@/clean-architecture/use-cases/streak/update-streak.use-case";
import { DrizzleStreakRepository } from "@/clean-architecture/infrastructure/repositories/streak.repository.drizzle";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    const { url: encodedVideoUrl } = await params;
    const videoUrl = decodeURIComponent(encodedVideoUrl);

    logger.extension.debug("Processing video request", { videoUrl });

    try {
        // Authenticate using session cookie
        const { user, error: authError } = await getAuthenticatedUser();
        if (authError || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        if (!videoUrl) {
            return jsendFail({ error: "Missing video URL" }, 400);
        }

        const useCase = new ProcessVideoUseCase(
            new DrizzleVideoRepository(),
            new DrizzleSummaryRepository(),
            new DrizzleStudySetRepository(),
            new YouTubeVideoInfoService(),
            new YoutubeTranscriptVideoTranscriptService(),
            new LangChainVideoSummarizerService()
        );

        const result = await useCase.execute(user.id, videoUrl);

        // Background tasks for new videos (run after response sent)
        if (!result.alreadyExists && result.transcriptData) {
            const videoId = result.video.id;
            const { segments, fullText } = result.transcriptData;

            after(async () => {
                // 1. Store transcript
                try {
                    await new DrizzleTranscriptRepository().createTranscript(
                        videoId,
                        segments,
                        fullText
                    );
                    logger.extension.info("Transcript stored successfully", { videoId });
                } catch (error) {
                    logger.extension.error("Failed to store transcript", error, { videoId });
                }

                // 2. Generate embeddings for chat
                try {
                    const embeddingService = new SupabaseEmbeddingService();
                    const windowRepo = new DrizzleTranscriptWindowRepository();
                    const windowGenerator = new TranscriptWindowGeneratorService(embeddingService, windowRepo);

                    await windowGenerator.generate(videoId, segments);
                    logger.extension.info("Transcript windows generated successfully", { videoId });
                } catch (error) {
                    logger.extension.error("Failed to generate transcript windows", error, { videoId });
                }

                // 3. Update streak
                try {
                    await new UpdateStreakUseCase(new DrizzleStreakRepository()).execute(user.id);
                } catch (error) {
                    logger.streak.error("Failed to update streak", error, { userId: user.id });
                }
            });
        }

        return jsendSuccess({
            video_id: result.video.id,
            summary: result.summary.content,
            alreadyExists: result.alreadyExists,
            studySetPublicId: result.studySet.publicId,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        logger.extension.error("Error processing video", error, { videoUrl });
        return jsendError(`Failed to process video: ${errorMessage}`);
    }
}
