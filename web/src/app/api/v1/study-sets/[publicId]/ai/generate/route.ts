import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GenerateSuggestionsUseCase } from "@/clean-architecture/use-cases/ai/generate-suggestions.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleTranscriptRepository } from "@/clean-architecture/infrastructure/repositories/transcript.repository.drizzle";
import { TranscriptResolverService } from "@/clean-architecture/infrastructure/services/transcript-resolver.service";
import { YoutubeTranscriptVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.youtube-transcript";
import { LangChainSuggestionGeneratorService } from "@/clean-architecture/infrastructure/services/suggestion-generator.service.langchain";
import type { SuggestionItemType } from "@/clean-architecture/domain/services/suggestion-generator.interface";

const MIN_COUNT = 1;
const MAX_COUNT = 100;

/**
 * POST /api/v1/study-sets/[publicId]/ai/generate
 * Generate AI suggestions for a study set (in-memory, not persisted)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const { publicId } = await params;
        const body = await request.json();
        const { prompt, count, itemType: rawItemType } = body;

        // Validate required fields
        if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
            return jsendFail({ error: "Prompt is required" }, 400);
        }

        // Validate itemType
        const validItemTypes: SuggestionItemType[] = ["mix", "flashcards", "questions"];
        const itemType: SuggestionItemType = validItemTypes.includes(rawItemType)
            ? rawItemType
            : "mix";

        // Validate count
        const parsedCount = Number(count);
        if (isNaN(parsedCount) || parsedCount < MIN_COUNT || parsedCount > MAX_COUNT) {
            return jsendFail(
                { error: `Count must be a number between ${MIN_COUNT} and ${MAX_COUNT}` },
                400
            );
        }

        // Build dependencies
        const studySetRepository = new DrizzleStudySetRepository();
        const videoRepository = new DrizzleVideoRepository();
        const transcriptRepository = new DrizzleTranscriptRepository();
        const videoTranscriptService = new YoutubeTranscriptVideoTranscriptService();
        const transcriptResolverService = new TranscriptResolverService(
            transcriptRepository,
            videoTranscriptService
        );
        const suggestionGeneratorService = new LangChainSuggestionGeneratorService();

        const useCase = new GenerateSuggestionsUseCase(
            studySetRepository,
            videoRepository,
            transcriptResolverService,
            suggestionGeneratorService
        );

        const result = await useCase.execute({
            studySetPublicId: publicId,
            userId: user.id,
            prompt: prompt.trim(),
            count: parsedCount,
            itemType,
        });

        return jsendSuccess({ suggestions: result.suggestions });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Map specific errors to appropriate HTTP status codes
        if (message === "Study set not found") {
            return jsendFail({ error: message }, 404);
        }
        if (message === "Not authorized to access this study set") {
            return jsendFail({ error: message }, 403);
        }
        if (message === "Video not found for this study set") {
            return jsendFail({ error: message }, 404);
        }
        if (message === "Invalid video URL - could not extract video ID") {
            return jsendFail({ error: message }, 400);
        }
        if (message === "Prompt is required") {
            return jsendFail({ error: message }, 400);
        }
        if (message.includes("Count must be between")) {
            return jsendFail({ error: message }, 400);
        }
        if (message.includes("Failed to fetch video transcript")) {
            return jsendFail({ error: message }, 400);
        }
        if (message === "Failed to generate suggestions") {
            return jsendError("AI generation failed. Please try again.");
        }

        return jsendError(message);
    }
}
