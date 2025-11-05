// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userAnswers } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";

export async function getTotalQuestionsAnsweredByUserId(
    userId: string
): Promise<number> {
    if (!userId) {
        return 0;
    }

    // const supabase = await createServiceRoleClient();
    try {
        // Since we removed soft-delete, we can simplify to just count all user answers
        // Previously: Get valid videos → Get questions from those videos → Count answers
        // Now: Just count all answers by user

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

        // Finally, count user answers for these questions only
        // const { count, error } = await supabase
        //     .from("user_answers")
        //     .select("*", { count: "exact", head: true })
        //     .eq("user_id", userId)
        //     .in("question_id", validQuestionIds);
        // if (error) {
        //     logger.db.error("Database query error", error, { userId });
        //     throw error;
        // }

        const result = await db
            .select({ count: count() })
            .from(userAnswers)
            .where(eq(userAnswers.userId, userId));

        return result[0]?.count || 0;
    } catch (error) {
        logger.db.error(
            "Error fetching total questions answered by user ID",
            error,
            { userId }
        );
        return 0;
    }
}
