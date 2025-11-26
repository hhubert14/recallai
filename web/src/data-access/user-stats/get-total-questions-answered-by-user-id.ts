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

    try {

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
