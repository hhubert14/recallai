// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userQuestionProgress } from "@/drizzle/schema";
import { eq, lte, isNotNull, and, count } from "drizzle-orm";

export type ReviewStatsDto = {
    questionsDueToday: number;
    totalQuestionsInSystem: number;
    questionsInBox1: number;
    questionsInBox2: number;
    questionsInBox3: number;
    questionsInBox4: number;
    questionsInBox5: number;
};

export async function getReviewStats(userId: string): Promise<ReviewStatsDto> {
    if (!userId) {
        return {
            questionsDueToday: 0,
            totalQuestionsInSystem: 0,
            questionsInBox1: 0,
            questionsInBox2: 0,
            questionsInBox3: 0,
            questionsInBox4: 0,
            questionsInBox5: 0,
        };
    }

    // const supabase = await createServiceRoleClient();

    try {
        const today = new Date().toISOString().split("T")[0];

        // Get questions due today
        const dueTodayResult = await db
            .select({ count: count() })
            .from(userQuestionProgress)
            .where(
                and(
                    eq(userQuestionProgress.userId, userId),
                    lte(userQuestionProgress.nextReviewDate, today),
                    isNotNull(userQuestionProgress.nextReviewDate)
                )
            );

        // Get total questions in system
        const totalResult = await db
            .select({ count: count() })
            .from(userQuestionProgress)
            .where(eq(userQuestionProgress.userId, userId));

        // Get questions by box level
        const boxData = await db
            .select({ boxLevel: userQuestionProgress.boxLevel })
            .from(userQuestionProgress)
            .where(eq(userQuestionProgress.userId, userId));

        // Count questions by box
        const boxCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        if (boxData) {
            boxData.forEach(row => {
                const boxLevel = row.boxLevel;
                if (boxLevel && boxLevel >= 1 && boxLevel <= 5) {
                    boxCounts[boxLevel as keyof typeof boxCounts]++;
                }
            });
        }

        return {
            questionsDueToday: dueTodayResult[0]?.count || 0,
            totalQuestionsInSystem: totalResult[0]?.count || 0,
            questionsInBox1: boxCounts[1],
            questionsInBox2: boxCounts[2],
            questionsInBox3: boxCounts[3],
            questionsInBox4: boxCounts[4],
            questionsInBox5: boxCounts[5],
        };
    } catch (error) {
        logger.db.error("Error fetching review stats", error, { userId });
        return {
            questionsDueToday: 0,
            totalQuestionsInSystem: 0,
            questionsInBox1: 0,
            questionsInBox2: 0,
            questionsInBox3: 0,
            questionsInBox4: 0,
            questionsInBox5: 0,
        };
    }
}
