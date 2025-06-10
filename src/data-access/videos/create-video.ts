import "server-only"; // Ensure this file is only used on the server side

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateVideoDto } from "./types";
// import { getVideoByUrl } from "./get-video-by-url";

export async function createVideo(videoData: CreateVideoDto) {
    const supabase = createServiceRoleClient();

    try {
        // // Check if video already exists for this user
        // const existingVideo = await getVideoByUrl(videoData.url, videoData.user_id);
        
        // if (existingVideo) {
        //     throw new Error(`Video with URL "${videoData.url}" already exists for this user`);
        // }

        const { data, error } = await supabase
            .from("videos")
            .insert([videoData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating video: ${error.message}`);
        }
        
        if (!data) {
            throw new Error("No data returned from video creation");
        }
        
        return data;
    } catch (error) {
        console.error("Error creating video:", error);
        throw error;
    }
}