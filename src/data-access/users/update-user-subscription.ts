import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function updateUserSubscriptionStatus(userId: string, isSubscribed: boolean): Promise<boolean> {
    const supabase = createServiceRoleClient();
    
    try {
        const { error } = await supabase
            .from('users')
            .update({
                is_subscribed: isSubscribed,
            })
            .eq('id', userId);

        if (error) {
            logger.subscription.error("Error updating user subscription status", error, { userId, isSubscribed });
            return false;
        }

        logger.subscription.info("User subscription status updated successfully", { userId, isSubscribed });
        return true;
    } catch (error) {
        logger.subscription.error("Exception updating user subscription status", error, { userId, isSubscribed });
        return false;
    }
}
