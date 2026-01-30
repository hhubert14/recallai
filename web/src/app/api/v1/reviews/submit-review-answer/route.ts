import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProcessReviewAnswerUseCase } from "@/clean-architecture/use-cases/review/process-review-answer.use-case";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { UpdateStreakUseCase } from "@/clean-architecture/use-cases/streak/update-streak.use-case";
import { DrizzleStreakRepository } from "@/clean-architecture/infrastructure/repositories/streak.repository.drizzle";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

/**
 * POST /api/v1/reviews/submit-review-answer
 *
 * Submits an answer for a reviewable item from the Review page.
 * This is used during spaced repetition review sessions.
 *
 * This endpoint applies the Leitner algorithm:
 * - Correct answer → move up one box (max 5)
 * - Incorrect answer → reset to box 1
 *
 * Request body:
 * - reviewableItemId: number (required)
 * - isCorrect: boolean (required)
 *
 * Response:
 * - progress: the updated progress record
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
    const { reviewableItemId, isCorrect } = body;

    if (typeof reviewableItemId !== "number") {
      return jsendFail({ error: "Missing required field: reviewableItemId" });
    }

    if (typeof isCorrect !== "boolean") {
      return jsendFail({ error: "Missing required field: isCorrect" });
    }

    const useCase = new ProcessReviewAnswerUseCase(
      new DrizzleReviewProgressRepository()
    );

    const progress = await useCase.execute(user.id, reviewableItemId, isCorrect);

    // Update streak (non-blocking)
    new UpdateStreakUseCase(new DrizzleStreakRepository())
      .execute(user.id)
      .catch(console.error);

    return jsendSuccess({
      progress: {
        id: progress.id,
        reviewableItemId: progress.reviewableItemId,
        boxLevel: progress.boxLevel,
        nextReviewDate: progress.nextReviewDate,
        timesCorrect: progress.timesCorrect,
        timesIncorrect: progress.timesIncorrect,
        lastReviewedAt: progress.lastReviewedAt,
      },
    });
  } catch (error) {
    return jsendError(String(error));
  }
}
