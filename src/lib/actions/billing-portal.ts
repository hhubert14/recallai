"use server";

import { stripe } from "@/lib/stripe/stripe";
import { getUserStripeCustomerId } from "@/data-access/users/stripe-customer";
import { logger } from "@/lib/logger";

interface CreatePortalSessionProps {
    userId: string;
    returnUrl?: string;
}

export async function createBillingPortalSession({
    userId,
    returnUrl,
}: CreatePortalSessionProps) {
    try {
        const stripeInstance = await stripe();

        // Get user's Stripe customer ID
        const customerId = await getUserStripeCustomerId(userId);
        if (!customerId) {
            logger.subscription.error(
                "No Stripe customer found for user",
                undefined,
                { userId }
            );
            throw new Error(
                "No subscription found. Please create a subscription first."
            );
        } // Create the billing portal session
        const portalSession =
            await stripeInstance.billingPortal.sessions.create({
                customer: customerId,
                return_url:
                    returnUrl ||
                    `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
            });

        logger.subscription.info(
            "Billing portal session created successfully",
            {
                userId,
                portalSessionId: portalSession.id,
                portalUrl: portalSession.url,
            }
        );

        // Return the URL instead of redirecting server-side
        return { url: portalSession.url };
    } catch (error) {
        logger.subscription.error(
            "Error creating billing portal session",
            error,
            { userId }
        );
        throw error;
    }
}
