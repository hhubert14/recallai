import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProcessReviewAnswerUseCase } from "@/clean-architecture/use-cases/review/process-review-answer.use-case";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

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

    if (!reviewableItemId || typeof isCorrect !== "boolean") {
      return jsendFail({
        error: "Missing required fields: reviewableItemId, isCorrect",
      });
    }

    const useCase = new ProcessReviewAnswerUseCase(
      new DrizzleReviewProgressRepository()
    );

    const progress = await useCase.execute(user.id, reviewableItemId, isCorrect);

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
