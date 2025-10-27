# Business Rules

This document defines the core business logic and rules for RecallAI.

## Table of Contents
1. [Subscription Model](#subscription-model)
2. [Video Processing & Limits](#video-processing--limits)
3. [Video Expiry Rules](#video-expiry-rules)
4. [Spaced Repetition System](#spaced-repetition-system)
5. [Payment & Billing](#payment--billing)

---

## Subscription Model

### Subscription Tiers

**Free Tier:**
- **Monthly Video Limit:** 5 videos per month
- **Video Expiry:** Videos expire after 7 days
- **Cost:** Free
- **Reset:** Video count resets on the 1st of each month

**Premium Tier (via Stripe):**
- **Monthly Video Limit:** Unlimited
- **Video Expiry:** Videos never expire
- **Cost:** Paid subscription via Stripe
- **Plans:** Premium, Student (future: additional tiers possible)

### Subscription Statuses

Only the following statuses grant **premium access**:
- `active` - Active subscription
- `trialing` - Free trial period

**Non-premium statuses:**
- `past_due` - Payment failed, treated as free tier
- `canceled` - Subscription canceled, treated as free tier
- `incomplete` - Subscription setup incomplete, treated as free tier

**Important:** Users with `past_due`, `canceled`, or `incomplete` subscriptions are **downgraded to free tier** limits immediately.

### Subscription Changes

**On Upgrade (Free ’ Premium):**
- All existing videos have `should_expire` set to `false`
- Videos no longer expire
- Video count limit removed

**On Downgrade (Premium ’ Free):**
- All existing videos retain their current state (grace period)
- New videos created after downgrade will expire in 7 days
- Monthly limit of 5 videos enforced going forward
- **Note:** Existing premium videos are NOT immediately deleted or set to expire

**On Payment Failure:**
- Subscription status changes to `past_due`
- User is immediately downgraded to free tier limits
- New videos will expire in 7 days
- Limited to 5 videos per month

---

## Video Processing & Limits

### Video Creation Limits

**Free Users:**
- Maximum 5 videos per calendar month
- Counter resets automatically on the 1st of each month (based on `last_reset_date`)
- Attempting to create 6th video results in rejection

**Premium Users:**
- No video limit
- Can create unlimited videos

### Video Processing Pipeline

When a user submits a YouTube video URL (via Chrome extension):

1. **Authentication Validation**
   - Extension token must be valid
   - Token must not be expired
   - User session must match token user

2. **Duplicate Detection**
   - Check if video URL already exists for this user
   - If exists, return existing video (don't process again)

3. **Subscription Limit Check**
   - Check user's subscription status
   - Verify they haven't exceeded monthly limit (if free tier)
   - Reject if limit exceeded

4. **Educational Content Check**
   - AI determines if video is educational
   - Non-educational videos are rejected
   - Only educational content proceeds to processing

5. **Video Creation**
   - Create video record in database
   - Set `should_expire` based on subscription status
   - Set `expiry_date` to 7 days from now (if should_expire = true)
   - Increment user's monthly video count

6. **Summary Generation**
   - Extract YouTube transcript
   - Use OpenAI + LangChain to generate summary
   - Store summary in database

7. **Question Generation**
   - Use AI to generate quiz questions from video content
   - Create 4 multiple-choice options per question
   - Store questions and options in database

---

## Video Expiry Rules

### When Videos Expire

**Free Tier Videos:**
- `should_expire` = `true`
- `expiry_date` = created_at + 7 days
- After expiry date, video is soft-deleted (`deleted_at` timestamp set)

**Premium Tier Videos:**
- `should_expire` = `false`
- `expiry_date` = `null`
- Videos never expire, even if user later downgrades

### Expiry Date Calculation

```
expiry_date = created_at + 7 days
```

Example:
- Video created: January 1, 2025 at 10:00 AM
- Expiry date: January 8, 2025 at 10:00 AM

### Soft Delete Behavior

When a video expires:
- `deleted_at` timestamp is set to current time
- Video is NOT physically deleted from database
- Video no longer appears in user's library
- Related data (summaries, questions, progress) remains in database but is inaccessible

**Rationale:** Soft delete allows:
- Data recovery if needed
- Analytics on expired content
- Potential "restore video" feature in future

---

## Spaced Repetition System

RecallAI uses the **Leitner Box System** for optimal knowledge retention.

### The 5-Box System

| Box Level | Review Interval | Meaning |
|-----------|----------------|---------|
| Box 1 | 1 day | Struggling - needs frequent review |
| Box 2 | 3 days | Learning - moderate confidence |
| Box 3 | 7 days | Familiar - one week interval |
| Box 4 | 14 days | Strong - two week interval |
| Box 5 | 30 days | Mastered - monthly review |

### Progression Rules

**On Correct Answer:**
- Move up one box level (e.g., Box 2 ’ Box 3)
- Maximum box level is 5 (stays at 5 if already there)
- `times_correct` counter increments
- `next_review_date` = today + box interval
- `last_reviewed_at` = current timestamp

**On Incorrect Answer:**
- Reset to Box 1 (regardless of current box)
- `times_incorrect` counter increments
- `next_review_date` = today + 1 day
- `last_reviewed_at` = current timestamp

### Initial State

When a user first encounters a question:
- `box_level` = 1
- `next_review_date` = today + 1 day
- `times_correct` = 0
- `times_incorrect` = 0
- `last_reviewed_at` = current timestamp

### Review Queue

Questions appear in the review queue when:
- `next_review_date` d current date
- Video is NOT expired/deleted
- Questions are ordered by:
  1. Box level (ascending) - struggling questions first
  2. Next review date (ascending) - overdue questions first

### Progress Tracking

Each user-question pair tracks:
- **Box Level** - Current mastery level (1-5)
- **Next Review Date** - When to show this question again
- **Times Correct** - Total correct answers
- **Times Incorrect** - Total incorrect answers
- **Last Reviewed At** - Most recent review timestamp

**Use Cases:**
- Identify struggling topics (many Box 1 questions)
- Track learning progress (Box 5 questions are mastered)
- Calculate accuracy percentage
- Generate learning analytics

---

## Payment & Billing

### Stripe Integration

**Checkout Flow:**
1. User clicks "Upgrade to Premium" on dashboard
2. Backend creates Stripe checkout session
3. User redirects to Stripe hosted checkout page
4. On successful payment, Stripe sends webhook
5. Webhook creates/updates subscription in database
6. User is redirected back to dashboard with premium access

**Billing Portal:**
- Users can manage subscription via Stripe billing portal
- Actions: Update payment method, cancel subscription, view invoices
- Accessed via "Manage Billing" button on dashboard

### Webhook Events Handled

The system handles 7 Stripe webhook events:

1. **`checkout.session.completed`**
   - Initial subscription purchase
   - Creates subscription record in database
   - Sets user `is_subscribed` = true
   - Updates all user videos: `should_expire` = false

2. **`customer.subscription.created`**
   - Subscription officially created
   - Stores subscription details (plan, period dates)

3. **`customer.subscription.updated`**
   - Plan change (upgrade/downgrade)
   - Billing cycle change
   - Status change (active ’ past_due)
   - Updates subscription record

4. **`customer.subscription.deleted`**
   - Subscription canceled
   - Sets user `is_subscribed` = false
   - Sets `canceled_at` timestamp
   - **Note:** Existing videos NOT immediately expired (grace period)

5. **`invoice.payment_succeeded`**
   - Successful recurring payment
   - Updates subscription period dates
   - Ensures subscription status is active

6. **`invoice.payment_failed`**
   - Payment failed (expired card, insufficient funds)
   - **Immediate downgrade:** User treated as free tier
   - Subscription status ’ `past_due`
   - New videos will expire in 7 days

7. **`billing_portal.session.created`**
   - User accessed billing portal
   - Logged for analytics

### User ID Extraction (4-Step Fallback)

Webhooks must identify which user the event belongs to. The system uses a **4-step fallback strategy**:

1. **Checkout Session Metadata** - `client_reference_id`
2. **Subscription Metadata** - `metadata.user_id`
3. **Customer Metadata** - `metadata.user_id`
4. **Database Lookup** - Query by `stripe_customer_id`

This ensures user identification even if metadata is missing.

### Event Deduplication

Stripe may send duplicate webhook events. The system prevents duplicate processing:

- **In-memory cache** - Stores processed event IDs
- **5-minute window** - Events expire from cache after 5 minutes
- **Duplicate detection** - If event ID already processed, skip it

**Rationale:** Prevents double-charging, duplicate subscriptions, race conditions.

### Payment Failure Grace Period

**Current Behavior:**
- Payment fails ’ immediate downgrade to free tier
- Existing premium videos keep `should_expire` = false (not changed)
- New videos after failure will have `should_expire` = true

**Rationale:**
- Don't immediately delete user's content
- Give user time to update payment method
- Gentle degradation of service

---

## Edge Cases & Special Behaviors

### Monthly Video Counter Reset

**Logic:**
```
if (current_date >= last_reset_date + 1 month) {
  monthly_video_count = 0
  last_reset_date = current_date
}
```

**Scenarios:**
- User creates 5 videos on January 15
- Counter resets automatically on February 1
- User can create 5 more videos in February

### Subscription Status Checks

**"Is Premium" Check:**
```typescript
isPremium = (status === 'active' OR status === 'trialing')
```

**"Should Expire" Calculation:**
```typescript
should_expire = !isPremium
```

### Extension Token Expiry

**Token Lifespan:**
- Tokens expire after a set period (configured in backend)
- Expired tokens are rejected on video processing
- User must regenerate token from dashboard

**Security:**
- One token per user
- Regenerating token invalidates previous token
- Tokens stored as hashed values (TODO: verify this)

---

## Future Considerations

**Potential Changes:**
1. **Remove video expiry entirely** - All videos permanent regardless of tier
2. **Add team/organization tiers** - Multiple users, shared content
3. **Graduated video limits** - Different limits at different price points
4. **Content sharing** - Allow users to share summaries/questions
5. **Video categorization** - Tag videos by topic/course

---

## Questions & Decisions Needed

1. **Video Expiry:** Should we keep the 7-day expiry for free users, or make all videos permanent?
2. **Downgrade Behavior:** Should downgrading expire existing premium videos immediately?
3. **Payment Failure:** Should we give a grace period before downgrade (e.g., 3 days)?
4. **Monthly Reset:** Should it be calendar month (1st of month) or 30 days from signup?

---

**Last Updated:** 2025-10-22
**Maintained By:** Project Team
