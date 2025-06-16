-- Quick Testing Queries for Stripe Subscription System

-- 1. Check Current Subscription Status
SELECT 
    u.email,
    u.is_subscribed,
    u.monthly_video_count,
    u.stripe_customer_id,
    s.status as subscription_status,
    s.plan,
    s.current_period_start,
    s.current_period_end,
    s.stripe_subscription_id,
    s.created_at
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY s.created_at DESC;

-- 2. Find User by Email (for testing)
SELECT 
    u.*,
    s.status,
    s.stripe_subscription_id
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'your-test-email@example.com';

-- 3. Check for Duplicate Subscriptions
SELECT 
    stripe_subscription_id, 
    COUNT(*) as count
FROM subscriptions 
GROUP BY stripe_subscription_id 
HAVING COUNT(*) > 1;

-- 4. Recent Webhook Activity (check what events processed)
SELECT 
    'subscription_created' as event_type,
    created_at,
    stripe_subscription_id,
    status
FROM subscriptions 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 5. Reset User for Testing (makes user free again)
-- UPDATE users 
-- SET is_subscribed = false, monthly_video_count = 0
-- WHERE email = 'your-test-email@example.com';

-- 6. Clean Up Test Subscriptions
-- DELETE FROM subscriptions 
-- WHERE stripe_customer_id IN (
--     SELECT stripe_customer_id 
--     FROM users 
--     WHERE email LIKE '%test%' OR email LIKE '%example%'
-- );

-- 7. Check Subscription Access Logic
SELECT 
    status,
    CASE 
        WHEN status IN ('active', 'trialing', 'past_due') THEN 'HAS ACCESS'
        ELSE 'NO ACCESS'
    END as access_status,
    COUNT(*) as count
FROM subscriptions 
GROUP BY status;

-- 8. Find All Test Customers
SELECT 
    u.email,
    u.stripe_customer_id,
    s.stripe_subscription_id,
    s.status
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.stripe_customer_id LIKE 'cus_%'
ORDER BY u.created_at DESC;

-- 9. Usage Tracking Check
SELECT 
    email,
    monthly_video_count,
    is_subscribed,
    last_reset_date,
    CASE 
        WHEN is_subscribed THEN 'UNLIMITED'
        WHEN monthly_video_count >= 5 THEN 'LIMIT REACHED'
        ELSE CONCAT(monthly_video_count, '/5 used')
    END as usage_status
FROM users
WHERE stripe_customer_id IS NOT NULL;

-- 10. Subscription Health Check
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with Stripe Customer ID',
    COUNT(*)
FROM users WHERE stripe_customer_id IS NOT NULL
UNION ALL
SELECT 
    'Active Subscriptions',
    COUNT(*)
FROM subscriptions WHERE status = 'active'
UNION ALL
SELECT 
    'Subscribed Users',
    COUNT(*)
FROM users WHERE is_subscribed = true;
