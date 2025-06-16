import "server-only";

import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface SubscriptionValidationResult {
    allowed: boolean;
    error?: {
        type: 'SUBSCRIPTION_REQUIRED' | 'MONTHLY_LIMIT_EXCEEDED' | 'VIDEO_LIMIT_EXCEEDED';
        message: string;
        currentUsage?: number;
        limit?: number;
        requiresUpgrade?: boolean;
    };
}

export interface SubscriptionLimits {
    monthlyVideoLimit: number;
    totalVideoLimit?: number;
}

// Define limits for different subscription types
const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
    free: {
        monthlyVideoLimit: 5, // Free users can process 5 videos per month
    },
    premium: {
        monthlyVideoLimit: Infinity, // Premium users have unlimited access
    }
};

export async function validateSubscriptionForExtension(userId: string): Promise<SubscriptionValidationResult> {
    console.log("Validating subscription for extension user:", userId);
    
    try {
        const supabase = createServiceRoleClient();
        
        // Get user's subscription status
        const subscriptionStatus = await getUserSubscriptionStatus(userId);
        console.log("User subscription status:", subscriptionStatus);
        
        // Calculate the start of current month to count videos
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Count videos created this month for this user
        const { count: currentMonthVideoCount, error: videoCountError } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        if (videoCountError) {
            console.error("Error counting user videos:", videoCountError);
            return {
                allowed: false,
                error: {
                    type: 'SUBSCRIPTION_REQUIRED',
                    message: 'Unable to verify user video usage',
                    requiresUpgrade: false
                }
            };
        }

        const currentUsage = currentMonthVideoCount || 0;
        
        // Determine user's plan and limits
        const userPlan = subscriptionStatus.isSubscribed ? 'premium' : 'free';
        const limits = SUBSCRIPTION_LIMITS[userPlan];
        
        console.log("User plan:", userPlan, "Current month usage:", currentUsage, "Limits:", limits);

        // Check if user has exceeded their monthly limit
        if (currentUsage >= limits.monthlyVideoLimit) {
            return {
                allowed: false,
                error: {
                    type: 'MONTHLY_LIMIT_EXCEEDED',
                    message: subscriptionStatus.isSubscribed 
                        ? 'You have reached your monthly video processing limit'
                        : 'You have reached your free monthly limit. Upgrade to Premium for unlimited access',
                    currentUsage,
                    limit: limits.monthlyVideoLimit,
                    requiresUpgrade: !subscriptionStatus.isSubscribed
                }
            };
        }

        // If we get here, user is allowed to process videos
        return {
            allowed: true
        };

    } catch (error) {
        console.error("Error validating subscription:", error);
        return {
            allowed: false,
            error: {
                type: 'SUBSCRIPTION_REQUIRED',
                message: 'Unable to validate subscription. Please try again.',
                requiresUpgrade: false
            }
        };
    }
}
