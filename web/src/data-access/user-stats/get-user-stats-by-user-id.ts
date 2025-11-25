// import "server-only";
import { UserStatsDto } from "./types";
import { getTotalVideosByUserId } from "./get-total-videos-by-user-id";
import { getTotalQuestionsAnsweredByUserId } from "./get-total-questions-answered-by-user-id";
import { getQuizAccuracyByUserId } from "./get-quiz-accuracy-by-user-id";
import { getWeeklyActivityByUserId } from "./get-weekly-activity-by-user-id";
import { logger } from "@/lib/logger";

export async function getUserStatsByUserId(
    userId: string
): Promise<UserStatsDto> {
    if (!userId) {
        logger.db.warn("Invalid parameters - userId is empty");
        return {
            totalVideos: 0,
            totalQuestionsAnswered: 0,
            quizAccuracy: 0,
            videosThisWeek: 0,
            questionsThisWeek: 0,
        };
    }

    try {
        const [
            totalVideos,
            totalQuestionsAnswered,
            quizAccuracy,
            weeklyActivity,
        ] = await Promise.all([
            getTotalVideosByUserId(userId),
            getTotalQuestionsAnsweredByUserId(userId),
            getQuizAccuracyByUserId(userId),
            getWeeklyActivityByUserId(userId),
        ]);

        const stats: UserStatsDto = {
            totalVideos,
            totalQuestionsAnswered,
            quizAccuracy,
            videosThisWeek: weeklyActivity.videosThisWeek,
            questionsThisWeek: weeklyActivity.questionsThisWeek,
        };

        return stats;
    } catch (error) {
        logger.db.error("Error fetching user stats", error, { userId });
        return {
            totalVideos: 0,
            totalQuestionsAnswered: 0,
            quizAccuracy: 0,
            videosThisWeek: 0,
            questionsThisWeek: 0,
        };
    }
}
