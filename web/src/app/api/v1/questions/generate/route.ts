import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GenerateMultipleChoiceQuestionsUseCase } from "@/clean-architecture/use-cases/question/generate-multiple-choice-questions.use-case";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { StrapiVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.strapi";
import { LangChainQuestionGeneratorService } from "@/clean-architecture/infrastructure/services/question-generator.service.langchain";

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

        const useCase = new GenerateMultipleChoiceQuestionsUseCase(
            new DrizzleVideoRepository(),
            new DrizzleQuestionRepository(),
            new StrapiVideoTranscriptService(),
            new LangChainQuestionGeneratorService()
        );

        const result = await useCase.execute(user.id, videoId, count);

        return jsendSuccess({
            questions: result.questions,
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
            message.includes("Maximum questions reached") ||
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
