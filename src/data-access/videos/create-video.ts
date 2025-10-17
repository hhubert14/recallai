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

        // Add detailed logging to debug the subscription status
        // logger.db.debug("User subscription status for video creation", {
        //     userId: videoData.user_id,
        //     subscriptionStatus,
        //     isSubscribed: subscriptionStatus.isSubscribed,
        // });

        // Set should_expire based on subscription status
        // Free users: should_expire = true, Premium users: should_expire = false
        const should_expire = !subscriptionStatus.isSubscribed;

        // logger.db.debug("Video should_expire value calculated", {
        //     userId: videoData.user_id,
        //     isSubscribed: subscriptionStatus.isSubscribed,
        //     should_expire,
        // });

        // // Check if video already exists for this user
        // const existingVideo = await getVideoByUrl(videoData.url, videoData.user_id);

        // if (existingVideo) {
        //     throw new Error(`Video with URL "${videoData.url}" already exists for this user`);
        // }

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
