import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Updates all user's videos to not expire when they upgrade to premium
 */
export async function updateVideosOnSubscriptionUpgrade(userId: string) {
    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("videos")
            .update({ should_expire: false })
            .eq("user_id", userId)
            .select();

        if (error) {
            throw new Error(`Error updating videos on subscription upgrade: ${error.message}`);
        }

        console.log(`Updated ${data?.length || 0} videos to not expire for user ${userId}`);
        return data;
    } catch (error) {
        console.error("Error updating videos on subscription upgrade:", error);
        throw error;
    }
}

/**
 * Grace period approach for downgrades:
 * - Keep existing videos with should_expire = false (they keep what they have)
 * - Only new videos will have should_expire = true after the downgrade
 * This function is mainly for logging/tracking purposes
 */
export async function handleSubscriptionDowngrade(userId: string) {
    console.log(`User ${userId} downgraded subscription. Existing videos will be preserved with current expiry settings. New videos will have 7-day expiry.`);
    
    // Optional: You could add analytics/logging here to track downgrades
    // For now, we don't change existing videos (grace period approach)
    
    return { message: "Downgrade processed with grace period for existing videos" };
}

/**
 * Get video statistics for a user (useful for subscription change notifications)
 */
export async function getUserVideoStats(userId: string) {
    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("videos")
            .select("should_expire")
            .eq("user_id", userId)
            .is("deleted_at", null);

        if (error) {
            throw new Error(`Error getting user video stats: ${error.message}`);
        }

        const totalVideos = data?.length || 0;
        const expiringVideos = data?.filter(video => video.should_expire).length || 0;
        const permanentVideos = totalVideos - expiringVideos;

        return {
            totalVideos,
            expiringVideos,
            permanentVideos
        };
    } catch (error) {
        console.error("Error getting user video stats:", error);
        throw error;
    }
}
