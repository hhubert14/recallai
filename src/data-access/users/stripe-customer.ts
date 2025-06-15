import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Updates a user's Stripe customer ID in the users table
 * This is called when a customer is created in Stripe to maintain the relationship
 */
export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<boolean> {
    console.log("Updating user Stripe customer ID:", { userId, stripeCustomerId });
    
    const supabase = createServiceRoleClient();
    
    try {
        const { error } = await supabase
            .from('users')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', userId);

        if (error) {
            console.error("Error updating user Stripe customer ID:", error);
            return false;
        }

        console.log("Successfully updated user Stripe customer ID");
        return true;
    } catch (error) {
        console.error("Exception updating user Stripe customer ID:", error);
        return false;
    }
}

/**
 * Gets a user's Stripe customer ID from the users table
 */
export async function getUserStripeCustomerId(userId: string): Promise<string | null> {
    console.log("Getting user Stripe customer ID for user:", userId);
    
    const supabase = createServiceRoleClient();
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error getting user Stripe customer ID:", error);
            return null;
        }

        return data?.stripe_customer_id || null;
    } catch (error) {
        console.error("Exception getting user Stripe customer ID:", error);
        return null;
    }
}
