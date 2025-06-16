-- Payment Failure Test Verification Query
-- Run this in Supabase SQL Editor to check the results

SELECT 
    u.email,
    u.is_subscribed,
    u.stripe_customer_id,
    u.monthly_video_count,
    s.id as subscription_id,
    s.status as subscription_status,
    s.stripe_subscription_id,
    s.created_at as subscription_created
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.id = '1cbf8c84-ffbc-4523-9c76-35132781facb'
   OR u.stripe_customer_id = 'cus_SVUphuaiSlk6kf';

-- Expected Results for Failed Payment:
-- ✅ stripe_customer_id: 'cus_SVUphuaiSlk6kf' (should be populated)
-- ✅ is_subscribed: false (should remain false)
-- ✅ subscription_id: NULL (no subscription should be created)
-- ✅ subscription_status: NULL (no subscription)
-- ✅ monthly_video_count: should be 0-5 (free plan limit)
