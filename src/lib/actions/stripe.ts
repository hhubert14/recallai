"use server";

import { stripe } from "@/lib/stripe/stripe";
import { getUserStripeCustomerId, updateUserStripeCustomerId } from "@/data-access/users/stripe-customer";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

interface Props {
    userId: string; // Assuming userId is passed as a prop
}

export const subscribeAction = async ({ userId }: Props) => {
    try {
        const stripeInstance = await stripe();
        
        // Get user's email for customer creation
        const supabase = await createClient();
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            logger.subscription.error("Error getting user data", userError, { userId });
            return null;
        }

        // Check if user already has a Stripe customer ID
        let customerId = await getUserStripeCustomerId(userId);
        
        // If no customer ID exists, create a new Stripe customer
        if (!customerId) {
            const customer = await stripeInstance.customers.create({
                email: userData.email,
                metadata: {
                    userId: userId,
                },
            });
            
            customerId = customer.id;
            
            // Store the customer ID in the users table
            const updateSuccess = await updateUserStripeCustomerId(userId, customerId);
            if (!updateSuccess) {
                logger.subscription.error("Failed to store Stripe customer ID", undefined, { userId, customerId });
                return null;
            }
        }

        const { url } = await stripeInstance.checkout.sessions.create({
            customer: customerId, // Use the existing or newly created customer
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Replace with your actual price ID
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId, // Pass the user ID to the metadata
            },
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_URL}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}`,
        });
        return url; // This would be the URL to redirect to for the checkout session
    } catch (error) {
        logger.subscription.error("Error during subscription action", error, { userId });
        return null;
    }
};
