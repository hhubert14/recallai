import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
import { toDtoMapper } from "./utils";
import { logger } from "@/lib/logger";

export async function getVideosByUserId(
    userId: string,
    limit?: number
): Promise<VideoDto[]> {
    // logger.db.debug("Getting videos by user ID", { userId, limit });

    if (!userId) {
        logger.db.warn("Invalid parameters - userId is empty");
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        // logger.db.debug("Querying database for videos", { userId });
        let query = supabase
            .from("videos")
            .select("*")
            .eq("user_id", userId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) {
            logger.db.error("Database query error", error, { userId });
            throw error;
        }

        if (!data || data.length === 0) {
            // logger.db.debug("No videos found for user", { userId });
            return [];
        }

        // logger.db.info("Found videos for user", {
        //     userId,
        //     videoCount: data.length,
        // });
        const mappedVideos = data.map(video => toDtoMapper(video));

        return mappedVideos;
    } catch (error) {
        logger.db.error("Error fetching videos by user ID", error, { userId });
        return [];
    }
}
