// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { videos, userAnswers } from "@/drizzle/schema";
import { eq, count, gte, and } from "drizzle-orm";

export async function getWeeklyActivityByUserId(
    userId: string
): Promise<{ videosThisWeek: number; questionsThisWeek: number }> {
    if (!userId) {
        return { videosThisWeek: 0, questionsThisWeek: 0 };
    }

    // const supabase = await createServiceRoleClient();

    try {
        // Calculate start of this week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back to Monday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);

        // Get videos added this week
        // const { count: videosCount, error: videosError } = await supabase
        //     .from("videos")
        //     .select("*", { count: "exact", head: true })
        //     .eq("user_id", userId)
        //     .is("deleted_at", null)
        //     .gte("created_at", startOfWeek.toISOString());

        const videosResult = await db
            .select({ count: count() })
            .from(videos)
            .where(
                and(
                    eq(videos.userId, userId),
                    gte(videos.createdAt, startOfWeek.toISOString())
                )
            );

        // if (videosError) {
        //     logger.db.error("Database query error for videos", videosError, {
        //         userId,
        //     });
        //     throw videosError;
        // }

        // Get questions answered this week
        // Since we removed soft-delete, we can simplify - just count all answers this week

        // Get questions answered this week (only from non-deleted videos)
        // First, get valid video IDs
        // const { data: validVideos, error: validVideosError } = await supabase
        //     .from("videos")
        //     .select("id")
        //     .is("deleted_at", null);
        // if (validVideosError) {
        //     logger.db.error(
        //         "Database query error for valid videos",
        //         validVideosError,
        //         { userId }
        //     );
        //     throw validVideosError;
        // }

        // let questionsCount = 0;
        // if (validVideos && validVideos.length > 0) {
        //     const validVideoIds = validVideos.map(v => v.id);

        //     // Get valid question IDs
        //     const { data: validQuestions, error: validQuestionsError } =
        //         await supabase
        //             .from("questions")
        //             .select("id")
        //             .in("video_id", validVideoIds);
        //     if (validQuestionsError) {
        //         logger.db.error(
        //             "Database query error for valid questions",
        //             validQuestionsError,
        //             { userId }
        //         );
        //         throw validQuestionsError;
        //     }

        //     if (validQuestions && validQuestions.length > 0) {
        //         const validQuestionIds = validQuestions.map(q => q.id);

        //         // Count answers to valid questions this week
        //         const { count, error: questionsError } = await supabase
        //             .from("user_answers")
        //             .select("*", { count: "exact", head: true })
        //             .eq("user_id", userId)
        //             .in("question_id", validQuestionIds)
        //             .gte("created_at", startOfWeek.toISOString());
        //         if (questionsError) {
        //             logger.db.error(
        //                 "Database query error for questions",
        //                 questionsError,
        //                 { userId }
        //             );
        //             throw questionsError;
        //         }

        //         questionsCount = count || 0;
        //     }
        // }

        const questionsResult = await db
            .select({ count: count() })
            .from(userAnswers)
            .where(
                and(
                    eq(userAnswers.userId, userId),
                    gte(userAnswers.createdAt, startOfWeek.toISOString())
                )
            );

        const result = {
            videosThisWeek: videosResult[0]?.count || 0,
            questionsThisWeek: questionsResult[0]?.count || 0,
        };

        return result;
    } catch (error) {
        logger.db.error("Error fetching weekly activity by user ID", error, {
            userId,
        });
        return { videosThisWeek: 0, questionsThisWeek: 0 };
    }
}
