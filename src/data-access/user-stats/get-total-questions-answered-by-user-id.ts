import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getTotalQuestionsAnsweredByUserId(userId: string): Promise<number> {
    console.log("getTotalQuestionsAnsweredByUserId called with userId:", userId);
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
        return 0;
    }

    const supabase = await createServiceRoleClient();

    try {
        const { count, error } = await supabase
            .from("user_answers")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId);

        if (error) {
            console.error("Database query error:", error);
            throw error;
        }

        console.log(`Found ${count} total questions answered for user:`, userId);
        return count || 0;
    } catch (error) {
        console.error("Error fetching total questions answered by user ID:", error);
        return 0;
    }
}
