import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
import { toDtoMapper } from "./utils";
import { logger } from "@/lib/logger";

export async function getAllVideosByUserId(
    userId: string,
    limit?: number,
    includeSoftDeleted: boolean = false
): Promise<VideoDto[]> {
    if (!userId) {
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        let query = supabase
            .from("videos")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        // Only exclude soft-deleted videos if includeSoftDeleted is false
        if (!includeSoftDeleted) {
            query = query.is("deleted_at", null);
        }

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            logger.db.error("Database query error", error, { userId });
            throw error;
        }
        if (!data || data.length === 0) {
            return [];
        }

        const mappedVideos = data.map(video => toDtoMapper(video));
        return mappedVideos;
    } catch (error) {
        logger.db.error("Error fetching videos by user ID", error, { userId });
        return [];
    }
}
