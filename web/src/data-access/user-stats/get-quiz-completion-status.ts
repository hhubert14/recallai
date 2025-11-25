// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { questions, userAnswers } from "@/drizzle/schema";
import { eq, inArray, and } from "drizzle-orm";

export async function getQuizCompletionStatus(
    userId: string,
    videoId: number
): Promise<boolean> {
    if (!userId || !videoId) {
        return false;
    }

    try {
        const questionsList = await db
            .select({ id: questions.id })
            .from(questions)
            .where(eq(questions.videoId, videoId));

        if (!questionsList || questionsList.length === 0) {
            return false; // No questions = can't be completed
        }

        // Get user answers for this video
        const questionIds = questionsList.map(q => q.id);

        const userAnswersList = await db
            .select({ questionId: userAnswers.questionId })
            .from(userAnswers)
            .where(
                and(
                    eq(userAnswers.userId, userId),
                    inArray(userAnswers.questionId, questionIds)
                )
            );

        if (!userAnswersList) {
            return false;
        }

        // Check if user answered ALL questions
        const answeredQuestionIds = userAnswersList.map(a => a.questionId);
        const allQuestionsAnswered = questionsList.every(q =>
            answeredQuestionIds.includes(q.id)
        );

        return allQuestionsAnswered;
    } catch (error) {
        logger.db.error("Error checking quiz completion status", error, {
            userId,
            videoId,
        });
        return false;
    }
}
