// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
// import { toDtoMapper } from "./utils";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function getVideosByUserId(
    userId: string,
    limit?: number
): Promise<VideoDto[]> {
    if (!userId) {
        logger.db.warn("Invalid parameters - userId is empty");
        return [];
    }

    try {
        const baseQuery = db
            .select()
            .from(videos)
            .where(and(
                eq(videos.userId, userId),
                isNull(videos.deletedAt)
            ))
            .orderBy(desc(videos.createdAt))

        const data = limit ? await baseQuery.limit(limit) : await baseQuery

        return data;
    } catch (error) {
        logger.db.error("Error fetching videos by user ID", error, { userId });
        return [];
    }
}
