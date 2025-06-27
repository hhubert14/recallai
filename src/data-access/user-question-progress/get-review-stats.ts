import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

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
            questionsInBox5: 0
        };
    }

    const supabase = await createServiceRoleClient();

    try {
        const today = new Date().toISOString().split('T')[0];

        // Get questions due today
        const { count: questionsDueToday, error: dueTodayError } = await supabase
            .from("user_question_progress")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .lte("next_review_date", today)
            .not("next_review_date", "is", null);

        if (dueTodayError) {
            logger.db.error("Error fetching questions due today", dueTodayError, { userId });
        }

        // Get total questions in system
        const { count: totalQuestions, error: totalError } = await supabase
            .from("user_question_progress")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId);

        if (totalError) {
            logger.db.error("Error fetching total questions", totalError, { userId });
        }

        // Get questions by box level
        const { data: boxData, error: boxError } = await supabase
            .from("user_question_progress")
            .select("box_level")
            .eq("user_id", userId);

        if (boxError) {
            logger.db.error("Error fetching box distribution", boxError, { userId });
        }

        // Count questions by box
        const boxCounts = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        if (boxData) {
            boxData.forEach(row => {
                const boxLevel = row.box_level;
                if (boxLevel >= 1 && boxLevel <= 5) {
                    boxCounts[boxLevel as keyof typeof boxCounts]++;
                }
            });
        }

        return {
            questionsDueToday: questionsDueToday || 0,
            totalQuestionsInSystem: totalQuestions || 0,
            questionsInBox1: boxCounts[1],
            questionsInBox2: boxCounts[2],
            questionsInBox3: boxCounts[3],
            questionsInBox4: boxCounts[4],
            questionsInBox5: boxCounts[5]
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
            questionsInBox5: 0
        };
    }
}
