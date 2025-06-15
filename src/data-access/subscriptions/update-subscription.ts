import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SubscriptionStatus } from "./types";

export interface UpdateSubscriptionParams {
    stripeSubscriptionId: string;
    status?: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
}

export async function updateSubscriptionByStripeId(params: UpdateSubscriptionParams): Promise<boolean> {
    console.log("Updating subscription:", params);
    
    const supabase = createServiceRoleClient();
    
    try {
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (params.status) {
            updateData.status = params.status;
        }
        if (params.currentPeriodStart) {
            updateData.current_period_start = params.currentPeriodStart.toISOString();
        }
        if (params.currentPeriodEnd) {
            updateData.current_period_end = params.currentPeriodEnd.toISOString();
        }

        const { error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', params.stripeSubscriptionId);

        if (error) {
            console.error("Error updating subscription:", error);
            return false;
        }

        console.log("Subscription updated successfully");
        return true;
    } catch (error) {
        console.error("Exception updating subscription:", error);
        return false;
    }
}
