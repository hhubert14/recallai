import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SubscriptionStatus, SubscriptionPlan } from "./types";

export interface CreateSubscriptionParams {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}

export async function createSubscription(params: CreateSubscriptionParams): Promise<boolean> {
    console.log("Creating subscription:", params);
    
    const supabase = createServiceRoleClient();
    
    try {
        // First check if subscription already exists
        const { data: existingSubscription, error: checkError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', params.stripeSubscriptionId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error("Error checking for existing subscription:", checkError);
            return false;
        }

        if (existingSubscription) {
            console.log("Subscription already exists, skipping creation:", params.stripeSubscriptionId);
            return true; // Return true since the subscription exists
        }

        // Create new subscription if it doesn't exist
        const { error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: params.userId,
                stripe_customer_id: params.stripeCustomerId,
                stripe_subscription_id: params.stripeSubscriptionId,
                status: params.status,
                plan: params.plan,
                current_period_start: params.currentPeriodStart.toISOString(),
                current_period_end: params.currentPeriodEnd.toISOString(),
            });

        if (error) {
            console.error("Error creating subscription:", error);
            return false;
        }

        console.log("Subscription created successfully");
        return true;
    } catch (error) {
        console.error("Exception creating subscription:", error);
        return false;
    }
}
