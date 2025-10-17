import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SubscriptionStatus } from "./types";
import { logger } from "@/lib/logger";

export interface UpdateSubscriptionParams {
    stripeSubscriptionId: string;
    status?: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date;
}

export async function updateSubscriptionByStripeId(
    params: UpdateSubscriptionParams
): Promise<boolean> {
    // logger.subscription.debug("Updating subscription", {
    //     stripeSubscriptionId: params.stripeSubscriptionId,
    //     status: params.status,
    // });

    const supabase = createServiceRoleClient();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (params.status) {
            updateData.status = params.status;
        }
        if (params.currentPeriodStart) {
            updateData.current_period_start =
                params.currentPeriodStart.toISOString();
        }
        if (params.currentPeriodEnd) {
            updateData.current_period_end =
                params.currentPeriodEnd.toISOString();
        }
        if (params.cancelAtPeriodEnd !== undefined) {
            updateData.cancel_at_period_end = params.cancelAtPeriodEnd;
        }
        if (params.canceledAt) {
            updateData.canceled_at = params.canceledAt.toISOString();
        }

        const { error } = await supabase
            .from("subscriptions")
            .update(updateData)
            .eq("stripe_subscription_id", params.stripeSubscriptionId);

        if (error) {
            logger.db.error("Error updating subscription", error, {
                stripeSubscriptionId: params.stripeSubscriptionId,
            });
            return false;
        }

        logger.subscription.info("Subscription updated successfully", {
            stripeSubscriptionId: params.stripeSubscriptionId,
        });
        return true;
    } catch (error) {
        logger.db.error("Exception updating subscription", error, {
            stripeSubscriptionId: params.stripeSubscriptionId,
        });
        return false;
    }
}
