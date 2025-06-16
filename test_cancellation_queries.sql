-- Test Queries: Subscription Cancellation Verification
-- Run these in Supabase SQL Editor to verify cancellation handling

-- 1. Check subscription with cancellation details
SELECT 
    u.email,
    u.is_subscribed,
    s.status,
    s.cancel_at_period_end,
    s.canceled_at,
    s.current_period_end,
    CASE 
        WHEN s.cancel_at_period_end = true THEN 'WILL CANCEL AT PERIOD END'
        WHEN s.status = 'canceled' THEN 'CANCELED'
        WHEN s.status = 'active' THEN 'ACTIVE'
        ELSE s.status
    END as cancellation_status,
    CASE 
        WHEN s.cancel_at_period_end = true AND s.current_period_end > NOW() THEN 'HAS ACCESS UNTIL ' || s.current_period_end
        WHEN s.status IN ('active', 'trialing', 'past_due') THEN 'HAS ACCESS'
        ELSE 'NO ACCESS'
    END as access_status
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY s.created_at DESC;

-- 2. Simulate checking a subscription set to cancel at period end
-- (This will be true for subscriptions canceled via Customer Portal)
SELECT 
    'Subscription will cancel at period end' as message,
    current_period_end as cancels_on,
    EXTRACT(DAYS FROM (current_period_end - NOW())) as days_remaining
FROM subscriptions 
WHERE cancel_at_period_end = true 
  AND status = 'active';

-- 3. Find subscriptions that are about to expire
SELECT 
    u.email,
    s.stripe_subscription_id,
    s.current_period_end,
    s.cancel_at_period_end,
    EXTRACT(DAYS FROM (s.current_period_end - NOW())) as days_until_expiry
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.cancel_at_period_end = true 
  AND s.current_period_end > NOW()
  AND s.current_period_end < NOW() + INTERVAL '7 days';
