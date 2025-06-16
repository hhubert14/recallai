// Test Script: Force Billing Cycle Advance
// You can run this in a Node.js script or add it as a test endpoint

const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY'); // Use your test key

async function testRenewal() {
    try {
        // Method 1: Advance billing cycle
        const subscription = await stripe.subscriptions.update(
            'sub_SUBSCRIPTION_ID', // Replace with actual subscription ID
            {
                billing_cycle_anchor: 'now',
                trial_end: 'now'
            }
        );
        
        console.log('Billing cycle advanced:', subscription.id);
        
        // Method 2: Create invoice immediately
        const invoice = await stripe.invoices.create({
            customer: 'cus_SVUphuaiSlk6kf', // Your customer ID
            auto_advance: true
        });
        
        await stripe.invoices.pay(invoice.id);
        console.log('Invoice created and paid:', invoice.id);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testRenewal();
