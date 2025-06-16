"use server";

import { stripe } from "@/lib/stripe/stripe";
import { getUserStripeCustomerId } from "@/data-access/users/stripe-customer";
import { redirect } from "next/navigation";

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
            console.error("No Stripe customer found for user:", userId);
            throw new Error("No subscription found. Please create a subscription first.");
        }

        // Create the billing portal session
        const portalSession = await stripeInstance.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
        });

        console.log("Billing portal session created for customer:", customerId);
        
        // Redirect to the portal URL
        redirect(portalSession.url);
    } catch (error) {
        console.error("Error creating billing portal session:", error);
        throw error;
    }
}
