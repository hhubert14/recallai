import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export interface SubscriptionValidationResult {
    allowed: boolean;
    error?: {
        type:
            | "SUBSCRIPTION_REQUIRED"
            | "MONTHLY_LIMIT_EXCEEDED"
            | "VIDEO_LIMIT_EXCEEDED";
        message: string;
        currentUsage?: number;
        limit?: number;
        requiresUpgrade?: boolean;
    };
}

export interface SubscriptionLimits {
    monthlyVideoLimit: number;
    totalVideoLimit?: number;
}

// Define limits for different subscription types
const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
    free: {
        monthlyVideoLimit: 5, // Free users can process 5 videos per month
    },
    premium: {
        monthlyVideoLimit: Infinity, // Premium users have unlimited access
    },
};

export async function validateSubscriptionForExtension(
    userId: string
): Promise<SubscriptionValidationResult> {
    logger.subscription.debug("Validating subscription for extension user", {
        userId,
    });

    try {
        const supabase = createServiceRoleClient();

        // Get user's subscription status directly from database using service role client
        // This ensures we get the most up-to-date data, not cached session data
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("is_subscribed")
            .eq("id", userId)
            .single();
        if (userError || !userData) {
            logger.subscription.error(
                "Error fetching user subscription data",
                userError,
                { userId }
            );
            return {
                allowed: false,
                error: {
                    type: "SUBSCRIPTION_REQUIRED",
                    message: "Unable to verify user subscription status",
                    requiresUpgrade: false,
                },
            };
        }

        const isSubscribed = userData.is_subscribed;
        logger.subscription.debug("User subscription status from database", {
            userId,
            isSubscribed,
        });

        // Calculate the start of current month to count videos
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Count videos created this month that count towards free plan limit
        // Only videos processed under free plan (should_expire = true) count towards the limit
        const { count: currentMonthVideoCount, error: videoCountError } =
            await supabase
                .from("videos")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("should_expire", true)
                .gte("created_at", startOfMonth.toISOString());
        if (videoCountError) {
            logger.subscription.error(
                "Error counting user videos",
                videoCountError,
                { userId }
            );
            return {
                allowed: false,
                error: {
                    type: "SUBSCRIPTION_REQUIRED",
                    message: "Unable to verify user video usage",
                    requiresUpgrade: false,
                },
            };
        }

        const currentUsage = currentMonthVideoCount || 0;

        // Determine user's plan and limits
        const userPlan = isSubscribed ? "premium" : "free";
        const limits = SUBSCRIPTION_LIMITS[userPlan];

        logger.subscription.info("User plan validation", {
            userId,
            userPlan,
            currentUsage,
            monthlyLimit: limits.monthlyVideoLimit,
        });

        // Check if user has exceeded their monthly limit
        if (currentUsage >= limits.monthlyVideoLimit) {
            return {
                allowed: false,
                error: {
                    type: "MONTHLY_LIMIT_EXCEEDED",
                    message: isSubscribed
                        ? "You have reached your monthly video processing limit"
                        : "You have reached your free monthly limit. Upgrade to Premium for unlimited access",
                    currentUsage,
                    limit: limits.monthlyVideoLimit,
                    requiresUpgrade: !isSubscribed,
                },
            };
        }

        // If we get here, user is allowed to process videos
        return {
            allowed: true,
        };
    } catch (error) {
        logger.subscription.error("Error validating subscription", error, {
            userId,
        });
        return {
            allowed: false,
            error: {
                type: "SUBSCRIPTION_REQUIRED",
                message: "Unable to validate subscription. Please try again.",
                requiresUpgrade: false,
            },
        };
    }
}
