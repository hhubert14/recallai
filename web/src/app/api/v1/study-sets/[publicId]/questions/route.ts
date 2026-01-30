import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { AddQuestionToStudySetUseCase } from "@/clean-architecture/use-cases/question/add-question-to-study-set.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";

/**
 * POST /api/v1/study-sets/[publicId]/questions
 * Add a new question to a study set
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
        const { questionText, options } = body;

        // Validate required fields
        if (!questionText || typeof questionText !== "string") {
            return jsendFail({ error: "Question text is required" }, 400);
        }

        if (!options || !Array.isArray(options)) {
            return jsendFail({ error: "Options array is required" }, 400);
        }

        const useCase = new AddQuestionToStudySetUseCase(
            new DrizzleStudySetRepository(),
            new DrizzleQuestionRepository(),
            new DrizzleReviewableItemRepository()
        );

        const question = await useCase.execute({
            userId: user.id,
            studySetPublicId: publicId,
            questionText,
            options,
        });

        return jsendSuccess(
            {
                question: {
                    id: question.id,
                    videoId: question.videoId,
                    questionText: question.questionText,
                    options: question.options.map(opt => ({
                        id: opt.id,
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect,
                        explanation: opt.explanation,
                    })),
                },
            },
            201
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Map specific errors to appropriate HTTP status codes
        if (message === "Study set not found") {
            return jsendFail({ error: message }, 404);
        }
        if (message === "Not authorized to add items to this study set") {
            return jsendFail({ error: message }, 403);
        }
        if (
            message.includes("cannot be empty") ||
            message.includes("must have exactly") ||
            message.includes("must be non-empty") ||
            message.includes("maximum limit")
        ) {
            return jsendFail({ error: message }, 400);
        }

        return jsendError(message);
    }
}
