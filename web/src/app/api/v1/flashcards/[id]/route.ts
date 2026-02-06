import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { EditFlashcardUseCase } from "@/clean-architecture/use-cases/flashcard/edit-flashcard.use-case";
import { DeleteFlashcardUseCase } from "@/clean-architecture/use-cases/flashcard/delete-flashcard.use-case";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";

/**
 * PATCH /api/v1/flashcards/[id]
 * Update a flashcard's front and back text
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const flashcardId = parseInt(id, 10);

    if (isNaN(flashcardId)) {
      return jsendFail({ error: "Invalid flashcard ID" }, 400);
    }

    const body = await request.json();
    const { front, back } = body;

    // Validate required fields
    if (!front || typeof front !== "string") {
      return jsendFail({ error: "Front of flashcard is required" }, 400);
    }

    if (!back || typeof back !== "string") {
      return jsendFail({ error: "Back of flashcard is required" }, 400);
    }

    const useCase = new EditFlashcardUseCase(new DrizzleFlashcardRepository());

    const flashcard = await useCase.execute({
      userId: user.id,
      flashcardId,
      front,
      back,
    });

    return jsendSuccess({
      flashcard: {
        id: flashcard.id,
        videoId: flashcard.videoId,
        userId: flashcard.userId,
        front: flashcard.front,
        back: flashcard.back,
        createdAt: flashcard.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Map specific errors to appropriate HTTP status codes
    if (message === "Flashcard not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Not authorized to edit this flashcard") {
      return jsendFail({ error: message }, 403);
    }
    if (
      message.includes("cannot be empty") ||
      message.includes("cannot exceed")
    ) {
      return jsendFail({ error: message }, 400);
    }

    return jsendError(message);
  }
}

/**
 * DELETE /api/v1/flashcards/[id]
 * Delete a flashcard
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const flashcardId = parseInt(id, 10);

    if (isNaN(flashcardId)) {
      return jsendFail({ error: "Invalid flashcard ID" }, 400);
    }

    const useCase = new DeleteFlashcardUseCase(
      new DrizzleFlashcardRepository()
    );

    await useCase.execute({
      flashcardId,
      userId: user.id,
    });

    return jsendSuccess({ message: "Flashcard deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Flashcard not found") {
      return jsendFail({ error: message }, 404);
    }

    return jsendError(message);
  }
}
