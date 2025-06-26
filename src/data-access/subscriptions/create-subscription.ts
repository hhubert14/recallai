import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SubscriptionStatus, SubscriptionPlan } from "./types";
import { logger } from "@/lib/logger";

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
    logger.subscription.debug("Creating subscription", { 
        userId: params.userId, 
        stripeSubscriptionId: params.stripeSubscriptionId,
        plan: params.plan 
    });
    
    const supabase = createServiceRoleClient();
    
    try {
        // First check if subscription already exists
        const { data: existingSubscription, error: checkError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', params.stripeSubscriptionId)
            .single();        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
            logger.db.error("Error checking for existing subscription", checkError, { stripeSubscriptionId: params.stripeSubscriptionId });
            return false;
        }

        if (existingSubscription) {
            logger.subscription.debug("Subscription already exists, skipping creation", { stripeSubscriptionId: params.stripeSubscriptionId });
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
            });        if (error) {
            logger.db.error("Error creating subscription", error, { stripeSubscriptionId: params.stripeSubscriptionId });
            return false;
        }

        logger.subscription.info("Subscription created successfully", { 
            userId: params.userId, 
            stripeSubscriptionId: params.stripeSubscriptionId 
        });
        return true;
    } catch (error) {
        logger.db.error("Exception creating subscription", error, { stripeSubscriptionId: params.stripeSubscriptionId });
        return false;
    }
}
