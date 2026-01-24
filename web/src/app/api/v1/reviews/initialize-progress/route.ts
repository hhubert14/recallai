import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  InitializeReviewProgressUseCase,
  ReviewableItemNotFoundError,
} from "@/clean-architecture/use-cases/review/initialize-review-progress.use-case";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

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
 * - reviewableItemId OR questionId OR flashcardId: number (at least one required)
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

    const useCase = new InitializeReviewProgressUseCase(
      new DrizzleReviewProgressRepository(),
      new DrizzleReviewableItemRepository()
    );

    const result = await useCase.execute({
      userId: user.id,
      isCorrect,
      reviewableItemId,
      questionId,
      flashcardId,
    });

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
    if (error instanceof ReviewableItemNotFoundError) {
      return jsendFail({ error: error.message }, 400);
    }
    return jsendError(String(error));
  }
}
