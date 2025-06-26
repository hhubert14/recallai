import "server-only";
import { UserStatsDto } from "./types";
import { getTotalVideosByUserId } from "./get-total-videos-by-user-id";
import { getTotalQuestionsAnsweredByUserId } from "./get-total-questions-answered-by-user-id";
import { getQuizAccuracyByUserId } from "./get-quiz-accuracy-by-user-id";
import { getWeeklyActivityByUserId } from "./get-weekly-activity-by-user-id";
import { logger } from "@/lib/logger";

export async function getUserStatsByUserId(userId: string): Promise<UserStatsDto> {
    logger.db.debug("Getting user stats", { userId });
      if (!userId) {
        logger.db.warn("Invalid parameters - userId is empty");
        return {
            totalVideos: 0,
            totalQuestionsAnswered: 0,
            quizAccuracy: 0,
            videosThisWeek: 0,
            questionsThisWeek: 0
        };
    }

    try {
        // Fetch all stats in parallel
        const [
            totalVideos,
            totalQuestionsAnswered,
            quizAccuracy,
            weeklyActivity
        ] = await Promise.all([
            getTotalVideosByUserId(userId),
            getTotalQuestionsAnsweredByUserId(userId),
            getQuizAccuracyByUserId(userId),
            getWeeklyActivityByUserId(userId)
        ]);

        const stats: UserStatsDto = {
            totalVideos,
            totalQuestionsAnswered,
            quizAccuracy,
            videosThisWeek: weeklyActivity.videosThisWeek,
            questionsThisWeek: weeklyActivity.questionsThisWeek        };

        logger.db.info("User stats retrieved", { userId, stats });
        return stats;
    } catch (error) {
        logger.db.error("Error fetching user stats", error, { userId });
        return {
            totalVideos: 0,
            totalQuestionsAnswered: 0,
            quizAccuracy: 0,
            videosThisWeek: 0,
            questionsThisWeek: 0
        };
    }
}
