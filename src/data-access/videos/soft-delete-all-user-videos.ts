import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function softDeleteAllUserVideos(userId: string): Promise<boolean> {
    console.log("softDeleteAllUserVideos called with userId:", userId);
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
        return false;
    }

    const supabase = await createServiceRoleClient();

    try {
        const { error } = await supabase
            .from("videos")
            .update({ deleted_at: new Date().toISOString() })
            .eq("user_id", userId)
            .is("deleted_at", null); // Only soft delete videos that aren't already deleted

        if (error) {
            console.error("Database update error:", error);
            throw error;
        }

        console.log(`All videos soft deleted successfully for user ${userId}`);
        return true;
    } catch (error) {
        console.error("Error soft deleting all user videos:", error);
        return false;
    }
}
