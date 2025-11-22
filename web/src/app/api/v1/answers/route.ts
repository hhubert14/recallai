import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateMultipleChoiceAnswerUseCase } from "@/clean-architecture/use-cases/answer/create-multiple-choice-answer.use-case";
import { createAnswerRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
// import { logger } from "@/lib/logger";
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
        const { questionId, selectedOptionId, isCorrect } = body;

        if (!questionId || !selectedOptionId || typeof isCorrect !== "boolean") {
            return jsendFail({
                error: "Missing required fields: questionId, selectedOptionId, isCorrect"
            });
        }

        const answerRepository = createAnswerRepository();
        const useCase = new CreateMultipleChoiceAnswerUseCase(answerRepository);

        const answer = await useCase.execute(
            user.id,
            questionId,
            selectedOptionId,
            isCorrect
        );

        return jsendSuccess({ answer });
    } catch (error) {
        // logger.api.error("Error creating answer", error);
        return jsendError(String(error));
    }
}
