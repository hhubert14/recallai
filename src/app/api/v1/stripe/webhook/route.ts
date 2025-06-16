"use server";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe/stripe";
import { extractUserIdFromStripeEvent, mapStripeStatusToDbStatus, shouldHaveSubscriptionAccess } from "@/data-access/subscriptions/webhook-utils";
import { createSubscription } from "@/data-access/subscriptions/create-subscription";
import { updateSubscriptionByStripeId } from "@/data-access/subscriptions/update-subscription";
import { updateUserSubscriptionStatus, resetUserMonthlyUsage } from "@/data-access/users/update-user-subscription";

// Simple in-memory cache to prevent duplicate processing
const processedEvents = new Map<string, number>();

function isEventAlreadyProcessed(eventId: string): boolean {
    const now = Date.now();
    const lastProcessed = processedEvents.get(eventId);
    
    // If processed within the last 5 minutes, consider it a duplicate
    if (lastProcessed && (now - lastProcessed) < 5 * 60 * 1000) {
        return true;
    }
    
    // Clean up old entries (older than 10 minutes)
    for (const [id, timestamp] of processedEvents.entries()) {
        if ((now - timestamp) > 10 * 60 * 1000) {
            processedEvents.delete(id);
        }
    }
    
    // Mark as processed
    processedEvents.set(eventId, now);
    return false;
}

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

        if (
            event.type === "checkout.session.completed" &&
            event.data.object.payment_status === "paid"
        ) {
            // Revalidate the path to update any cached data
            revalidatePath(`/dashboard`);
        }
        // Log the event for debugging purposes
        console.log(`Received event: ${event.type} (ID: ${event.id})`);
        
        // Check for duplicate events
        if (isEventAlreadyProcessed(event.id)) {
            console.log(`Event ${event.id} already processed, skipping`);
            return new Response(JSON.stringify({ received: true, skipped: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        // Handle the event
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

// Handle subscription creation (update period data)
async function handleSubscriptionCreated(event: any) {
    console.log("Processing subscription created");
    
    try {
        const subscription = event.data.object;
        
        console.log("Subscription created data:", {
            id: subscription.id,
            customer: subscription.customer,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            created: subscription.created
        });

        // If we have period data, update the existing subscription record
        if (subscription.current_period_start && subscription.current_period_end) {
            console.log("Updating subscription with period data");
            
            // Prepare update data with safe date conversion
            const updateData: any = {
                stripeSubscriptionId: subscription.id,
                status: mapStripeStatusToDbStatus(subscription.status),
            };

            // Only add dates if they exist and are valid numbers
            if (typeof subscription.current_period_start === 'number') {
                updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
            }
            if (typeof subscription.current_period_end === 'number') {
                updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
            }

            const updateSuccess = await updateSubscriptionByStripeId(updateData);

            if (updateSuccess) {
                console.log("Subscription period data updated successfully");
            } else {
                console.log("Failed to update subscription period data");
            }
        } else {
            console.log("No period data available yet, subscription will be updated later");
        }

        // Revalidate the dashboard
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Error handling subscription created:", error);
    }
}

// Handle checkout session completion (now handles subscription creation)
async function handleCheckoutSessionCompleted(event: any) {
    console.log("Processing checkout session completed");
    
    try {
        const session = event.data.object;
        
        // Only process paid sessions
        if (session.payment_status !== "paid") {
            console.log("Session not paid, skipping:", session.payment_status);
            return;
        }

        const userId = await extractUserIdFromStripeEvent(event);
        if (!userId) {
            console.error("Could not extract user ID from checkout session");
            return;
        }

        console.log("Creating subscription with checkout session data:", {
            userId,
            customer: session.customer,
            subscription: session.subscription
        });

        // Create subscription record with basic data (period will be updated later)
        const success = await createSubscription({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'active', // Default to active
            plan: 'premium',
            currentPeriodStart: new Date(), // Use current time as placeholder
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as placeholder
        });

        if (success) {
            // Update user subscription status
            await updateUserSubscriptionStatus(userId, true);
            
            // Reset monthly usage for new subscription
            await resetUserMonthlyUsage(userId);
            
            console.log("Checkout session processed successfully - subscription created");
        } else {
            console.error("Failed to create subscription in database");
        }

        // Revalidate the dashboard
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Error handling checkout session completed:", error);
    }
}

// Handle successful renewal payments
async function handleInvoicePaymentSucceeded(event: any) {
    console.log("Processing invoice payment succeeded");
    
    try {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        console.log("Invoice data:", {
            id: invoice.id,
            subscription: invoice.subscription,
            customer: invoice.customer,
            amount_paid: invoice.amount_paid,
            billing_reason: invoice.billing_reason
        });
        
        if (!subscriptionId) {
            console.log("No subscription ID in invoice, skipping");
            return;
        }

        const userId = await extractUserIdFromStripeEvent(event);
        if (!userId) {
            console.error("Could not extract user ID from invoice");
            return;
        }

        // Get subscription details from Stripe
        const stripeInstance = await stripe();
        const subscriptionResponse = await stripeInstance.subscriptions.retrieve(subscriptionId);
        const subscription = subscriptionResponse as any; // Cast to bypass type issues
        
        console.log("Subscription from invoice:", {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            customer: subscription.customer
        });
        
        // Try to update existing subscription first
        const updateSuccess = await updateSubscriptionByStripeId({
            stripeSubscriptionId: subscriptionId,
            status: mapStripeStatusToDbStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        // If update failed, this might be a new subscription, try to create it
        if (!updateSuccess) {
            console.log("Subscription update failed, attempting to create new subscription");
            const createSuccess = await createSubscription({
                userId,
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                status: mapStripeStatusToDbStatus(subscription.status),
                plan: 'premium',
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });
            
            if (!createSuccess) {
                console.error("Failed to create subscription in database");
                return;
            }
        }

        // Ensure user has subscription access
        await updateUserSubscriptionStatus(userId, true);
        
        // Reset monthly usage for new billing period
        await resetUserMonthlyUsage(userId);
        
        // Revalidate the dashboard
        revalidatePath('/dashboard');
        
        console.log("Invoice payment succeeded processed successfully");
    } catch (error) {
        console.error("Error handling invoice payment succeeded:", error);
    }
}

// Handle failed renewal payments
async function handleInvoicePaymentFailed(event: any) {
    console.log("Processing invoice payment failed");
    
    try {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (!subscriptionId) {
            console.log("No subscription ID in invoice, skipping");
            return;
        }

        // Get subscription details from Stripe to get current status
        const stripeInstance = await stripe();
        const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);

        // Update subscription status (Stripe will set it to 'past_due')
        const success = await updateSubscriptionByStripeId({
            stripeSubscriptionId: subscriptionId,
            status: mapStripeStatusToDbStatus(subscription.status),
        });

        if (success) {
            console.log("Invoice payment failed processed successfully");
        } else {
            console.error("Failed to update subscription status for failed payment");
        }
    } catch (error) {
        console.error("Error handling invoice payment failed:", error);
    }
}

// Handle subscription updates (status changes, etc.)
async function handleSubscriptionUpdated(event: any) {
    console.log("Processing subscription updated");
    
    try {
        const subscription = event.data.object;
        const userId = await extractUserIdFromStripeEvent(event);
        
        if (!userId) {
            console.error("Could not extract user ID from subscription update");
            return;
        }

        // Prepare update data with safe date conversion
        const updateData: any = {
            stripeSubscriptionId: subscription.id,
            status: mapStripeStatusToDbStatus(subscription.status),
        };

        // Only add dates if they exist and are valid
        if (subscription.current_period_start && typeof subscription.current_period_start === 'number') {
            updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        }
        if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
            updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        }

        // Track cancellation state
        if (subscription.cancel_at_period_end !== undefined) {
            updateData.cancelAtPeriodEnd = subscription.cancel_at_period_end;
            
            // If this is a new cancellation request, record when it was canceled
            if (subscription.cancel_at_period_end && subscription.canceled_at) {
                updateData.canceledAt = new Date(subscription.canceled_at * 1000);
            }
        }

        console.log("Updating subscription with data:", updateData);

        // Update subscription in database
        const success = await updateSubscriptionByStripeId(updateData);

        if (success) {
            // Update user access based on subscription status
            const hasAccess = shouldHaveSubscriptionAccess(subscription.status);
            await updateUserSubscriptionStatus(userId, hasAccess);
            
            // Revalidate the dashboard
            revalidatePath('/dashboard');
            
            console.log("Subscription updated processed successfully");
        } else {
            console.error("Failed to update subscription in database");
        }
    } catch (error) {
        console.error("Error handling subscription updated:", error);
    }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(event: any) {
    console.log("Processing subscription deleted");
    
    try {
        const subscription = event.data.object;
        const userId = await extractUserIdFromStripeEvent(event);
        
        if (!userId) {
            console.error("Could not extract user ID from subscription deletion");
            return;
        }

        // Update subscription status
        const success = await updateSubscriptionByStripeId({
            stripeSubscriptionId: subscription.id,
            status: 'canceled',
        });

        if (success) {
            // Remove user's subscription access
            await updateUserSubscriptionStatus(userId, false);
            
            // Revalidate the dashboard
            revalidatePath('/dashboard');
            
            console.log("Subscription deleted processed successfully");
        } else {
            console.error("Failed to update subscription for deletion");
        }
    } catch (error) {
        console.error("Error handling subscription deleted:", error);
    }
}

// Handle billing portal session creation
async function handleBillingPortalSessionCreated(event: any) {
    console.log("Processing billing portal session created");
    
    try {
        const session = event.data.object;
        console.log("Billing portal session created:", {
            id: session.id,
            customer: session.customer,
            url: session.url
        });
        
        // Log for analytics/tracking purposes
        // Could also be used to track portal usage if needed
        console.log("User accessed billing portal");
    } catch (error) {
        console.error("Error handling billing portal session created:", error);
    }
}
