import { getUserIdByStripeCustomerId, getUserIdByStripeSubscriptionId } from "@/data-access/subscriptions/get-user-by-stripe-id";

/**
 * Extracts user ID from Stripe webhook events with fallback strategy
 * 1. Try metadata.userId first (fastest)
 * 2. Fallback to database lookup by customer_id or subscription_id
 */
export async function extractUserIdFromStripeEvent(event: any): Promise<string | null> {
    console.log("Extracting user ID from Stripe event:", event.type);
    
    // Strategy 1: Try metadata first (from checkout session)
    if (event.data.object.metadata?.userId) {
        console.log("Found user ID in metadata:", event.data.object.metadata.userId);
        return event.data.object.metadata.userId;
    }

    // Strategy 2: Try to get from customer ID
    const customerId = event.data.object.customer;
    if (customerId) {
        console.log("Trying to find user by customer ID:", customerId);
        const userId = await getUserIdByStripeCustomerId(customerId);
        if (userId) {
            return userId;
        }
    }

    // Strategy 3: Try to get from subscription ID (for subscription events)
    const subscriptionId = event.data.object.subscription || event.data.object.id;
    if (subscriptionId && subscriptionId.startsWith('sub_')) {
        console.log("Trying to find user by subscription ID:", subscriptionId);
        const userId = await getUserIdByStripeSubscriptionId(subscriptionId);
        if (userId) {
            return userId;
        }
    }

    console.error("Could not extract user ID from Stripe event");
    return null;
}

/**
 * Maps Stripe subscription status to our database enum
 */
export function mapStripeStatusToDbStatus(stripeStatus: string): 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' {
    switch (stripeStatus) {
        case 'active':
            return 'active';
        case 'trialing':
            return 'trialing';
        case 'past_due':
            return 'past_due';
        case 'canceled':
        case 'cancelled':
            return 'canceled';
        case 'incomplete':
        case 'incomplete_expired':
            return 'incomplete';
        case 'unpaid':
            return 'canceled'; // Treat unpaid as canceled
        default:
            console.warn(`Unknown Stripe status: ${stripeStatus}, defaulting to 'incomplete'`);
            return 'incomplete';
    }
}

/**
 * Determines if user should have subscription access based on status
 */
export function shouldHaveSubscriptionAccess(status: string): boolean {
        return ['active', 'trialing', 'past_due'].includes(status);
}
