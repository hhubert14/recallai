// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userAnswers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getQuizAccuracyByUserId(userId: string): Promise<number> {
    if (!userId) {
        return 0;
    }

    // const supabase = await createServiceRoleClient();
    try {
        // Since we removed soft-delete, we can simplify to just get all user answers
        // Previously: Get valid videos → Get questions from those videos → Get answers
        // Now: Just get all answers by user

        // First, get all video IDs that are not soft-deleted
        // const { data: validVideos, error: videoError } = await supabase
        //     .from("videos")
        //     .select("id")
        //     .is("deleted_at", null);
        // if (videoError) {
        //     logger.db.error("Database query error for videos", videoError, {
        //         userId,
        //     });
        //     throw videoError;
        // }

        // if (!validVideos || validVideos.length === 0) {
        //     return 0;
        // }

        // const validVideoIds = validVideos.map(v => v.id);

        // Then, get all question IDs from these videos
        // const { data: validQuestions, error: questionError } = await supabase
        //     .from("questions")
        //     .select("id")
        //     .in("video_id", validVideoIds);
        // if (questionError) {
        //     logger.db.error(
        //         "Database query error for questions",
        //         questionError,
        //         { userId }
        //     );
        //     throw questionError;
        // }

        // if (!validQuestions || validQuestions.length === 0) {
        //     return 0;
        // }

        // const validQuestionIds = validQuestions.map(q => q.id);

        // Finally, get user answers for these questions only
        // const { data, error } = await supabase
        //     .from("user_answers")
        //     .select("is_correct")
        //     .eq("user_id", userId)
        //     .in("question_id", validQuestionIds);
        // if (error) {
        //     logger.db.error("Database query error", error, { userId });
        //     throw error;
        // }

        const data = await db
            .select({ isCorrect: userAnswers.isCorrect })
            .from(userAnswers)
            .where(eq(userAnswers.userId, userId));

        if (!data || data.length === 0) {
            return 0;
        }

        const totalAnswers = data.length;
        const correctAnswers = data.filter(answer => answer.isCorrect).length;
        const accuracy = (correctAnswers / totalAnswers) * 100;

        return Math.round(accuracy);
    } catch (error) {
        logger.db.error("Error fetching quiz accuracy by user ID", error, {
            userId,
        });
        return 0;
    }
}
