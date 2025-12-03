import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repositories } from "@/lib/dependency-injection";
import { ProcessSpacedRepetitionAnswerUseCase } from "@/clean-architecture/use-cases/progress/process-spaced-repetition-answer.use-case";
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
    const { questionId, isCorrect } = body;

    if (!questionId || typeof isCorrect !== "boolean") {
      return jsendFail({
        error: "Missing required fields: questionId, isCorrect",
      });
    }

    const useCase = new ProcessSpacedRepetitionAnswerUseCase(
      repositories.progress()
    );

    const progress = await useCase.execute(user.id, questionId, isCorrect);

    return jsendSuccess({ progress });
  } catch (error) {
    return jsendError(String(error));
  }
}
