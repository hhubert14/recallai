# Test Script: Failed Payment Scenarios

## Test 1: Failed Initial Payment

### Setup
1. **Use this test card**: `4000 0000 0000 0002` (Generic decline)
2. **Or this one**: `4000 0000 0000 9995` (Insufficient funds)

### Steps to Test:
1. Navigate to `http://localhost:3000/dashboard/pricing`
2. Click "Upgrade to Premium" 
3. Use the failing test card number above
4. Any expiry date in the future (e.g., 12/26)
5. Any CVC (e.g., 123)
6. Complete the checkout

### Expected Results:
- ❌ Payment should fail
- ❌ User should NOT get premium access
- 📊 Check database: subscription should have `incomplete` status
- 🚫 User's `is_subscribed` should remain `false`

### Verification Queries:
```sql
-- Check the failed subscription
SELECT 
    u.email,
    u.is_subscribed,
    s.status,
    s.stripe_subscription_id,
    s.created_at
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY s.created_at DESC;

-- Should show: is_subscribed = false, status = 'incomplete'
```

## Test 2: Successful Renewal Simulation

### Steps:
1. First ensure you have a working subscription (use `4242 4242 4242 4242`)
2. In Stripe Dashboard:
   - Go to Customers → Find your test customer
   - Click on the subscription
   - Click "Actions" → "Advance billing cycle"
   - This simulates the next monthly billing

### Expected Results:
- ✅ `invoice.payment_succeeded` webhook triggered
- ✅ User monthly usage reset to 0
- ✅ Subscription dates updated
- ✅ User retains premium access

### Verification Queries:
```sql
-- Check renewal processing
SELECT 
    u.monthly_video_count,
    u.last_reset_date,
    s.current_period_start,
    s.current_period_end,
    s.status
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id = 'cus_YOUR_CUSTOMER_ID';

-- Should show: monthly_video_count = 0, updated dates
```

## Test 3: Failed Renewal (Past Due)

### Steps:
1. With active subscription, go to Stripe Dashboard
2. Customer → Payment Methods → Delete current payment method
3. Add failing card `4000 0000 0000 0002`
4. Advance billing cycle (this will fail)

### Expected Results:
- ⚠️ Subscription status becomes `past_due`
- ✅ User retains access (grace period)
- 📊 Database updated correctly
- 🔔 Webhook processed successfully

## Test 4: Subscription Cancellation

### Steps:
1. In Stripe Dashboard:
   - Go to subscription
   - Click "Cancel subscription"
   - Choose "Cancel immediately"

### Expected Results:
- ❌ Subscription status becomes `canceled`
- ❌ User loses premium access
- 📊 `is_subscribed` becomes `false`
- 🔔 `customer.subscription.deleted` webhook processed
