import "server-only";
import { UserStatsDto } from "./types";
import { getTotalVideosByUserId } from "./get-total-videos-by-user-id";
import { getTotalQuestionsAnsweredByUserId } from "./get-total-questions-answered-by-user-id";
import { getQuizAccuracyByUserId } from "./get-quiz-accuracy-by-user-id";
import { getWeeklyActivityByUserId } from "./get-weekly-activity-by-user-id";

export async function getUserStatsByUserId(userId: string): Promise<UserStatsDto> {
    console.log("getUserStatsByUserId called with userId:", userId);
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
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
            questionsThisWeek: weeklyActivity.questionsThisWeek
        };

        console.log("User stats for", userId, ":", stats);
        return stats;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return {
            totalVideos: 0,
            totalQuestionsAnswered: 0,
            quizAccuracy: 0,
            videosThisWeek: 0,
            questionsThisWeek: 0
        };
    }
}
