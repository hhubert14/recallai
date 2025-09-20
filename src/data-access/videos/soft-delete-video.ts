import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function softDeleteVideo(
    videoId: number,
    userId: string
): Promise<boolean> {
    logger.db.debug("Soft deleting video", { videoId, userId });

    if (!videoId || !userId) {
        logger.db.warn("Invalid parameters for soft delete", {
            hasVideoId: !!videoId,
            hasUserId: !!userId,
        });
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
            logger.db.error("Database update error during soft delete", error, {
                videoId,
                userId,
            });
            throw error;
        }

        logger.db.info("Video soft deleted successfully", { videoId, userId });
        return true;
    } catch (error) {
        logger.db.error("Error soft deleting video", error, {
            videoId,
            userId,
        });
        return false;
    }
}
