import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function updateUserSubscriptionStatus(userId: string, isSubscribed: boolean): Promise<boolean> {
    console.log("Updating user subscription status:", { userId, isSubscribed });
    
    const supabase = createServiceRoleClient();
    
    try {
        const { error } = await supabase
            .from('users')
            .update({
                is_subscribed: isSubscribed,
            })
            .eq('id', userId);

        if (error) {
            console.error("Error updating user subscription status:", error);
            return false;
        }

        console.log("User subscription status updated successfully");        return true;
    } catch (error) {
        console.error("Exception updating user subscription status:", error);
        return false;
    }
}
