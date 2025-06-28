"use server";

import Stripe from "stripe";

export const stripe = async () => {
    // Only check for the environment variable when the function is actually called
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        console.error(
            "STRIPE_SECRET_KEY environment variable is not set. Please check your .env.local file."
        );
        throw new Error(
            "Stripe secret key is not defined. Make sure you have a .env.local file with STRIPE_SECRET_KEY defined."
        );
    }

    return new Stripe(key, {
        apiVersion: "2025-05-28.basil",
        typescript: true,
    });
};
