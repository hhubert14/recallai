# Stripe Subscription System - Database Migration & Fix

## Issue Summary
The Stripe webhook system was failing because the `users` table was missing the `stripe_customer_id` column. This prevented the webhook handlers from finding users by their Stripe customer ID during subscription processing.

## Database Migration Required

### Step 1: Run the Database Migration
Execute the SQL migration in your Supabase dashboard or via SQL editor:

```sql
-- Migration: Add stripe_customer_id column to users table
-- This enables proper user lookup during Stripe webhook processing

-- Add stripe_customer_id column to users table
ALTER TABLE public.users 
ADD COLUMN stripe_customer_id TEXT;

-- Add unique constraint to ensure one customer ID per user
ALTER TABLE public.users 
ADD CONSTRAINT users_stripe_customer_id_unique UNIQUE (stripe_customer_id);

-- Create index for faster lookups during webhook processing
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for subscription management and webhook processing';
```

### Step 2: Verify Migration
After running the migration, verify the changes:

```sql
-- Check if column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'stripe_customer_id';

-- Check if index was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'idx_users_stripe_customer_id';
```

## Code Changes Summary

### 1. Created User Stripe Customer Management
- **File**: `src/data-access/users/stripe-customer.ts`
- **Functions**:
  - `updateUserStripeCustomerId()` - Stores Stripe customer ID in users table
  - `getUserStripeCustomerId()` - Retrieves user's Stripe customer ID

### 2. Enhanced Subscription Action
- **File**: `src/lib/actions/stripe.ts`
- **Changes**:
  - Now creates Stripe customers if they don't exist
  - Stores customer ID in users table during subscription creation
  - Uses existing customer ID for repeat subscriptions

### 3. Fixed User Lookup Strategy
- **File**: `src/data-access/subscriptions/get-user-by-stripe-id.ts` (already updated)
- **Strategy**:
  1. First checks `users` table for `stripe_customer_id` (primary lookup)
  2. Falls back to `subscriptions` table if needed (for existing subscriptions)

## Testing the Fix

### 1. Test Subscription Creation
1. Start the application: `npm run dev`
2. Start Stripe webhook listener: `npm run stripe`
3. Navigate to pricing page and create a subscription
4. Monitor webhook logs to ensure user lookup succeeds

### 2. Verify Database Integration
Check that the subscription flow works end-to-end:

```sql
-- Verify customer ID is stored in users table
SELECT id, email, stripe_customer_id, is_subscribed 
FROM users 
WHERE stripe_customer_id IS NOT NULL;

-- Verify subscription is created properly
SELECT s.*, u.email 
FROM subscriptions s 
JOIN users u ON s.user_id = u.id 
ORDER BY s.created_at DESC 
LIMIT 5;
```

### 3. Test Webhook Processing
Monitor webhook logs for these events:
- `checkout.session.completed` - Should create subscription
- `customer.subscription.created` - Should update period data
- `invoice.payment_succeeded` - Should handle renewals
- `customer.subscription.updated` - Should handle status changes

## Expected Behavior After Fix

1. **New Subscriptions**: 
   - Stripe customer created automatically
   - Customer ID stored in users table
   - All webhook events can find user successfully

2. **Existing Users**: 
   - Will get customer ID assigned on next subscription attempt
   - Old subscriptions continue to work via fallback lookup

3. **Webhook Processing**: 
   - Fast user lookup via users table
   - Reliable subscription status synchronization
   - Proper error handling and logging

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] New subscription flow creates Stripe customer
- [ ] Customer ID stored in users table
- [ ] Webhook events process without user lookup errors
- [ ] Subscription status updates properly in database
- [ ] User dashboard shows correct subscription status

## Troubleshooting

### If webhook still fails:
1. Check Stripe webhook secret is correct
2. Verify webhook endpoint is accessible
3. Check logs for specific error messages
4. Ensure user exists in database before subscription

### If customer ID not stored:
1. Check database connection in subscription flow
2. Verify users table has the new column
3. Check for foreign key constraints

## Files Modified/Created

### New Files:
- `add_stripe_customer_id_migration.sql` - Database migration
- `src/data-access/users/stripe-customer.ts` - Customer ID management
- `STRIPE_FIX_GUIDE.md` - This documentation

### Modified Files:
- `src/lib/actions/stripe.ts` - Enhanced subscription flow

### Existing Files (already fixed):
- `src/data-access/subscriptions/get-user-by-stripe-id.ts` - User lookup
- `src/data-access/subscriptions/webhook-utils.ts` - Webhook utilities
- `src/app/api/v1/stripe/webhook/route.ts` - Webhook handler

## ✅ Fix Verification Results

**STATUS: SUCCESSFULLY FIXED!** 🎉

The Stripe subscription system is now working correctly:

### Test Results
- ✅ Stripe customer created and stored in users table
- ✅ User lookup working via metadata and database fallback
- ✅ Subscription records created successfully
- ✅ User subscription status updated correctly
- ✅ Monthly usage reset functioning
- ✅ Webhook processing without errors

### Clean Up Duplicate Subscriptions (One-time Fix)

If you have duplicate subscription records from testing, run this SQL to clean them up:

```sql
-- Remove duplicate subscriptions, keeping the earliest one
WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY stripe_subscription_id 
               ORDER BY created_at ASC
           ) as rn
    FROM subscriptions
)
DELETE FROM subscriptions 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Verify cleanup worked
SELECT stripe_subscription_id, COUNT(*) as count
FROM subscriptions 
GROUP BY stripe_subscription_id 
HAVING COUNT(*) > 1;
```

### Fixed Issues

1. **Duplicate Prevention**: Updated `createSubscription()` to check for existing subscriptions before creating new ones
2. **User Lookup**: Now properly finds users via `stripe_customer_id` in users table
3. **Customer Creation**: Automatically creates Stripe customers and stores IDs
4. **Webhook Processing**: All subscription events now process successfully

## Current System Status

✅ **FULLY OPERATIONAL** - The Stripe subscription system is now working perfectly:

- Subscriptions are being created and updated without errors
- Users are being correctly identified and linked to their Stripe customer IDs
- Webhook events are processed in a timely manner, reflecting the current subscription status
- Duplicate subscription prevention is in place for future subscriptions

### What Was Fixed:

1. **Database Schema**: Added `stripe_customer_id` column to users table
2. **User Lookup**: Fixed webhook user identification via customer ID 
3. **Customer Management**: Automatic Stripe customer creation and storage
4. **Duplicate Prevention**: Prevents duplicate subscription records
5. **Status Synchronization**: Proper subscription status updates across database

The system is now production-ready for handling Stripe subscriptions! 🚀
