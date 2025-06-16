# Stripe Subscription System - Advanced Testing Guide

## 🧪 Critical Test Scenarios

Since the basic subscription flow is working, you should test these important edge cases to ensure your system is truly production-ready:

### 1. 💳 **Payment Failure Testing**

#### Test Failed Initial Payment
1. **Setup**: Use Stripe test card that always fails
   ```
   Card Number: 4000 0000 0000 0002 (Generic decline)
   Or: 4000 0000 0000 9995 (Insufficient funds)
   ```

2. **Expected Behavior**:
   - Subscription created with `incomplete` status
   - User should NOT get subscription access
   - Webhook `invoice.payment_failed` should be processed
   - User remains on free plan

3. **Verification**:
   ```sql
   -- Check subscription status after failed payment
   SELECT s.status, u.is_subscribed, s.stripe_subscription_id
   FROM subscriptions s
   JOIN users u ON s.user_id = u.id
   WHERE s.stripe_subscription_id = 'sub_xxx';
   ```

#### Test Failed Renewal Payment
1. **Setup**: 
   - Create successful subscription first
   - In Stripe Dashboard, simulate failed renewal by updating payment method to failing card
   
2. **Expected Behavior**:
   - Subscription status changes to `past_due`
   - User retains access (grace period)
   - Webhook `invoice.payment_failed` processes correctly
   - Database updated to `past_due` status

### 2. 🔄 **Monthly Renewal Testing**

#### Simulate Successful Renewal
1. **Setup**: In Stripe Dashboard
   - Go to your test subscription
   - Click "Advance billing cycle" to simulate next month
   
2. **Expected Behavior**:
   - Webhook `invoice.payment_succeeded` triggered
   - User monthly usage reset to 0
   - Subscription period dates updated
   - User retains premium access

3. **Verification**:
   ```sql
   -- Check renewal was processed correctly
   SELECT 
       u.monthly_video_count,
       u.last_reset_date,
       s.current_period_start,
       s.current_period_end,
       s.status
   FROM users u
   JOIN subscriptions s ON u.id = s.user_id
   WHERE u.stripe_customer_id = 'cus_xxx';
   ```

### 3. 🚫 **Subscription Cancellation Testing**

#### Test User-Initiated Cancellation
1. **Setup**: In Stripe Dashboard
   - Find your test subscription
   - Click "Cancel subscription"
   - Choose "Cancel at period end" vs "Cancel immediately"

2. **Expected Behavior**:
   - Webhook `customer.subscription.updated` or `customer.subscription.deleted`
   - User loses access (immediate) or retains until period end
   - Database status updated to `canceled`
   - User redirected to upgrade flow

### 4. 📊 **Usage Limit Testing**

#### Test Free User Hitting Monthly Limit
1. **Setup**: 
   - Ensure user is on free plan
   - Manually update their monthly video count to 5 (the limit)
   
2. **Test**: Try to process another video
3. **Expected**: Should be blocked or shown upgrade prompt

#### Test Premium User Unlimited Access
1. **Setup**: Subscribed user
2. **Test**: Process many videos (>5)
3. **Expected**: No limits, all videos processed

### 5. 🔧 **Edge Case Testing**

#### Test Webhook Delivery Failures
1. **Setup**: Temporarily break your webhook endpoint (return 500 error)
2. **Expected**: Stripe will retry webhooks automatically
3. **Verification**: Check Stripe Dashboard webhook logs

#### Test Duplicate Webhook Events
1. **Setup**: Already handled by your duplicate prevention code
2. **Test**: Process same event multiple times
3. **Expected**: No duplicate subscriptions created

#### Test User Deletion/Cleanup
1. **Test**: What happens if user account is deleted but has active subscription
2. **Expected**: Proper cascade handling or orphan prevention

## 🛠️ **Testing Tools & Commands**

### Stripe CLI Testing Commands
```bash
# Test specific webhook events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Listen to specific events only
stripe listen --events="invoice.payment_failed,customer.subscription.updated" --forward-to localhost:3000/api/v1/stripe/webhook
```

### Database Testing Queries
```sql
-- Reset user for testing (set back to free)
UPDATE users 
SET is_subscribed = false, monthly_video_count = 0
WHERE stripe_customer_id = 'cus_xxx';

-- Clean up test subscriptions
DELETE FROM subscriptions 
WHERE stripe_customer_id = 'cus_xxx';

-- Simulate monthly usage limit reached
UPDATE users 
SET monthly_video_count = 5
WHERE stripe_customer_id = 'cus_xxx';

-- Check webhook processing logs
SELECT * FROM logs WHERE message LIKE '%webhook%' ORDER BY created_at DESC;
```

## 📋 **Test Checklist**

### Payment Scenarios
- [ ] Initial payment success ✅ (already tested)
- [ ] Initial payment failure
- [ ] Successful monthly renewal
- [ ] Failed monthly renewal (past_due handling)
- [ ] Multiple failed renewals (eventual cancellation)

### Subscription Lifecycle
- [ ] Subscription creation ✅ (already tested)
- [ ] Subscription updates (plan changes)
- [ ] Subscription cancellation (immediate)
- [ ] Subscription cancellation (at period end)
- [ ] Subscription reactivation

### User Experience
- [ ] Free user hitting video limit
- [ ] Premium user unlimited access
- [ ] Subscription status display in UI
- [ ] Upgrade/downgrade flows
- [ ] Grace period access (past_due status)

### Technical Robustness
- [ ] Webhook retry handling
- [ ] Duplicate event prevention ✅ (already implemented)
- [ ] Database transaction consistency
- [ ] Error logging and monitoring
- [ ] Performance under load

## 🚨 **High Priority Tests**

Focus on these first as they're most likely to occur in production:

1. **Failed Renewal Payment** - Very common, needs graceful handling
2. **User Cancellation** - Common user action, must work smoothly  
3. **Monthly Usage Reset** - Critical for business model
4. **Past Due Grace Period** - Important for user retention

## 🔍 **Monitoring What to Watch**

### Logs to Monitor
```bash
# Watch webhook processing
tail -f logs/webhook.log | grep -E "(error|failed|success)"

# Monitor subscription status changes
tail -f logs/app.log | grep -E "(subscription|status|payment)"
```

### Stripe Dashboard Checks
- Webhook delivery success rate (should be >99%)
- Failed payment retry attempts
- Subscription churn metrics
- Revenue recognition accuracy

### Database Health Checks
- No orphaned subscriptions
- Consistent user subscription flags
- Proper usage count resets
- No duplicate customer IDs

Would you like me to help you set up specific tests for any of these scenarios?
