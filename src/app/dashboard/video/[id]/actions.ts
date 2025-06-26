"use server";

import { createUserAnswer } from "@/data-access/user-answers/create-user-answer";
import { CreateUserAnswerDto } from "@/data-access/user-answers/types";
import { logger } from "@/lib/logger";

export async function submitAnswer(userAnswer: CreateUserAnswerDto): Promise<boolean> {    try {
        return await createUserAnswer(userAnswer);
    } catch (error) {
        logger.db.error("Error submitting answer", error, { questionId: userAnswer.question_id, userId: userAnswer.user_id });
        return false;
    }
}
