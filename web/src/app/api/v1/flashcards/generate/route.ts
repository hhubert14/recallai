import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GenerateFlashcardsUseCase } from "@/clean-architecture/use-cases/flashcard/generate-flashcards.use-case";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleTranscriptRepository } from "@/clean-architecture/infrastructure/repositories/transcript.repository.drizzle";
import { YoutubeTranscriptVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.youtube-transcript";
import { TranscriptResolverService } from "@/clean-architecture/infrastructure/services/transcript-resolver.service";
import { LangChainFlashcardGeneratorService } from "@/clean-architecture/infrastructure/services/flashcard-generator.service.langchain";

const VALID_COUNTS = [5, 10, 20];

export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const body = await request.json();
        const { videoId, count } = body;

        if (!videoId || typeof videoId !== "number") {
            return jsendFail({ error: "Missing or invalid videoId" }, 400);
        }

        if (!count || !VALID_COUNTS.includes(count)) {
            return jsendFail(
                {
                    error: `Invalid count. Must be one of: ${VALID_COUNTS.join(", ")}`,
                },
                400
            );
        }

        const useCase = new GenerateFlashcardsUseCase(
            new DrizzleVideoRepository(),
            new DrizzleFlashcardRepository(),
            new TranscriptResolverService(
                new DrizzleTranscriptRepository(),
                new YoutubeTranscriptVideoTranscriptService()
            ),
            new LangChainFlashcardGeneratorService()
        );

        const result = await useCase.execute(user.id, videoId, count);

        return jsendSuccess({
            flashcards: result.flashcards,
            total: result.total,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes("Video not found")) {
            return jsendFail({ error: message }, 404);
        }
        if (message.includes("Not authorized")) {
            return jsendFail({ error: message }, 403);
        }
        if (
            message.includes("Maximum flashcards reached") ||
            message.includes("Cannot generate")
        ) {
            return jsendFail({ error: message }, 400);
        }
        if (message.includes("transcript")) {
            return jsendFail({ error: message }, 400);
        }

        return jsendError(message);
    }
}
