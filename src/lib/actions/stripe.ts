"use server";

import { stripe } from "@/lib/stripe/stripe";
import { getUserStripeCustomerId, updateUserStripeCustomerId } from "@/data-access/users/stripe-customer";
import { createClient } from "@/lib/supabase/server";

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
            console.error("Error getting user data:", userError);
            return null;
        }

        // Check if user already has a Stripe customer ID
        let customerId = await getUserStripeCustomerId(userId);
        
        // If no customer ID exists, create a new Stripe customer
        if (!customerId) {
            console.log("Creating new Stripe customer for user:", userId);
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
                console.error("Failed to store Stripe customer ID");
                return null;
            }
        }

        const { url } = await stripeInstance.checkout.sessions.create({
            customer: customerId, // Use the existing or newly created customer
            payment_method_types: ["card"],
            line_items: [
                {
                    price: "price_1RVDqlRZzrkl5nOgpYbtHTSi", // Replace with your actual price ID
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
        console.log("Subscription action triggered");
        return url; // This would be the URL to redirect to for the checkout session
    } catch (error) {
        console.error("Error during subscription action:", error);
        return null;
    }
};
