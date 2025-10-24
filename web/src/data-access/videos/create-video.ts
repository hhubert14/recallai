import "server-only"; // Ensure this file is only used on the server side

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateVideoDto } from "./types";
import { getUserSubscriptionStatusWithServiceRole } from "@/data-access/subscriptions/get-user-subscription-status";
import { logger } from "@/lib/logger";
// import { getVideoByUrl } from "./get-video-by-url";

export async function createVideo(videoData: CreateVideoDto) {
    const supabase = createServiceRoleClient();

    try {
        // Get user's subscription status to determine should_expire value
        const subscriptionStatus =
            await getUserSubscriptionStatusWithServiceRole(videoData.user_id);
        const should_expire = !subscriptionStatus.isSubscribed;

        const { data, error } = await supabase
            .from("videos")
            .insert([
                {
                    ...videoData,
                    should_expire,
                },
            ])
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
        logger.db.error("Error creating video", error, {
            userId: videoData.user_id,
            url: videoData.url,
        });
        throw error;
    }
}
