export interface UserSubscriptionStatus {
    isSubscribed: boolean;
    status?: string;
    planType?: string;
    currentPeriodEnd?: string;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';

export type SubscriptionPlan = 'basic' | 'premium' | 'pro';

export interface SubscriptionData {
    id: number;
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    current_period_start: string;
    current_period_end: string;
    created_at: string;
    updated_at: string;
}
