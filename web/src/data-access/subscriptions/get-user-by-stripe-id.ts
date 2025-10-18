import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function getUserIdByStripeCustomerId(
    stripeCustomerId: string
): Promise<string | null> {
    const supabase = createServiceRoleClient();

    try {
        // First try to find in users table (most reliable for initial lookup)
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("stripe_customer_id", stripeCustomerId)
            .single();

        if (!userError && userData) {
            return userData.id;
        }

        // Fallback to subscriptions table
        const { data: subData, error: subError } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", stripeCustomerId)
            .single();
        if (subError) {
            logger.db.error(
                "Error getting user ID by customer ID from both tables",
                { userError, subError },
                { stripeCustomerId }
            );
            return null;
        }

        // logger.subscription.debug("Found user ID in subscriptions table", {
        //     userId: subData.user_id,
        //     stripeCustomerId,
        // });
        return subData.user_id;
    } catch (error) {
        logger.db.error("Exception getting user ID by customer ID", error, {
            stripeCustomerId,
        });
        return null;
    }
}

export async function getUserIdByStripeSubscriptionId(
    stripeSubscriptionId: string
): Promise<string | null> {
    // logger.subscription.debug("Getting user ID for Stripe subscription", {
    //     stripeSubscriptionId,
    // });

    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", stripeSubscriptionId)
            .single();
        if (error) {
            logger.db.error("Error getting user ID by subscription ID", error, {
                stripeSubscriptionId,
            });
            return null;
        }

        // logger.subscription.debug("Found user ID", {
        //     userId: data.user_id,
        //     stripeSubscriptionId,
        // });
        return data.user_id;
    } catch (error) {
        logger.db.error("Exception getting user ID by subscription ID", error, {
            stripeSubscriptionId,
        });
        return null;
    }
}
