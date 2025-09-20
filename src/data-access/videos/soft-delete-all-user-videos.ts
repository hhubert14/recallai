import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function softDeleteAllUserVideos(
    userId: string
): Promise<boolean> {
    if (!userId) {
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
            logger.db.error("Database update error", error, { userId });
            throw error;
        }

        logger.video.info("All videos soft deleted successfully", { userId });
        return true;
    } catch (error) {
        logger.db.error("Error soft deleting all user videos", error, {
            userId,
        });
        return false;
    }
}
