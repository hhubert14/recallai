import { createClient } from "@/lib/supabase/server";

export interface UserSubscriptionStatus {
    isSubscribed: boolean;
    status?: string;
    planType?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string;
}

export async function getUserSubscriptionStatus(userId: string): Promise<UserSubscriptionStatus> {
    const supabase = await createClient();
    
    try {
        // First check the users table for the simple is_subscribed flag
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_subscribed')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('Error fetching user subscription status:', userError);
            return { isSubscribed: false };
        }

        // If not subscribed according to users table, return early
        if (!userData?.is_subscribed) {
            return { isSubscribed: false };
        }        // If subscribed, get detailed subscription info from subscriptions table
        const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('status, plan, current_period_end, cancel_at_period_end, canceled_at')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing', 'past_due']) // Include all statuses that should have access
            .single();

        if (subscriptionError || !subscriptionData) {
            // User might be marked as subscribed but no active subscription found
            // Return basic subscription status
            return { isSubscribed: userData.is_subscribed };
        }        return {
            isSubscribed: true,
            status: subscriptionData.status,
            planType: subscriptionData.plan,
            currentPeriodEnd: subscriptionData.current_period_end,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            canceledAt: subscriptionData.canceled_at
        };

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return { isSubscribed: false };
    }
}
