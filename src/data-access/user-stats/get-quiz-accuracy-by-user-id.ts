import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getQuizAccuracyByUserId(userId: string): Promise<number> {
    console.log("getQuizAccuracyByUserId called with userId:", userId);
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
        return 0;
    }

    const supabase = await createServiceRoleClient();

    try {
        // Get total answers and correct answers
        const { data, error } = await supabase
            .from("user_answers")
            .select("is_correct")
            .eq("user_id", userId);

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
