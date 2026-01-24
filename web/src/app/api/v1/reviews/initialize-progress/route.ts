import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { InitializeReviewProgressUseCase } from "@/clean-architecture/use-cases/review/initialize-review-progress.use-case";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

type ItemIdentifiers = {
  reviewableItemId?: number;
  questionId?: number;
  flashcardId?: number;
};

async function resolveReviewableItemId(
  identifiers: ItemIdentifiers,
  repo: IReviewableItemRepository
): Promise<number | null> {
  // Direct ID takes priority
  if (identifiers.reviewableItemId) {
    return identifiers.reviewableItemId;
  }

  // Try question lookup
  if (identifiers.questionId) {
    const item = await repo.findReviewableItemByQuestionId(
      identifiers.questionId
    );
    return item?.id ?? null;
  }

  // Try flashcard lookup
  if (identifiers.flashcardId) {
    const item = await repo.findReviewableItemByFlashcardId(
      identifiers.flashcardId
    );
    return item?.id ?? null;
  }

  return null;
}

/**
 * POST /api/v1/reviews/initialize-progress
 *
 * Initializes review progress for a reviewable item from the video page.
 * This is called when a user first answers a question during video learning.
 *
 * Unlike submit-review-answer (used by the Review page), this endpoint:
 * - Only creates progress if none exists (no-op if progress exists)
 * - Correct answers start at box 2 (faster graduation)
 * - Incorrect answers start at box 1 (more practice)
 *
 * Request body:
 * - questionId: number (required for video page questions)
 * - isCorrect: boolean (required)
 *
 * Response:
 * - progress: the progress record (new or existing)
 * - created: boolean indicating if a new record was created
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const { reviewableItemId, questionId, flashcardId, isCorrect } = body;

    if (typeof isCorrect !== "boolean") {
      return jsendFail({ error: "Missing required field: isCorrect" });
    }

    const reviewableItemRepo = new DrizzleReviewableItemRepository();
    const resolvedReviewableItemId = await resolveReviewableItemId(
      { reviewableItemId, questionId, flashcardId },
      reviewableItemRepo
    );

    if (!resolvedReviewableItemId) {
      return jsendFail(
        {
          error:
            "Must provide a valid reviewableItemId, questionId, or flashcardId",
        },
        400
      );
    }

    const useCase = new InitializeReviewProgressUseCase(
      new DrizzleReviewProgressRepository()
    );

    const result = await useCase.execute(
      user.id,
      resolvedReviewableItemId,
      isCorrect
    );

    return jsendSuccess({
      progress: {
        id: result.progress.id,
        reviewableItemId: result.progress.reviewableItemId,
        boxLevel: result.progress.boxLevel,
        nextReviewDate: result.progress.nextReviewDate,
        timesCorrect: result.progress.timesCorrect,
        timesIncorrect: result.progress.timesIncorrect,
        lastReviewedAt: result.progress.lastReviewedAt,
      },
      created: result.created,
    });
  } catch (error) {
    return jsendError(String(error));
  }
}
