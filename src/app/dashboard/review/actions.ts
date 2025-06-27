"use server";

import { processSpacedRepetitionAnswer } from "@/data-access/user-question-progress/process-spaced-repetition-answer";
import { createUserAnswer } from "@/data-access/user-answers/create-user-answer";
import { CreateUserAnswerDto } from "@/data-access/user-answers/types";
import { logger } from "@/lib/logger";

export async function processReviewAnswer(userAnswer: CreateUserAnswerDto): Promise<boolean> {
    try {
        // Save the user answer (same as existing quiz system)
        const answerSaved = await createUserAnswer(userAnswer);
        
        // Process for spaced repetition
        const progressUpdated = await processSpacedRepetitionAnswer(
            userAnswer.user_id,
            userAnswer.question_id,
            userAnswer.is_correct
        );

        return answerSaved && progressUpdated;
    } catch (error) {
        logger.db.error("Error processing review answer", error, { 
            questionId: userAnswer.question_id, 
            userId: userAnswer.user_id 
        });
        return false;
    }
}
