'use server';

import Stripe from "stripe";

// Safely get the environment variable, with better error message
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
    console.error("STRIPE_SECRET_KEY environment variable is not set. Please check your .env.local file.");
    throw new Error("Stripe secret key is not defined. Make sure you have a .env.local file with STRIPE_SECRET_KEY defined.");
}

export const stripe = async () => {
    return new Stripe(key, {
        apiVersion: "2025-05-28.basil",
        typescript: true,
    });
};
