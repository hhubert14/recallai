import Stripe from "stripe";
import {
    getUserIdByStripeCustomerId,
    getUserIdByStripeSubscriptionId,
} from "@/data-access/subscriptions/get-user-by-stripe-id";
import { logger } from "@/lib/logger";

/**
 * Extracts user ID from Stripe webhook events with fallback strategy
 * 1. Try metadata.userId first (fastest)
 * 2. Fallback to database lookup by customer_id or subscription_id
 */
export async function extractUserIdFromStripeEvent(
    event: Stripe.Event
): Promise<string | null> {
    const object = event.data.object;

    // Strategy 1: Try metadata first (from checkout session)
    if ("metadata" in object && object.metadata?.userId) {
        return object.metadata.userId as string;
    }

    // Strategy 2: Try to get from customer ID
    if ("customer" in object && object.customer) {
        const customerId = typeof object.customer === 'string' ? object.customer : object.customer.id;
        const userId = await getUserIdByStripeCustomerId(customerId);
        if (userId) {
            return userId;
        }
    }

    // Strategy 3: Try to get from subscription ID
    if ("subscription" in object && object.subscription) {
        const subscriptionId = typeof object.subscription === 'string' ? object.subscription : object.subscription.id;
        if (subscriptionId && subscriptionId.startsWith("sub_")) {
            const userId = await getUserIdByStripeSubscriptionId(subscriptionId);
            if (userId) {
                return userId;
            }
        }
    }

    // Strategy 4: Check if the object itself is a subscription
    if ("id" in object && typeof object.id === 'string' && object.id.startsWith("sub_")) {
        const userId = await getUserIdByStripeSubscriptionId(object.id);
        if (userId) {
            return userId;
        }
    }

    logger.subscription.error(
        "Could not extract user ID from Stripe event",
        undefined,
        { eventType: event.type }
    );
    return null;
}

/**
 * Maps Stripe subscription status to our database enum
 */
export function mapStripeStatusToDbStatus(
    stripeStatus: string
): "active" | "past_due" | "canceled" | "trialing" | "incomplete" {
    switch (stripeStatus) {
        case "active":
            return "active";
        case "trialing":
            return "trialing";
        case "past_due":
            return "past_due";
        case "canceled":
        case "cancelled":
            return "canceled";
        case "incomplete":
        case "incomplete_expired":
            return "incomplete";
        case "unpaid":
            return "canceled"; // Treat unpaid as canceled
        default:
            console.warn(
                `Unknown Stripe status: ${stripeStatus}, defaulting to 'incomplete'`
            );
            return "incomplete";
    }
}

/**
 * Determines if user should have subscription access based on status
 * Note: With immediate downgrade policy, only active and trialing users have access
 */
export function shouldHaveSubscriptionAccess(status: string): boolean {
    return ["active", "trialing"].includes(status); // Removed 'past_due' for immediate downgrade
}
