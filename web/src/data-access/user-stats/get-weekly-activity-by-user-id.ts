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

    try {
        // Calculate start of this week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back to Monday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);

        const videosResult = await db
            .select({ count: count() })
            .from(videos)
            .where(
                and(
                    eq(videos.userId, userId),
                    gte(videos.createdAt, startOfWeek.toISOString())
                )
            );

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
