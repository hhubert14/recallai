# Testing Stripe Customer Portal Implementation

## Prerequisites

1. **Configure Stripe Customer Portal** (see STRIPE_CUSTOMER_PORTAL_SETUP.md)
2. **Have an active subscription** to test cancellation

## Test Steps

### 1. Basic Portal Access Test

1. **Create a test subscription**:
   ```bash
   # Start your app
   npm run dev
   
   # In another terminal, start Stripe webhooks
   npm run stripe
   ```

2. **Subscribe with test card**:
   - Go to `http://localhost:3000/dashboard/pricing`
   - Click "Upgrade to Premium"
   - Use card: `4242 4242 4242 4242`
   - Complete checkout

3. **Test Portal Access**:
   - Go to `http://localhost:3000/dashboard/settings`
   - Click "Manage Billing" button
   - Should redirect to Stripe Customer Portal

### 2. Cancellation Test

1. **In the Customer Portal**:
   - Click "Cancel subscription"
   - Choose "Cancel at end of billing period" (recommended)
   - Or "Cancel immediately" (loses access right away)
   - Follow cancellation flow

2. **Verify cancellation webhook**:
   - Check your terminal for webhook logs
   - Should see: `Processing subscription updated` or `Processing subscription deleted`
   - Database should be updated with new status

3. **Check your app**:
   - Return to settings page
   - Subscription status should reflect cancellation
   - User should lose/retain access based on cancellation type

### 3. Test from Pricing Page

1. **As a premium user**:
   - Go to `http://localhost:3000/dashboard/pricing`
   - Premium plan should show "Current Plan" + "Manage Billing" button
   - Click "Manage Billing" → should open Customer Portal

### 4. Payment Method Update Test

1. **In Customer Portal**:
   - Click "Update payment method"
   - Add/remove cards
   - Verify changes are saved

### 5. Billing History Test

1. **In Customer Portal**:
   - View invoice history
   - Download receipts
   - Verify all past payments are listed

## Expected Results

✅ **Settings Page**:
- "Manage Billing" button appears for subscribed users
- Button redirects to Stripe Customer Portal
- Portal shows subscription details

✅ **Pricing Page**:
- Premium subscribers see "Manage Billing" option
- Non-subscribers see "Upgrade to Premium"

✅ **Cancellation**:
- Users can cancel subscriptions
- Webhooks process cancellation events
- Database reflects new subscription status
- User access updated appropriately

✅ **Error Handling**:
- Non-subscribed users get helpful error message
- Portal redirects back to settings page after actions

## Database Verification

```sql
-- Check subscription status after cancellation
SELECT 
    u.email,
    u.is_subscribed,
    s.status,
    s.current_period_end,
    s.stripe_subscription_id
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY s.updated_at DESC;
```

## Troubleshooting

**Error: "No subscription found"**
- User doesn't have a Stripe customer ID
- Create a subscription first

**Portal doesn't open**
- Check Stripe Customer Portal is activated in dashboard
- Verify environment variables are set

**Cancellation not reflected**
- Check webhook processing logs
- Verify webhook endpoint is working
- Check subscription status in Stripe Dashboard

## Production Checklist

- [ ] Configure Customer Portal in live Stripe account
- [ ] Set production return URLs
- [ ] Test with real payment methods
- [ ] Monitor webhook delivery rates
- [ ] Set up cancellation analytics/alerts
