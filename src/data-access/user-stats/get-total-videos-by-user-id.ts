import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getTotalVideosByUserId(userId: string): Promise<number> {
    console.log("getTotalVideosByUserId called with userId:", userId);
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
        return 0;
    }

    const supabase = await createServiceRoleClient();

    try {        const { count, error } = await supabase
            .from("videos")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .is("deleted_at", null);

        if (error) {
            console.error("Database query error:", error);
            throw error;
        }

        console.log(`Found ${count} total videos for user:`, userId);
        return count || 0;
    } catch (error) {
        console.error("Error fetching total videos by user ID:", error);
        return 0;
    }
}
