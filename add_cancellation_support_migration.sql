-- Migration: Add cancel_at_period_end support
-- This enables proper handling of subscription cancellations that take effect at period end

-- Add cancel_at_period_end column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- Add canceled_at timestamp to track when cancellation was requested
ALTER TABLE public.subscriptions 
ADD COLUMN canceled_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'True if subscription is set to cancel at the end of current period';
COMMENT ON COLUMN public.subscriptions.canceled_at IS 'Timestamp when cancellation was requested (for cancel_at_period_end subscriptions)';
