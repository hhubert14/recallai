import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
import { toDtoMapper } from "./utils";

export async function getVideoByUrl(videoUrl: string): Promise<VideoDto | undefined> {
    if (!videoUrl) {
        return undefined;
    }

    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("videos")
            .select("*")
            .eq("url", videoUrl)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return undefined;
        }

        return toDtoMapper(data);
    } catch (error) {
        console.error("Error checking video existence:", error);
    }
}