import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { FindStudySetByPublicIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-public-id.use-case";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const studySetPublicIdParam = searchParams.get("studySetPublicId");

    // Resolve studySetPublicId to studySetId if provided
    let studySetId: number | undefined;
    if (studySetPublicIdParam) {
      const studySetRepository = new DrizzleStudySetRepository();
      const findStudySetUseCase = new FindStudySetByPublicIdUseCase(studySetRepository);
      const studySet = await findStudySetUseCase.execute(studySetPublicIdParam, user.id);
      if (!studySet) {
        return jsendFail({ error: "Study set not found" }, 404);
      }
      studySetId = studySet.id;
    }

    const useCase = new GetReviewStatsUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleReviewProgressRepository()
    );

    const stats = await useCase.execute(user.id, studySetId);

    return jsendSuccess({ stats });
  } catch (error) {
    return jsendError(String(error));
  }
}
