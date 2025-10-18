"use server";

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe/stripe";
import {
    extractUserIdFromStripeEvent,
    mapStripeStatusToDbStatus,
    shouldHaveSubscriptionAccess,
} from "@/data-access/subscriptions/webhook-utils";
import { SubscriptionStatus } from "@/data-access/subscriptions/types";
import { createSubscription } from "@/data-access/subscriptions/create-subscription";
import { updateSubscriptionByStripeId } from "@/data-access/subscriptions/update-subscription";
import { updateUserSubscriptionStatus } from "@/data-access/users/update-user-subscription";
import {
    updateVideosOnSubscriptionUpgrade,
    handleSubscriptionDowngrade,
    handleImmediateSubscriptionDowngrade,
} from "@/data-access/videos/update-video-expiry-on-subscription-change";
import Stripe from "stripe";

// Simple in-memory cache to prevent duplicate processing
const processedEvents = new Map<string, number>();

function isEventAlreadyProcessed(eventId: string): boolean {
    const now = Date.now();
    const lastProcessed = processedEvents.get(eventId);

    // If processed within the last 5 minutes, consider it a duplicate
    if (lastProcessed && now - lastProcessed < 5 * 60 * 1000) {
        return true;
    }

    // Clean up old entries (older than 10 minutes)
    for (const [id, timestamp] of processedEvents.entries()) {
        if (now - timestamp > 10 * 60 * 1000) {
            processedEvents.delete(id);
        }
    }

    // Mark as processed
    processedEvents.set(eventId, now);
    return false;
}

export async function POST(request: NextRequest) {
    console.log("🚀 Webhook received!");
    console.log("📝 Environment check:");
    console.log(
        "- Has STRIPE_WEBHOOK_SECRET:",
        !!process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(
        "- Secret length:",
        process.env.STRIPE_WEBHOOK_SECRET?.length || 0
    );
    console.log(
        "- Secret preview:",
        process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + "..."
    );

    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature") as string;

    console.log("📦 Request details:");
    console.log("- Body length:", body.length);
    console.log("- Has signature:", !!signature);
    console.log("- Signature preview:", signature?.substring(0, 50) + "...");

    if (!signature) {
        console.error("❌ Missing Stripe-Signature header");
        return new Response("Missing Stripe-Signature header", { status: 400 });
    }

    try {
        const stripeInstance = await stripe();
        const event = stripeInstance.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );

        if (
            event.type === "checkout.session.completed" &&
            event.data.object.payment_status === "paid"
        ) {
            // Revalidate the path to update any cached data
            revalidatePath(`/dashboard`);
        }
        // Log the event for debugging purposes
        console.log(
            `✅ Successfully verified event: ${event.type} (ID: ${event.id})`
        );
        // console.log("Event data preview:", {
        //     type: event.type,
        //     id: event.id,
        //     object: (event.data.object as any)?.id || "N/A",
        //     customer: (event.data.object as any)?.customer || "N/A",
        // });

        // Check for duplicate events
        if (isEventAlreadyProcessed(event.id)) {
            console.log(`Event ${event.id} already processed, skipping`);
            return new Response(
                JSON.stringify({ received: true, skipped: true }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Handle the event
        console.log(`🎯 About to handle event: ${event.type}`);
        console.log(
            "🔍 Full event data for debugging:",
            JSON.stringify(event.data, null, 2)
        );

        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event);
                break;
            case "customer.subscription.created":
                await handleSubscriptionCreated(event);
                break;
            case "invoice.payment_succeeded":
                await handleInvoicePaymentSucceeded(event);
                break;
            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(event);
                break;
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event);
                break;
            case "billing_portal.session.created":
                await handleBillingPortalSessionCreated(event);
                break;
            default:
                console.warn(`⚠️ Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("❌ Error processing webhook:", error);

        // Log more detailed error information
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                name: error.name,
                stack: error.stack?.substring(0, 500),
            });
        }

        return new Response("Webhook Error", { status: 400 });
    }
}

// Handle subscription creation (update period data)
async function handleSubscriptionCreated(event: Stripe.Event) {
    console.log("Processing subscription created");

    try {
        const subscription = event.data.object as Stripe.Subscription & {
            current_period_start?: number,
            current_period_end?: number,
        };

        console.log("Subscription created data:", {
            id: subscription.id,
            customer: subscription.customer,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            created: subscription.created,
        });

        // If we have period data, update the existing subscription record
        if (
            subscription.current_period_start &&
            subscription.current_period_end
        ) {
            console.log("Updating subscription with period data");

            // Prepare update data with safe date conversion
            const updateData: {
                stripeSubscriptionId: string;
                status: SubscriptionStatus;
                currentPeriodStart?: Date;
                currentPeriodEnd?: Date;
            } = {
                stripeSubscriptionId: subscription.id,
                status: mapStripeStatusToDbStatus(
                    subscription.status
                ) as SubscriptionStatus,
            };

            // Only add dates if they exist and are valid numbers
            if (typeof subscription.current_period_start === "number") {
                updateData.currentPeriodStart = new Date(
                    subscription.current_period_start * 1000
                );
            }
            if (typeof subscription.current_period_end === "number") {
                updateData.currentPeriodEnd = new Date(
                    subscription.current_period_end * 1000
                );
            }

            const updateSuccess =
                await updateSubscriptionByStripeId(updateData);

            if (updateSuccess) {
                console.log("Subscription period data updated successfully");
            } else {
                console.log("Failed to update subscription period data");
            }
        } else {
            console.log(
                "No period data available yet, subscription will be updated later"
            );
        }

        // Revalidate the dashboard
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error handling subscription created:", error);
    }
}

// Handle checkout session completion (now handles subscription creation)
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
    console.log("Processing checkout session completed");

    try {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process paid sessions
        if (session.payment_status !== "paid") {
            console.log("Session not paid, skipping:", session.payment_status);
            return;
        }

        const userId = await extractUserIdFromStripeEvent(event);
        if (!userId) {
            console.error("❌ Could not extract user ID from checkout session");
            console.error("🔍 Customer ID from event:", session.customer);
            console.error("🔍 Session metadata:", session.metadata);
            console.error("🔍 Full session object keys:", Object.keys(session));
            console.error("Event data:", JSON.stringify(event.data, null, 2));
            return;
        }

        console.log("✅ Successfully extracted userId:", userId);

        console.log("🔍 About to create subscription with data:", {
            userId,
            customer: session.customer,
            subscription: session.subscription,
        });

        // Create subscription record with basic data (period will be updated later)
        const success = await createSubscription({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "active", // Default to active
            plan: "premium",
            currentPeriodStart: new Date(), // Use current time as placeholder
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as placeholder
        });
        if (success) {
            console.log("✅ Subscription created successfully in database");
            // Update user subscription status
            await updateUserSubscriptionStatus(userId, true);
            console.log("✅ User subscription status updated to true");

            // User just subscribed - update all their videos to not expire
            console.log("🎬 Updating video expiry settings for new subscriber");
            await updateVideosOnSubscriptionUpgrade(userId);
            console.log("✅ Video expiry settings updated successfully");

            console.log(
                "🎉 Checkout session processed successfully - subscription created"
            );
        } else {
            console.error("❌ Failed to create subscription in database");
            console.error(
                "🔍 Attempted to create subscription with userId:",
                userId
            );
        }

        // Revalidate the dashboard
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error handling checkout session completed:", error);
    }
}

// Handle successful renewal payments
async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
    console.log("Processing invoice payment succeeded");

    try {
        const invoice = event.data.object as Stripe.Invoice & {
            subscription?: string;
        };
        const subscriptionId = invoice.subscription;

        console.log("Invoice data:", {
            id: invoice.id,
            subscription: invoice.subscription,
            customer: invoice.customer,
            amount_paid: invoice.amount_paid,
            billing_reason: invoice.billing_reason,
        });

        if (!subscriptionId) {
            console.log("No subscription ID in invoice, skipping");
            return;
        }

        const userId = await extractUserIdFromStripeEvent(event);
        if (!userId) {
            console.error("❌ Could not extract user ID from invoice");
            console.error("🔍 Customer ID from invoice:", invoice.customer);
            console.error(
                "🔍 Subscription ID from invoice:",
                invoice.subscription
            );
            console.error("🔍 Invoice metadata:", invoice.metadata);
            console.error("Event data:", JSON.stringify(event.data, null, 2));
            return;
        }

        console.log("✅ Successfully extracted userId from invoice:", userId);

        // Get subscription details from Stripe
        const stripeInstance = await stripe();
        const subscription = (await stripeInstance.subscriptions.retrieve(
            subscriptionId
        )) as Stripe.Subscription & {
            current_period_start?: number;
            current_period_end?: number;
        };

        console.log("Subscription from invoice:", {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            customer: subscription.customer,
        });

        // Try to update existing subscription first
        const updateSuccess = await updateSubscriptionByStripeId({
            stripeSubscriptionId: subscriptionId as string,
            status: mapStripeStatusToDbStatus(subscription.status),
            currentPeriodStart:
                subscription.current_period_start !== undefined
                    ? new Date(subscription.current_period_start * 1000)
                    : undefined,
            currentPeriodEnd:
                subscription.current_period_end !== undefined
                    ? new Date(subscription.current_period_end * 1000)
                    : undefined,
        });

        // If update failed, log the issue but DON'T create a new subscription
        // Subscriptions should only be created via checkout.session.completed
        if (!updateSuccess) {
            console.warn(
                "⚠️ Subscription update failed for invoice payment - this may indicate the subscription doesn't exist in our database"
            );
            console.warn(
                "🔍 This could happen if checkout.session.completed didn't process correctly"
            );
            console.warn("🔍 Subscription ID:", subscriptionId);
            console.warn("🔍 User ID:", userId);
            // Don't create a new subscription here - investigate the root cause
            return;
        } // Ensure user has subscription access
        await updateUserSubscriptionStatus(userId, true);

        // Revalidate the dashboard
        revalidatePath("/dashboard");

        console.log("Invoice payment succeeded processed successfully");
    } catch (error) {
        console.error("Error handling invoice payment succeeded:", error);
    }
}

// Handle failed renewal payments
async function handleInvoicePaymentFailed(event: Stripe.Event) {
    console.log(
        "Processing invoice payment failed - implementing immediate downgrade"
    );

    try {
        const invoice = event.data.object as Stripe.Invoice & {
            subscription?: string;
        };
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) {
            console.log("No subscription ID in invoice, skipping");
            return;
        }

        // Get user ID from the event
        const userId = await extractUserIdFromStripeEvent(event);
        if (!userId) {
            console.error(
                "Could not extract user ID from invoice payment failed event"
            );
            return;
        }

        // Immediately cancel subscription and downgrade user to free plan
        const success = await updateSubscriptionByStripeId({
            stripeSubscriptionId: subscriptionId as string,
            status: "canceled", // Immediately cancel instead of past_due
        });

        if (success) {
            console.log(
                "Subscription marked as canceled due to payment failure"
            );

            // Remove user's premium access immediately
            await updateUserSubscriptionStatus(userId, false);
            console.log("User subscription status set to false");

            // Apply immediate downgrade - all videos now expire
            console.log(
                "Applying immediate downgrade - setting all videos to expire"
            );
            await handleImmediateSubscriptionDowngrade(userId);
            console.log("Immediate downgrade completed successfully");

            // Revalidate the dashboard
            revalidatePath("/dashboard");

            console.log(
                "Payment failure processed successfully - user downgraded to free plan"
            );
        } else {
            console.error(
                "Failed to update subscription status for payment failure"
            );
        }
    } catch (error) {
        console.error("Error handling invoice payment failed:", error);
    }
}

// Handle subscription updates (status changes, etc.)
async function handleSubscriptionUpdated(event: Stripe.Event) {
    console.log("Processing subscription updated");

    try {
        const subscription = event.data.object as Stripe.Subscription & {
            current_period_start?: number;
            current_period_end?: number;
            canceled_at?: number;
        };
        const userId = await extractUserIdFromStripeEvent(event);

        if (!userId) {
            console.error("Could not extract user ID from subscription update");
            return;
        }

        // Prepare update data with safe date conversion
        const updateData: {
            stripeSubscriptionId: string;
            status: SubscriptionStatus;
            currentPeriodStart?: Date;
            currentPeriodEnd?: Date;
            cancelAtPeriodEnd?: boolean;
            canceledAt?: Date;
        } = {
            stripeSubscriptionId: subscription.id,
            status: mapStripeStatusToDbStatus(
                subscription.status
            ) as SubscriptionStatus,
        };

        // Only add dates if they exist and are valid
        if (
            subscription.current_period_start &&
            typeof subscription.current_period_start === "number"
        ) {
            updateData.currentPeriodStart = new Date(
                subscription.current_period_start * 1000
            );
        }
        if (
            subscription.current_period_end &&
            typeof subscription.current_period_end === "number"
        ) {
            updateData.currentPeriodEnd = new Date(
                subscription.current_period_end * 1000
            );
        }

        // Track cancellation state
        if (subscription.cancel_at_period_end !== undefined) {
            updateData.cancelAtPeriodEnd = subscription.cancel_at_period_end;

            // If this is a new cancellation request, record when it was canceled
            if (subscription.cancel_at_period_end && subscription.canceled_at) {
                updateData.canceledAt = new Date(
                    subscription.canceled_at * 1000
                );
            }
        }

        console.log("Updating subscription with data:", updateData);

        // Update subscription in database
        const success = await updateSubscriptionByStripeId(updateData);
        if (success) {
            // Update user access based on subscription status
            const hasAccess = shouldHaveSubscriptionAccess(subscription.status);
            await updateUserSubscriptionStatus(userId, hasAccess);

            // Handle video expiry changes based on subscription status
            if (hasAccess) {
                // User now has premium access - update all their videos to not expire
                console.log(
                    "User upgraded to premium, updating video expiry settings"
                );
                await updateVideosOnSubscriptionUpgrade(userId);
            } else {
                // User lost premium access - handle with grace period
                console.log(
                    "User lost premium access, applying grace period for existing videos"
                );
                await handleSubscriptionDowngrade(userId);
            }

            // Revalidate the dashboard
            revalidatePath("/dashboard");

            console.log("Subscription updated processed successfully");
        } else {
            console.error("Failed to update subscription in database");
        }
    } catch (error) {
        console.error("Error handling subscription updated:", error);
    }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(event: Stripe.Event) {
    console.log("Processing subscription deleted");

    try {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await extractUserIdFromStripeEvent(event);

        if (!userId) {
            console.error(
                "Could not extract user ID from subscription deletion"
            );
            return;
        }

        // Update subscription status
        const success = await updateSubscriptionByStripeId({
            stripeSubscriptionId: subscription.id,
            status: "canceled",
        });
        if (success) {
            // Remove user's subscription access
            await updateUserSubscriptionStatus(userId, false);

            // Handle video expiry changes - apply grace period for existing videos
            console.log(
                "Subscription deleted, applying grace period for existing videos"
            );
            await handleSubscriptionDowngrade(userId);

            // Revalidate the dashboard
            revalidatePath("/dashboard");

            console.log("Subscription deleted processed successfully");
        } else {
            console.error("Failed to update subscription for deletion");
        }
    } catch (error) {
        console.error("Error handling subscription deleted:", error);
    }
}

// Handle billing portal session creation
async function handleBillingPortalSessionCreated(event: Stripe.Event) {
    console.log("Processing billing portal session created");

    try {
        const session = event.data.object as Stripe.BillingPortal.Session;
        console.log("Billing portal session created:", {
            id: session.id,
            customer: session.customer,
            url: session.url,
        });

        // Log for analytics/tracking purposes
        // Could also be used to track portal usage if needed
        console.log("User accessed billing portal");
    } catch (error) {
        console.error("Error handling billing portal session created:", error);
    }
}
