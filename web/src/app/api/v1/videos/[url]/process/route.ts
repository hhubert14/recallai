import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";
import { ProcessVideoUseCase } from "@/clean-architecture/use-cases/video/process-video.use-case";
import {
    createVideoRepository,
    createSummaryRepository,
    createQuestionRepository,
} from "@/clean-architecture/infrastructure/factories/repository.factory";
import { YouTubeVideoInfoService } from "@/clean-architecture/infrastructure/services/video-info.service.youtube";
import { StrapiVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.strapi";
import { OpenAIVideoClassifierService } from "@/clean-architecture/infrastructure/services/video-classifier.service.openai";
import { LangChainVideoSummarizerService } from "@/clean-architecture/infrastructure/services/video-summarizer.service.langchain";
import { LangChainQuestionGeneratorService } from "@/clean-architecture/infrastructure/services/question-generator.service.langchain";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

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
            createVideoRepository(),
            createSummaryRepository(),
            createQuestionRepository(),
            new YouTubeVideoInfoService(),
            new StrapiVideoTranscriptService(),
            new OpenAIVideoClassifierService(),
            new LangChainVideoSummarizerService(),
            new LangChainQuestionGeneratorService()
        );

        const result = await useCase.execute(user.id, videoUrl);

        return jsendSuccess({
            video_id: result.video.id,
            summary: result.summary.content,
            questions: result.questions.map(q => ({
                id: q.id,
                question: q.questionText,
                options: q.options.map(o => o.optionText),
            })),
            alreadyExists: result.alreadyExists || false,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        logger.extension.error("Error processing video", error, { videoUrl });
        return jsendError(`Failed to process video: ${errorMessage}`);
    }
}
