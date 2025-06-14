import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VideoDto } from "./types";
import { toDtoMapper } from "./utils";

export async function getAllVideosByUserId(
    userId: string,
    limit?: number,
    includeSoftDeleted: boolean = false
): Promise<VideoDto[]> {
    console.log("getAllVideosByUserId called with:", { userId, limit, includeSoftDeleted });
    
    if (!userId) {
        console.log("Invalid parameters - userId is empty");
        return [];
    }

    console.log("Creating Supabase service role client...");
    const supabase = await createServiceRoleClient();

    try {
        console.log("Querying database for videos with user ID:", userId);
        
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
            console.error("Database query error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log("No videos found for the given user ID");
            return [];
        }

        console.log(`Found ${data.length} videos for user:`, userId);
        const mappedVideos = data.map((video) => toDtoMapper(video));
        console.log("Mapped video DTOs:", mappedVideos.length);
        
        return mappedVideos;
    } catch (error) {
        console.error("Error fetching videos by user ID:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        return [];
    }
}
