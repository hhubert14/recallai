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

    try {
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
