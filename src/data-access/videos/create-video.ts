import "server-only"; // Ensure this file is only used on the server side

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateVideoDto } from "./types";

export async function createVideo(videoData: CreateVideoDto) {
    const supabase = createServiceRoleClient();

    try {
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
}}