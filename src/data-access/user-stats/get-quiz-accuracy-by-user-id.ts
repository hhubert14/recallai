import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getQuizAccuracyByUserId(userId: string): Promise<number> {
    console.log("getQuizAccuracyByUserId called with userId:", userId);
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
        return 0;
    }

    const supabase = await createServiceRoleClient();    try {
        // First, get all video IDs that are not soft-deleted
        const { data: validVideos, error: videoError } = await supabase
            .from("videos")
            .select("id")
            .is("deleted_at", null);

        if (videoError) {
            console.error("Database query error for videos:", videoError);
            throw videoError;
        }

        if (!validVideos || validVideos.length === 0) {
            console.log("No valid videos found");
            return 0;
        }

        const validVideoIds = validVideos.map(v => v.id);

        // Then, get all question IDs from these videos
        const { data: validQuestions, error: questionError } = await supabase
            .from("questions")
            .select("id")
            .in("video_id", validVideoIds);

        if (questionError) {
            console.error("Database query error for questions:", questionError);
            throw questionError;
        }

        if (!validQuestions || validQuestions.length === 0) {
            console.log("No valid questions found for non-deleted videos");
            return 0;
        }

        const validQuestionIds = validQuestions.map(q => q.id);

        // Finally, get user answers for these questions only
        const { data, error } = await supabase
            .from("user_answers")
            .select("is_correct")
            .eq("user_id", userId)
            .in("question_id", validQuestionIds);

        if (error) {
            console.error("Database query error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log("No answers found for user:", userId);
            return 0;
        }

        const totalAnswers = data.length;
        const correctAnswers = data.filter(answer => answer.is_correct).length;
        const accuracy = (correctAnswers / totalAnswers) * 100;

        console.log(`Quiz accuracy for user ${userId}: ${accuracy.toFixed(1)}% (${correctAnswers}/${totalAnswers})`);
        return Math.round(accuracy);
    } catch (error) {
        console.error("Error fetching quiz accuracy by user ID:", error);
        return 0;
    }
}
