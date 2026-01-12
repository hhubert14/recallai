import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";
import { ProcessVideoUseCase } from "@/clean-architecture/use-cases/video/process-video.use-case";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleTranscriptRepository } from "@/clean-architecture/infrastructure/repositories/transcript.repository.drizzle";
import { YouTubeVideoInfoService } from "@/clean-architecture/infrastructure/services/video-info.service.youtube";
import { YoutubeTranscriptVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.youtube-transcript";
import { LangChainVideoSummarizerService } from "@/clean-architecture/infrastructure/services/video-summarizer.service.langchain";
import { TranscriptWindowGeneratorService } from "@/clean-architecture/infrastructure/services/transcript-window-generator.service";
import { SupabaseEmbeddingService } from "@/clean-architecture/infrastructure/services/embedding.service.supabase";
import { DrizzleTranscriptWindowRepository } from "@/clean-architecture/infrastructure/repositories/transcript-window.repository.drizzle";

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
            new DrizzleTranscriptRepository(),
            new YouTubeVideoInfoService(),
            new YoutubeTranscriptVideoTranscriptService(),
            new LangChainVideoSummarizerService(),
            new TranscriptWindowGeneratorService(new SupabaseEmbeddingService(), new DrizzleTranscriptWindowRepository())
        );

        const result = await useCase.execute(user.id, videoUrl);

        return jsendSuccess({
            video_id: result.video.id,
            summary: result.summary.content,
            alreadyExists: result.alreadyExists,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        logger.extension.error("Error processing video", error, { videoUrl });
        return jsendError(`Failed to process video: ${errorMessage}`);
    }
}
