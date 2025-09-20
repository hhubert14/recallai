import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
import { toDtoMapper } from "./utils";
import { logger } from "@/lib/logger";

export async function getVideoByUrl(
    videoUrl: string,
    userId: string
): Promise<VideoDto | undefined> {
    if (!videoUrl || !userId) {
        return undefined;
    }

    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("videos")
            .select("*")
            .eq("url", videoUrl)
            .eq("user_id", userId)
            .is("deleted_at", null)
            .limit(1)
            .single();

        if (error) {
            logger.db.error("Database query error", error, {
                videoUrl,
                userId,
            });
            throw error;
        }

        if (!data) {
            return undefined;
        }

        const mappedVideo = toDtoMapper(data);
        return mappedVideo;
    } catch (error) {
        logger.db.error("Error checking video existence", error, {
            videoUrl,
            userId,
        });
        return undefined;
    }
}
