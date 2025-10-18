import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

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
            throw new Error(
                `Error updating videos on subscription upgrade: ${error.message}`
            );
        }
        logger.subscription.info("Videos updated on subscription upgrade", {
            userId,
            videosUpdated: data?.length || 0,
        });
        return data;
    } catch (error) {
        logger.subscription.error(
            "Error updating videos on subscription upgrade",
            error,
            { userId }
        );
        throw error;
    }
}

/**
 * Grace period approach for downgrades:
 * - Keep existing videos with should_expire = false (they keep what they have)
 * - Only new videos will have should_expire = true after the downgrade
 * This function is mainly for logging/tracking purposes */
export async function handleSubscriptionDowngrade(userId: string) {
    logger.subscription.info(
        "Handling subscription downgrade with grace period",
        {
            userId,
            message:
                "Existing videos preserved, new videos will have 7-day expiry",
        }
    );

    // Optional: You could add analytics/logging here to track downgrades
    // For now, we don't change existing videos (grace period approach)

    return {
        message: "Downgrade processed with grace period for existing videos",
    };
}

/**
 * Immediate downgrade approach for payment failures:
 * - User immediately reverts to free plan limitations for NEW videos
 * - PRESERVES existing videos that were processed during premium period (should_expire = false)
 * - Only NEW videos processed after downgrade will expire (should_expire = true)
 */
export async function handleImmediateSubscriptionDowngrade(userId: string) {
    const supabase = createServiceRoleClient();

    try {
        // Get stats on existing videos (for logging purposes)
        const { data: existingVideos, error: statsError } = await supabase
            .from("videos")
            .select("should_expire")
            .eq("user_id", userId)
            .is("deleted_at", null);

        if (statsError) {
            logger.subscription.warn(
                "Could not get video stats during downgrade",
                { userId, error: statsError }
            );
        }

        const totalVideos = existingVideos?.length || 0;
        const premiumVideos =
            existingVideos?.filter(video => !video.should_expire).length || 0;
        const freeVideos =
            existingVideos?.filter(video => video.should_expire).length || 0;

        // No database changes needed - existing videos keep their current should_expire status
        // Videos processed during premium (should_expire = false) remain permanent
        // Videos processed during free periods (should_expire = true) remain expiring
        // NEW videos will automatically get should_expire = true due to user's free status

        logger.subscription.info("Immediate subscription downgrade processed", {
            userId,
            totalVideos,
            premiumVideosPreserved: premiumVideos,
            freeVideosUnchanged: freeVideos,
            message:
                "User downgraded to free plan - premium videos preserved, new videos will expire",
        });

        return {
            totalVideos,
            premiumVideosPreserved: premiumVideos,
            freeVideosUnchanged: freeVideos,
            message:
                "Immediate downgrade completed - premium videos preserved, future videos will expire after 7 days",
        };
    } catch (error) {
        logger.subscription.error(
            "Error processing immediate subscription downgrade",
            error,
            { userId }
        );
        throw error;
    }
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
        const expiringVideos =
            data?.filter(video => video.should_expire).length || 0;
        const permanentVideos = totalVideos - expiringVideos;

        return {
            totalVideos,
            expiringVideos,
            permanentVideos,
        };
    } catch (error) {
        logger.db.error("Error getting user video stats", error, { userId });
        throw error;
    }
}
