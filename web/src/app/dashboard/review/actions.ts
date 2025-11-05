"use server";

import { processSpacedRepetitionAnswer } from "@/data-access/user-question-progress/process-spaced-repetition-answer";
import { CreateUserAnswerDto } from "@/data-access/user-answers/types";
import { logger } from "@/lib/logger";

export async function processReviewAnswer(
    userAnswer: CreateUserAnswerDto
): Promise<boolean> {
    try {
        // For review questions, we don't need to create another user_answer record
        // since they already answered this question in the video quiz
        // We only need to process for spaced repetition

        const progressUpdated = await processSpacedRepetitionAnswer(
            userAnswer.userId,
            userAnswer.questionId,
            userAnswer.isCorrect
        );

        return progressUpdated;
    } catch (error) {
        logger.db.error("Error processing review answer", error, {
            questionId: userAnswer.questionId,
            userId: userAnswer.userId,
        });
        return false;
    }
}
