import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
    throw new Error("Stripe secret key is not defined in environment variables.");
}

export const stripe = new Stripe(key || "", {
    apiVersion: "2025-05-28.basil",
    typescript: true,
});
