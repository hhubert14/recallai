"use server";

import { stripe } from "@/lib/stripe/stripe";

interface Props {
    userId: string; // Assuming userId is passed as a prop
}

export const subscribeAction = async ({ userId }: Props) => {
    try {
        const stripeInstance = await stripe();
        const { url } = await stripeInstance.checkout.sessions.create({
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
