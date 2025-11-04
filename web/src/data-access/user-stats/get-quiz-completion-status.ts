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

    // const supabase = await createServiceRoleClient();

    try {
        // Get all questions for this video
        // const { data: questions, error: questionsError } = await supabase
        //     .from("questions")
        //     .select("id")
        //     .eq("video_id", videoId);

        const questionsList = await db
            .select({ id: questions.id })
            .from(questions)
            .where(eq(questions.videoId, videoId));

        // if (questionsError) {
        //     logger.db.error("Error fetching questions", questionsError, {
        //         userId,
        //         videoId,
        //     });
        //     return false;
        // }

        if (!questionsList || questionsList.length === 0) {
            return false; // No questions = can't be completed
        }

        // Get user answers for this video
        const questionIds = questionsList.map(q => q.id);
        // const { data: userAnswers, error: answersError } = await supabase
        //     .from("user_answers")
        //     .select("question_id")
        //     .eq("user_id", userId)
        //     .in("question_id", questionIds);

        const userAnswersList = await db
            .select({ questionId: userAnswers.questionId })
            .from(userAnswers)
            .where(
                and(
                    eq(userAnswers.userId, userId),
                    inArray(userAnswers.questionId, questionIds)
                )
            );

        // if (answersError) {
        //     logger.db.error("Error fetching user answers", answersError, {
        //         userId,
        //         videoId,
        //     });
        //     return false;
        // }

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
