export interface UserSubscriptionStatus {
    isSubscribed: boolean;
    status?: string;
    planType?: string;
    currentPeriodEnd?: string;
}

export type SubscriptionStatus = 
  | 'active'      // Subscription is current and paid
  | 'past_due'    // Payment failed, in retry period (user still has access)
  | 'canceled'    // Subscription cancelled
  | 'trialing'    // In trial period (if you add trials later)
  | 'incomplete'; // Initial payment never succeeded

export type SubscriptionPlan = 'free' | 'premium' | 'student';

export interface SubscriptionData {
    id: number;
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    created_at: string;
    updated_at: string;
}
