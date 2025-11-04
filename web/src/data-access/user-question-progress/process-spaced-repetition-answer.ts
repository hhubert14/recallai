// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createUserQuestionProgress } from "./create-user-question-progress";
import { updateUserQuestionProgress } from "./update-user-question-progress";
import { calculateProgressUpdate, getNextReviewDate } from "./utils";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userQuestionProgress } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function processSpacedRepetitionAnswer(
    userId: string,
    questionId: number,
    isCorrect: boolean
): Promise<boolean> {
    // const supabase = await createServiceRoleClient();

    try {
        // Check if progress already exists
        // const { data: existingProgress, error: fetchError } = await supabase
        //     .from("user_question_progress")
        //     .select("*")
        //     .eq("user_id", userId)
        //     .eq("question_id", questionId)
        //     .single();

        const [existingProgress] = await db
            .select()
            .from(userQuestionProgress)
            .where(
                and(
                    eq(userQuestionProgress.userId, userId),
                    eq(userQuestionProgress.questionId, questionId)
                )
            )
            .limit(1);

        // if (fetchError && fetchError.code !== "PGRST116") {
        //     // PGRST116 = no rows returned
        //     logger.db.error("Error fetching existing progress", fetchError, {
        //         userId,
        //         questionId,
        //     });
        //     throw fetchError;
        // }

        if (existingProgress) {
            // Update existing progress
            const progressUpdate = calculateProgressUpdate(
                existingProgress.boxLevel ?? 1,
                isCorrect,
                existingProgress.timesCorrect ?? 0,
                existingProgress.timesIncorrect ?? 0
            );

            return await updateUserQuestionProgress(
                userId,
                questionId,
                progressUpdate
            );
        } else {
            // Create new progress entry
            const newBoxLevel = isCorrect ? 1 : 1; // Start in box 1 regardless
            const nextReviewDate = getNextReviewDate(newBoxLevel);

            return await createUserQuestionProgress({
                userId,
                questionId,
                boxLevel: newBoxLevel,
                nextReviewDate,
                timesCorrect: isCorrect ? 1 : 0,
                timesIncorrect: isCorrect ? 0 : 1,
                lastReviewedAt: new Date().toISOString(),
            });
        }
    } catch (error) {
        logger.db.error("Error processing spaced repetition answer", error, {
            userId,
            questionId,
            isCorrect,
        });
        return false;
    }
}
