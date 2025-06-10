import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
import { toDtoMapper } from "./utils";

export async function getVideoByUrl(
    videoUrl: string,
    userId: string
): Promise<VideoDto | undefined> {
    console.log("getVideoByUrl called with:", { videoUrl, userId });

    if (!videoUrl || !userId) {
        console.log("Invalid parameters - videoUrl or userId is empty");
        return undefined;
    }

    console.log("Creating Supabase service role client...");
    const supabase = await createServiceRoleClient();

    try {
        console.log(
            "Querying database for video with URL:",
            videoUrl,
            "and user ID:",
            userId
        );

        const { data, error } = await supabase
            .from("videos")
            .select("*")
            .eq("url", videoUrl)
            .eq("user_id", userId)
            .limit(1)
            .single();

        if (error) {
            console.error("Database query error:", error);
            throw error;
        }

        if (!data) {
            console.log("No video found for the given URL and user ID");
            return undefined;
        }

        console.log("Video found in database:", data);
        const mappedVideo = toDtoMapper(data);
        console.log("Mapped video DTO:", mappedVideo);

        return mappedVideo;
    } catch (error) {
        console.error("Error checking video existence:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        return undefined;
    }
}
