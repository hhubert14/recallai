# Premium Features Testing Guide

## Quick Testing Shortcuts

### Fast Database User Setup

```sql
-- Create test user with premium subscription
INSERT INTO users (id, email, is_subscribed)
VALUES ('test-user-id', 'test@example.com', true);

INSERT INTO user_subscriptions (user_id, is_subscribed, plan_type, stripe_customer_id)
VALUES ('test-user-id', true, 'premium', 'cus_test123');

-- Toggle between free and premium for testing
UPDATE user_subscriptions SET is_subscribed = false WHERE user_id = 'test-user-id'; -- Make free
UPDATE user_subscriptions SET is_subscribed = true WHERE user_id = 'test-user-id';  -- Make premium
```

### Test Video URLs (Educational Content)

- Khan Academy: `https://www.youtube.com/watch?v=EDUCATIONAL_VIDEO_ID`
- MIT OpenCourseWare: Use any MIT course video
- Tutorial channels: freeCodeCamp, Traversy Media, etc.

### Quick Extension Token Setup

1. Go to `/dashboard` and open browser dev tools
2. Look for extension token in network requests
3. Use token for API testing with tools like Postman

# Premium Features Testing Guide

## 1. Monthly Video Limits Testing

### Test Free User Limits (5 videos/month)

1. Create a test user account
2. Process 5 videos through the extension
3. Try to process a 6th video - should get error: "You have reached your free monthly limit"
4. Check the error type: `MONTHLY_LIMIT_EXCEEDED`

- Notes: works

### Test Premium User Unlimited Access

1. Upgrade test user to premium
2. Process more than 5 videos in the same month
3. Should work without limits

- Notes: When the user upgrades to premium the should_expire field is set to FALSE for all their videos

## 2. Video Expiry System Testing

### Test Free User Video Expiry

1. Process a video as free user
2. Check database: video should have `should_expire: true`
3. Check expiry_date: should be 7 days from creation
4. View in dashboard: should show "Expires in X days"

- Notes: works

### Test Premium User Permanent Videos

1. Process a video as premium user
2. Check database: video should have `should_expire: false`
3. View in dashboard: should show "Permanent"

- Notes: works

### Test Subscription Upgrade Effects

1. Process videos as free user (should_expire: true)
2. Upgrade to premium
3. Check database: ALL existing videos should now have `should_expire: false`
4. Process new videos: should have `should_expire: false`

- Notes: works

### Test Subscription Downgrade (Grace Period)

1. Process videos as premium user (should_expire: false)
2. Cancel subscription
3. Check database: existing videos should KEEP `should_expire: false` (grace period)
4. Process new videos: should have `should_expire: true`

- Note: works

## 3. Subscription Flow Testing

### Test Stripe Checkout

1. Go to `/dashboard/pricing`
2. Click "Upgrade to Premium"
3. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
4. Should redirect back to dashboard
5. Check subscription status updates

- Note: works

### Test Billing Portal

1. As premium user, go to settings
2. Click "Manage Billing"
3. Should open Stripe billing portal
4. Test cancellation and updates

- Notes: Cancelling and renewing workins on stripe billing portal. The canceled_at field in subscriptions is a bit wrong but I don't think that's an issue

## 4. Dashboard Display Testing

### Test Settings Page Video Stats

1. Go to `/dashboard/settings`
2. Check "Video Expiry Information" section
3. Should show:
    - Permanent Videos count
    - Expiring Videos count
    - Expiring Soon count
    - Next expiring video details

- Notes: I think all should work. Not sure about the expiring soon section

### Test Library Video Cards

1. Go to `/dashboard/library`
2. Free user videos should show:
    - "Expires in X days" (orange text)
    - "Expires today" (orange text)
    - "Expired" (red text)
3. Premium user videos should show:
    - "Permanent" (green text)

## 5. Extension Integration Testing

### Test Monthly Limit in Extension

1. Use extension to process 5 videos as free user
2. Try 6th video - should get limit error
3. Extension should display upgrade prompt

- Notes: works

### Test Video Processing

1. Process video through extension
2. Check educational classification works
3. Check questions generation works
4. Check video appears in dashboard library
   Notes: works

## 6. Database Testing

### Key Database Checks

```sql
-- Check user subscription status
SELECT id, email, is_subscribed FROM users WHERE email = 'test@example.com';

-- Check subscription details
SELECT * FROM subscriptions WHERE user_id = 'user-id';

-- Check video expiry settings
SELECT id, title, should_expire, expiry_date, created_at
FROM videos
WHERE user_id = 'user-id'
ORDER BY created_at DESC;

-- Check monthly video count
SELECT COUNT(*) FROM videos
WHERE user_id = 'user-id'
AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
```

## 7. Error Handling Testing

### Test Various Error Scenarios

1. Invalid stripe webhooks
2. Subscription failures
3. Database connection issues
4. Extension token expiry
5. Video processing failures

## 8. Performance Testing

### Test Heavy Usage

1. Process multiple videos quickly
   Notes: I tried processing 2 videos subsequently and I think it workedd
2. Check rate limiting works
3. Test with large video transcripts
4. Test concurrent user processing

## 9. Automated Testing Ideas

### Create Test Scripts

1. Script to create test users
2. Script to simulate video processing
3. Script to test subscription workflows
4. Script to verify database state

### Test Data Setup

1. Create test Stripe products/prices
2. Use Stripe test environment
3. Set up test YouTube videos
4. Create test user accounts

## 10. API Testing with Postman/curl

### Test Monthly Limits API

```powershell
# Test video processing (should fail on 6th video for free users)
curl -X POST "http://localhost:3000/api/v1/videos/process" `
  -H "Content-Type: application/json" `
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=test",
    "authToken": "your-extension-token"
  }'
```

### Test Subscription Status

```powershell
# Check user subscription
curl -X GET "http://localhost:3000/api/user/subscription" `
  -H "Authorization: Bearer your-auth-token"
```

## 11. Common Test Scenarios

### Test Question Count Bug Fix

1. Process a video
2. Check questions count in dashboard
3. Refresh page multiple times
4. Questions count should remain stable (not increase)

### Test Video Expiry Edge Cases

1. Process video at 11:59 PM (test date boundaries)
2. Test videos processed exactly 7 days ago
3. Test timezone handling for expiry dates

### Test Subscription Webhook Handling

1. Use Stripe CLI to send test webhooks:

```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

## 12. Performance Testing

### Test Video Processing Load

1. Process multiple videos simultaneously
2. Monitor database connections
3. Check for race conditions in question generation
4. Verify rate limiting works correctly
