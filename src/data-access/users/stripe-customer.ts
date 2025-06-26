import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

/**
 * Updates a user's Stripe customer ID in the users table
 * This is called when a customer is created in Stripe to maintain the relationship
 */
export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<boolean> {
    const supabase = createServiceRoleClient();
    
    try {
        const { error } = await supabase
            .from('users')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', userId);

        if (error) {
            logger.subscription.error("Error updating user Stripe customer ID", error, { userId, stripeCustomerId });
            return false;
        }

        return true;
    } catch (error) {
        logger.subscription.error("Exception updating user Stripe customer ID", error, { userId, stripeCustomerId });
        return false;
    }
}

/**
 * Gets a user's Stripe customer ID from the users table
 */
export async function getUserStripeCustomerId(userId: string): Promise<string | null> {
    const supabase = createServiceRoleClient();
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (error) {
            logger.subscription.error("Error getting user Stripe customer ID", error, { userId });
            return null;
        }        return data?.stripe_customer_id || null;
    } catch (error) {
        logger.db.error("Exception getting user Stripe customer ID", error, { userId });
        return null;
    }
}
