import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SummaryDto } from "./types";
import { logger } from "@/lib/logger";

export async function getSummaryByVideoId(videoId: number): Promise<SummaryDto | null> {
    if (!videoId) {
        return null;
    }

    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("summaries")
            .select("*")
            .eq("video_id", videoId)
            .single();

        if (error) {
            logger.db.error("Database query error", error, { videoId });
            return null;
        }

        return data;
    } catch (error) {
        logger.db.error("Error fetching summary by video ID", error, { videoId });
        return null;
    }
}
