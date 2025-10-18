# Testing Priorities for Clean Architecture Refactor

This document outlines the critical areas of the RecallAI codebase that should have test coverage **before** starting the clean architecture refactor.

## Overview

- **Current Test Coverage**: 1 test (UserButton component only)
- **Project Type**: Next.js 15 with TypeScript, Supabase, Stripe, OpenAI
- **Testing Stack**: Vitest + React Testing Library
- **Estimated Testing Effort**: 31-40 hours (1-2 weeks)

---

## Priority 1: CRITICAL (Must Test Before Refactoring)

### 1. Stripe Webhook Handler ⚠️ HIGHEST PRIORITY

**File**: `src/app/api/v1/stripe/webhook/route.ts` (625 lines)

**Why Critical**:
- Handles real money and subscription state
- Complex logic with 7 different event types
- 4-step fallback strategy for user ID extraction
- Controls video expiry based on subscription changes
- Duplicate event handling with in-memory deduplication

**Business Rules**:
- Only "active" and "trialing" users have premium access
- Payment failure = immediate downgrade
- Downgrade = existing videos get grace period (not immediate deletion)
- Free users = 5 videos/month max
- Premium users = unlimited videos

**Test Cases Needed**:
- [ ] Event duplication detection (5-minute window)
- [ ] User ID extraction (all 4 fallback strategies)
- [ ] Subscription status mapping (active, trialing, past_due, canceled, incomplete)
- [ ] Video expiry updates on upgrade/downgrade
- [ ] Payment failure immediate downgrade
- [ ] Period data date conversion
- [ ] Invalid/missing data handling
- [ ] All 7 webhook event types:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `billing_portal.session.created`

**Recommended Test Type**: Integration tests with mocked Stripe events

**Estimated Time**: 8-10 hours

---

### 2. Spaced Repetition Engine 🧠

**Files**:
- `src/data-access/user-question-progress/process-spaced-repetition-answer.ts`
- `src/data-access/user-question-progress/utils.ts`

**Why Critical**:
- Core learning mechanism
- Implements Leitner box system (5 boxes)
- Controls when users review questions
- Incorrect implementation breaks the entire learning experience

**Leitner Box Schedule**:
```
Box 1: 1 day (struggling)
Box 2: 3 days
Box 3: 7 days (one week)
Box 4: 14 days (two weeks)
Box 5: 30 days (one month - mastered)
```

**Algorithm**:
- Correct answer → Move up one box (max box 5)
- Incorrect answer → Reset to box 1
- Track: `times_correct`, `times_incorrect`, `box_level`, `next_review_date`

**Test Cases Needed**:
- [ ] New progress creation (first answer - correct)
- [ ] New progress creation (first answer - incorrect)
- [ ] Box level progression (1→2→3→4→5)
- [ ] Box level stays at 5 when already at max
- [ ] Box level regression (any→1 on incorrect)
- [ ] Next review date calculation for each box
- [ ] Correct/incorrect counters increment properly
- [ ] Database state consistency after answer
- [ ] Edge case: answering same question multiple times

**Recommended Test Type**: Unit tests for utils, integration tests for database updates

**Estimated Time**: 4-6 hours

---

### 3. Subscription Validation 💳

**File**: `src/use-cases/extension/validate-subscription.ts`

**Why Critical**:
- Enforces business model (free vs premium)
- Prevents abuse of free tier
- Controls access to premium features
- Multi-condition logic with monthly resets

**Business Rules**:
- Free users: 5 videos per month
- Premium users (active/trialing): unlimited videos
- Monthly video count resets automatically
- Non-subscribed users default to free tier

**Test Cases Needed**:
- [ ] Free user at limit (5 videos) - should reject
- [ ] Free user under limit (0-4 videos) - should allow
- [ ] Premium user (active status) - always allow
- [ ] Premium user (trialing status) - always allow
- [ ] Premium user (past_due status) - treat as free
- [ ] Premium user (canceled status) - treat as free
- [ ] Monthly video count reset logic
- [ ] User with no subscription record
- [ ] Database query error handling

**Recommended Test Type**: Unit tests with mocked database calls

**Estimated Time**: 3-4 hours

---

### 4. Video Processing Pipeline 🎥

**File**: `src/use-cases/extension/process-video.ts`

**Why Critical**:
- Main user-facing feature
- 4-step orchestration with multiple external API calls
- Multiple failure points
- Controls video creation, summarization, and question generation

**Processing Steps**:
1. Educational content check (is it worth processing?)
2. Create video record in database
3. Generate AI summary (OpenAI + LangChain)
4. Generate quiz questions (OpenAI structured output)

**Validation Steps (Before Processing)**:
1. Authentication validation
2. Duplicate video check
3. Subscription limit enforcement

**Test Cases Needed**:
- [ ] Authentication validation (valid token)
- [ ] Authentication validation (expired token)
- [ ] Authentication validation (invalid token)
- [ ] Duplicate video detection (existing URL)
- [ ] Subscription limit enforcement (free user at limit)
- [ ] Subscription limit enforcement (premium user)
- [ ] Non-educational video rejection
- [ ] Educational video acceptance
- [ ] All 4 processing steps complete successfully
- [ ] Error handling at educational check step
- [ ] Error handling at video creation step
- [ ] Error handling at summary generation step
- [ ] Error handling at question generation step
- [ ] Response structure validation
- [ ] Missing required parameters (URL, user session)

**Recommended Test Type**: Integration tests with mocked external APIs

**Estimated Time**: 6-8 hours

---

## Priority 2: HIGH (Important but Lower Risk)

### 5. Video Creation with Expiry Logic

**File**: `src/data-access/videos/create-video.ts`

**Why Important**:
- Controls video lifecycle based on subscription
- Sets `should_expire` flag based on user subscription status

**Test Cases**:
- [ ] Free user video creation (should_expire = true)
- [ ] Premium user video creation (should_expire = false)
- [ ] Video creation with all required fields
- [ ] Error handling for database failures

**Estimated Time**: 2-3 hours

---

### 6. Authentication & Token Validation

**File**: `src/use-cases/extension/authenticate-request.ts`

**Why Important**:
- Security boundary for Chrome extension
- Validates extension tokens and session consistency

**Test Cases**:
- [ ] Valid token authentication
- [ ] Expired token rejection
- [ ] Invalid token rejection
- [ ] Session/token user ID mismatch detection
- [ ] Missing token handling
- [ ] User ID extraction from valid token

**Estimated Time**: 2-3 hours

---

### 7. Email Validation & Uniqueness

**File**: `src/app/api/v1/auth/check-email-exists/route.ts`

**Why Important**:
- Prevents duplicate user accounts
- Part of sign-up flow validation

**Test Cases**:
- [ ] Email exists check returns true
- [ ] Email doesn't exist check returns false
- [ ] Invalid email format handling
- [ ] Missing email parameter handling
- [ ] Database query error handling

**Estimated Time**: 1-2 hours

---

### 8. User Stats Aggregation

**File**: `src/data-access/user-stats/get-user-stats-by-user-id.ts`

**Why Important**:
- Dashboard accuracy
- User engagement metrics

**Test Cases**:
- [ ] Total videos count calculation
- [ ] Total questions answered calculation
- [ ] Quiz accuracy percentage calculation
- [ ] Weekly activity tracking
- [ ] Error handling and fallback values
- [ ] Empty stats for new users

**Estimated Time**: 2-3 hours

---

## Priority 3: MEDIUM (Nice to Have)

### 9. Sign-up Form Component

**File**: `src/app/auth/sign-up/SignUpForm.tsx`

**Test Cases**:
- [ ] Email validation (format)
- [ ] Password validation (8-64 characters)
- [ ] Terms of service checkbox required
- [ ] Form submission with valid data
- [ ] Error message display
- [ ] API call on submit

**Estimated Time**: 2-3 hours

---

## Test Folder Structure Recommendations

### Option 1: Co-located Tests (Recommended for this project)

Place test files next to the files they test:

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── stripe/
│               └── webhook/
│                   ├── route.ts
│                   └── route.test.ts
├── data-access/
│   ├── user-question-progress/
│   │   ├── process-spaced-repetition-answer.ts
│   │   ├── process-spaced-repetition-answer.test.ts
│   │   ├── utils.ts
│   │   └── utils.test.ts
│   └── videos/
│       ├── create-video.ts
│       └── create-video.test.ts
└── use-cases/
    └── extension/
        ├── validate-subscription.ts
        ├── validate-subscription.test.ts
        ├── process-video.ts
        └── process-video.test.ts
```

**Pros**:
- Easy to find tests (right next to source)
- Clear 1:1 mapping
- Easy to maintain when refactoring
- Follows clean architecture boundaries

**Cons**:
- Tests mixed with source code

---

### Option 2: Mirror Structure in __tests__ Folder

Create a `__tests__` folder that mirrors your src structure:

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── stripe/
│               └── webhook/
│                   └── route.ts
└── __tests__/
    ├── app/
    │   └── api/
    │       └── v1/
    │           └── stripe/
    │               └── webhook/
    │                   └── route.test.ts
    ├── data-access/
    │   └── user-question-progress/
    │       ├── process-spaced-repetition-answer.test.ts
    │       └── utils.test.ts
    └── use-cases/
        └── extension/
            ├── validate-subscription.test.ts
            └── process-video.test.ts
```

**Pros**:
- Clean separation of tests from source
- Easier to exclude from builds
- Can see all tests in one place

**Cons**:
- Harder to maintain (need to update two locations)
- Path imports can be confusing

---

### Option 3: Separate tests/ Directory (Not Recommended for Clean Architecture)

```
src/
tests/
├── unit/
├── integration/
└── e2e/
```

**Pros**:
- Clear test categorization
- Traditional approach

**Cons**:
- Loses clean architecture layer boundaries
- Harder to find tests for specific files
- Harder to refactor

---

## Recommended Approach for Your Project

**Use Option 1 (Co-located Tests)** because:

1. Your project already has clean architecture layers (`domain/`, `data-access/`, `use-cases/`)
2. Co-location makes it easy to see what's tested when refactoring
3. Follows the pattern you already started with `user-button.test.tsx`
4. Easy to maintain layer boundaries during refactor

**File Naming Convention**:
- Source file: `validate-subscription.ts`
- Test file: `validate-subscription.test.ts`

**Example Structure After Testing**:
```
src/
├── use-cases/
│   └── extension/
│       ├── validate-subscription.ts
│       ├── validate-subscription.test.ts        ✅ Unit tests
│       ├── process-video.ts
│       └── process-video.test.ts                ✅ Integration tests
├── data-access/
│   ├── user-question-progress/
│   │   ├── process-spaced-repetition-answer.ts
│   │   ├── process-spaced-repetition-answer.test.ts  ✅ Integration tests
│   │   ├── utils.ts
│   │   └── utils.test.ts                        ✅ Unit tests
│   └── videos/
│       ├── create-video.ts
│       └── create-video.test.ts                 ✅ Unit tests
└── app/
    └── api/
        └── v1/
            └── stripe/
                └── webhook/
                    ├── route.ts
                    └── route.test.ts            ✅ Integration tests
```

---

## Testing Strategy Summary

### Phase 1 - Critical Business Logic (Week 1)
1. Stripe webhook utilities (unit tests)
2. Spaced repetition utilities (unit tests)
3. Subscription validation (unit tests)

### Phase 2 - Integration Tests (Week 2)
1. Stripe webhook end-to-end flow
2. Video processing pipeline
3. Spaced repetition database updates

### Phase 3 - Additional Coverage (Week 3)
1. Authentication flows
2. Video creation
3. User stats
4. Email validation

### Phase 4 - Component Tests (Ongoing)
1. Sign-up form
2. Review interface
3. Dashboard components

---

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (recommended during refactoring)
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- validate-subscription.test.ts

# Run tests matching pattern
npm run test -- spaced-repetition
```

---

## Test Coverage Goals

**Before Starting Refactor**:
- Critical files (Priority 1): **90%+ coverage**
- Important files (Priority 2): **70%+ coverage**
- Overall project: **60%+ coverage**

**Minimum Acceptable**:
- Critical files: **80%+ coverage**
- Overall project: **50%+ coverage**

---

## Next Steps

1. **Start with Stripe webhook tests** - highest risk, most complex
2. **Add spaced repetition tests** - core learning mechanism
3. **Test subscription validation** - business model enforcement
4. **Test video processing** - main user feature
5. **Add remaining tests** as time permits
6. **Run tests in watch mode** during refactoring
7. **Maintain test coverage** as you refactor

---

## Key Files Reference

**Absolute Must-Test Before Refactoring**:
```
src/app/api/v1/stripe/webhook/route.ts
src/data-access/user-question-progress/process-spaced-repetition-answer.ts
src/data-access/user-question-progress/utils.ts
src/use-cases/extension/validate-subscription.ts
src/use-cases/extension/process-video.ts
src/data-access/videos/create-video.ts
src/data-access/subscriptions/webhook-utils.ts
src/use-cases/extension/authenticate-request.ts
```

These 8 files contain the most critical business logic and are most likely to have hidden dependencies or edge cases revealed during refactoring.
