import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export interface UserSubscriptionStatus {
    isSubscribed: boolean;
    status?: string;
    planType?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string;
}

export async function getUserSubscriptionStatus(
    userId: string
): Promise<UserSubscriptionStatus> {
    const supabase = await createClient();

    try {
        // First check the users table for the simple is_subscribed flag
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("is_subscribed")
            .eq("id", userId)
            .single();

        if (userError) {
            logger.subscription.error(
                "Error fetching user subscription status",
                userError,
                { userId }
            );
            return { isSubscribed: false };
        }

        // If not subscribed according to users table, return early
        if (!userData?.is_subscribed) {
            // logger.subscription.debug(
            //     "User not subscribed according to users table",
            //     { userId, is_subscribed: userData?.is_subscribed }
            // );
            return { isSubscribed: false };
        } // If subscribed, get detailed subscription info from subscriptions table
        const { data: subscriptionData, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select(
                    "status, plan, current_period_end, cancel_at_period_end, canceled_at"
                )
                .eq("user_id", userId)
                .in("status", ["active", "trialing"]) // Removed 'past_due' since we immediately downgrade on payment failure
                .single();

        if (subscriptionError || !subscriptionData) {
            // User might be marked as subscribed but no active subscription found
            // Return basic subscription status
            // logger.subscription.debug(
            //     "User marked as subscribed but no active subscription found",
            //     { userId, subscriptionError }
            // );
            return { isSubscribed: userData.is_subscribed };
        }
        return {
            isSubscribed: true,
            status: subscriptionData.status,
            planType: subscriptionData.plan,
            currentPeriodEnd: subscriptionData.current_period_end,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            canceledAt: subscriptionData.canceled_at,
        };
    } catch (error) {
        logger.subscription.error("Error fetching subscription status", error, {
            userId,
        });
        return { isSubscribed: false };
    }
}

/**
 * Get user subscription status using service role client (for server-side operations without user session)
 * This is used in contexts where there might not be a valid user session (e.g., extension token requests)
 */
export async function getUserSubscriptionStatusWithServiceRole(
    userId: string
): Promise<UserSubscriptionStatus> {
    const supabase = createServiceRoleClient();

    try {
        // First check the users table for the simple is_subscribed flag
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("is_subscribed")
            .eq("id", userId)
            .single();

        if (userError) {
            logger.subscription.error(
                "Error fetching user subscription status with service role",
                userError,
                { userId }
            );
            return { isSubscribed: false };
        }

        // If not subscribed according to users table, return early
        if (!userData?.is_subscribed) {
            // logger.subscription.debug(
            //     "User not subscribed according to users table (service role)",
            //     { userId, is_subscribed: userData?.is_subscribed }
            // );
            return { isSubscribed: false };
        } // If subscribed, get detailed subscription info from subscriptions table
        const { data: subscriptionData, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select(
                    "status, plan, current_period_end, cancel_at_period_end, canceled_at"
                )
                .eq("user_id", userId)
                .in("status", ["active", "trialing"]) // Removed 'past_due' since we immediately downgrade on payment failure
                .single();

        if (subscriptionError || !subscriptionData) {
            // User might be marked as subscribed but no active subscription found
            // Return basic subscription status
            // logger.subscription.debug(
            //     "User marked as subscribed but no active subscription found (service role)",
            //     { userId, subscriptionError }
            // );
            return { isSubscribed: userData.is_subscribed };
        }
        return {
            isSubscribed: true,
            status: subscriptionData.status,
            planType: subscriptionData.plan,
            currentPeriodEnd: subscriptionData.current_period_end,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            canceledAt: subscriptionData.canceled_at,
        };
    } catch (error) {
        logger.subscription.error(
            "Error fetching subscription status with service role",
            error,
            { userId }
        );
        return { isSubscribed: false };
    }
}
