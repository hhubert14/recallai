import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function softDeleteVideo(videoId: number, userId: string): Promise<boolean> {
    console.log("softDeleteVideo called with:", { videoId, userId });
    
    if (!videoId || !userId) {
        console.log("Invalid parameters - videoId or userId is empty");
        return false;
    }

    const supabase = await createServiceRoleClient();

    try {
        const { error } = await supabase
            .from("videos")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", videoId)
            .eq("user_id", userId)
            .is("deleted_at", null); // Only soft delete if not already deleted

        if (error) {
            console.error("Database update error:", error);
            throw error;
        }

        console.log(`Video ${videoId} soft deleted successfully for user ${userId}`);
        return true;
    } catch (error) {
        console.error("Error soft deleting video:", error);
        return false;
    }
}
