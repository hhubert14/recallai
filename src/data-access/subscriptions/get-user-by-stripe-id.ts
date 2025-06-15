import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getUserIdByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
    console.log("Getting user ID for Stripe customer:", stripeCustomerId);
    
    const supabase = createServiceRoleClient();
    
    try {
        // First try to find in users table (most reliable for initial lookup)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();

        if (!userError && userData) {
            console.log("Found user ID in users table:", userData.id);
            return userData.id;
        }

        console.log("User not found in users table, trying subscriptions table");
        
        // Fallback to subscriptions table
        const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();

        if (subError) {
            console.error("Error getting user ID by customer ID from both tables:", { userError, subError });
            return null;
        }

        console.log("Found user ID in subscriptions table:", subData.user_id);
        return subData.user_id;
    } catch (error) {
        console.error("Exception getting user ID by customer ID:", error);
        return null;
    }
}

export async function getUserIdByStripeSubscriptionId(stripeSubscriptionId: string): Promise<string | null> {
    console.log("Getting user ID for Stripe subscription:", stripeSubscriptionId);
    
    const supabase = createServiceRoleClient();
    
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', stripeSubscriptionId)
            .single();

        if (error) {
            console.error("Error getting user ID by subscription ID:", error);
            return null;
        }

        console.log("Found user ID:", data.user_id);
        return data.user_id;
    } catch (error) {
        console.error("Exception getting user ID by subscription ID:", error);
        return null;
    }
}
