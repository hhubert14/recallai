"use server";

import { stripe } from "@/lib/stripe/stripe";
import { getUserStripeCustomerId } from "@/data-access/users/stripe-customer";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

interface CreatePortalSessionProps {
    userId: string;
    returnUrl?: string;
}

export async function createBillingPortalSession({ userId, returnUrl }: CreatePortalSessionProps) {
    try {
        const stripeInstance = await stripe();
        
        // Get user's Stripe customer ID
        const customerId = await getUserStripeCustomerId(userId);
          if (!customerId) {
            logger.subscription.error("No Stripe customer found for user", undefined, { userId });
            throw new Error("No subscription found. Please create a subscription first.");
        }// Create the billing portal session
        const portalSession = await stripeInstance.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
        });
        
        // Redirect to the portal URL        redirect(portalSession.url);
    } catch (error) {
        logger.subscription.error("Error creating billing portal session", error, { userId });
        throw error;
    }
}
