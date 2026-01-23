import { createClient } from "@/lib/supabase/server";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const useCase = new GetReviewStatsUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleReviewProgressRepository()
    );

    const stats = await useCase.execute(user.id);

    return jsendSuccess({ stats });
  } catch (error) {
    return jsendError(String(error));
  }
}
