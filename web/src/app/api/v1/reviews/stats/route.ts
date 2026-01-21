import { createClient } from "@/lib/supabase/server";
import { GetStudyModeStatsUseCase } from "@/clean-architecture/use-cases/progress/get-study-mode-stats.use-case";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
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

    const useCase = new GetStudyModeStatsUseCase(
      new DrizzleProgressRepository(),
      new DrizzleQuestionRepository()
    );

    const stats = await useCase.execute(user.id);

    return jsendSuccess({ stats });
  } catch (error) {
    return jsendError(String(error));
  }
}
