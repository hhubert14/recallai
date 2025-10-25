// import "server-only"; // Ensure this file is only used on the server side

// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateVideoDto } from "./types";
// import { getUserSubscriptionStatusWithServiceRole } from "@/data-access/subscriptions/get-user-subscription-status";
import { logger } from "@/lib/logger";
// import { getVideoByUrl } from "./get-video-by-url";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";

export async function createVideo(videoData: CreateVideoDto) {
    // const supabase = createServiceRoleClient();

    try {
        // Get user's subscription status to determine should_expire value
        // const subscriptionStatus =
        //     await getUserSubscriptionStatusWithServiceRole(videoData.userId);
        // const should_expire = !subscriptionStatus.isSubscribed;

        // const { data, error } = await supabase
        //     .from("videos")
        //     .insert([
        //         {
        //             ...videoData,
        //             should_expire,
        //         },
        //     ])
        //     .select()
        //     .single();
        const [data] = await db
            .insert(videos)
            .values({
                ...videoData,
                shouldExpire: false,
            })
            .returning();

        return data;
    } catch (error) {
        logger.db.error("Error creating video", error, {
            userId: videoData.userId,
            url: videoData.url,
        });
        throw error;
    }
}
