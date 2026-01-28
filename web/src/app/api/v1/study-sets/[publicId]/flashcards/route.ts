import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { AddFlashcardToStudySetUseCase } from "@/clean-architecture/use-cases/flashcard/add-flashcard-to-study-set.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";

/**
 * POST /api/v1/study-sets/[publicId]/flashcards
 * Add a new flashcard to a study set
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
        const { front, back } = body;

        // Validate required fields
        if (!front || typeof front !== "string") {
            return jsendFail({ error: "Front of flashcard is required" }, 400);
        }

        if (!back || typeof back !== "string") {
            return jsendFail({ error: "Back of flashcard is required" }, 400);
        }

        const useCase = new AddFlashcardToStudySetUseCase(
            new DrizzleStudySetRepository(),
            new DrizzleFlashcardRepository(),
            new DrizzleReviewableItemRepository()
        );

        const flashcard = await useCase.execute({
            userId: user.id,
            studySetPublicId: publicId,
            front,
            back,
        });

        return jsendSuccess(
            {
                flashcard: {
                    id: flashcard.id,
                    videoId: flashcard.videoId,
                    userId: flashcard.userId,
                    front: flashcard.front,
                    back: flashcard.back,
                    createdAt: flashcard.createdAt,
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
        if (message.includes("cannot be empty") || message.includes("maximum limit")) {
            return jsendFail({ error: message }, 400);
        }

        return jsendError(message);
    }
}
