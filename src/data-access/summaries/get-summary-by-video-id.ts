import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SummaryDto } from "./types";

export async function getSummaryByVideoId(videoId: number): Promise<SummaryDto | null> {
    console.log("getSummaryByVideoId called with videoId:", videoId);
    
    if (!videoId) {
        console.log("Invalid parameters - videoId is empty");
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
            console.error("Database query error:", error);
            return null;
        }

        console.log("Found summary for video:", videoId);
        return data;
    } catch (error) {
        console.error("Error fetching summary by video ID:", error);
        return null;
    }
}
