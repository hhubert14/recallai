'use server'

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe/stripe";

export async function POST(request: NextRequest) {
    // const stripe = (await import("@/lib/stripe/stripe")).stripe;
    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature") as string;
    if (!signature) {
        return new Response("Missing Stripe-Signature header", { status: 400 });
    }

    try {
        const stripeInstance = await stripe();
        const event = stripeInstance.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );

        if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") {
            // Revalidate the path to update any cached data
            revalidatePath(`/dashboard`);
        }
        // Log the event for debugging purposes
        console.log(`Received event: ${event.type}`, event);
        // Handle the event
        switch (event.type) {
            case "checkout.session.completed":
                // Handle successful checkout session completion
                console.log("Checkout session completed:", event.data.object);
                break;
            case "invoice.payment_succeeded":
                // Handle successful invoice payment
                console.log("Invoice payment succeeded:", event.data.object);
                break;
            default:
                console.warn(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Webhook Error", { status: 400 });
    }
}