# Stripe CLI Testing Commands

## Quick Webhook Event Testing

### 1. Test Payment Failure Webhooks
```bash
# Start webhook listener first (in separate terminal)
npm run stripe

# In another terminal, trigger payment failure events:
stripe trigger invoice.payment_failed

# Trigger subscription update (status change)
stripe trigger customer.subscription.updated

# Trigger cancellation
stripe trigger customer.subscription.deleted
```

### 2. Test Renewal Success
```bash
# Trigger successful payment
stripe trigger invoice.payment_succeeded

# This should:
# - Reset monthly usage
# - Update subscription period
# - Maintain user access
```

### 3. Monitor Webhook Processing
```bash
# Watch webhook events in real-time
stripe listen --events="invoice.payment_failed,invoice.payment_succeeded,customer.subscription.updated,customer.subscription.deleted" --forward-to localhost:3000/api/v1/stripe/webhook

# Or just payment events
stripe listen --events="invoice.payment_failed,invoice.payment_succeeded" --forward-to localhost:3000/api/v1/stripe/webhook
```

### 4. Create Test Scenarios
```bash
# Create a subscription that will fail initial payment
stripe subscriptions create \
  --customer cus_CUSTOMER_ID \
  --items[0][price]=price_1RVDqlRZzrkl5nOgpYbtHTSi \
  --payment_behavior=default_incomplete

# Create a past-due subscription
stripe subscriptions update sub_SUBSCRIPTION_ID \
  --metadata[status]=past_due
```

### 5. Database Verification Commands
```sql
-- Quick status check
SELECT 
    u.email,
    u.is_subscribed,
    u.monthly_video_count,
    s.status,
    s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id IS NOT NULL;

-- Check recent webhook processing
SELECT 
    stripe_subscription_id,
    status,
    updated_at
FROM subscriptions 
ORDER BY updated_at DESC 
LIMIT 5;

-- Reset user for testing
UPDATE users 
SET is_subscribed = false, monthly_video_count = 0
WHERE email = 'test@example.com';
```

## Testing Priority Order:

1. **Failed Initial Payment** (Most Critical)
   - Use card `4000 0000 0000 0002`
   - Verify user doesn't get access
   - Check `incomplete` status handling

2. **Monthly Renewal Success** 
   - Advance billing cycle in dashboard
   - Verify usage reset and period update

3. **Failed Renewal (Past Due)**
   - Set failing payment method
   - Verify grace period access

4. **Cancellation Handling**
   - Cancel subscription in dashboard
   - Verify immediate access removal

5. **Edge Cases**
   - Duplicate webhook events
   - Invalid customer IDs
   - Network failures during processing
