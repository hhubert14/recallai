# Security Vulnerabilities - Authorization Issues

**Status:** 🔴 CRITICAL - Needs immediate attention before production deployment
**Date Identified:** 2025-01-27
**Context:** Discovered during Drizzle migration when removing RLS policies

---

## Executive Summary

Three critical authorization vulnerabilities were identified that could allow users to access or modify other users' data. These issues exist because Row Level Security (RLS) policies were removed during the Drizzle migration, and some routes/actions lack proper authorization checks.

---

## Critical Issues

### 1. 🔴 Server Actions - NO AUTHORIZATION CHECKS

**Files:**
- `web/src/app/dashboard/review/actions.ts`
- `web/src/app/dashboard/video/[id]/actions.ts`

**Issue:** Both server actions accept user IDs directly from the client without verifying the authenticated user matches.

**Vulnerable Code:**
```typescript
// dashboard/review/actions.ts
export async function processReviewAnswer(
    userAnswer: CreateUserAnswerDto  // Contains user_id from client
): Promise<boolean> {
    const progressUpdated = await processSpacedRepetitionAnswer(
        userAnswer.user_id,  // ❌ No check if this matches authenticated user
        userAnswer.question_id,
        userAnswer.is_correct
    );
    return progressUpdated;
}

// dashboard/video/[id]/actions.ts
export async function submitAnswer(
    userAnswer: CreateUserAnswerDto  // Contains user_id from client
): Promise<boolean> {
    return await createUserAnswer(userAnswer);  // ❌ No authorization check
}
```

**Attack Vector:** A malicious user could:
1. Intercept the request and change `user_id` to another user's ID
2. Submit answers on behalf of other users
3. Manipulate spaced repetition progress for other users

**Fix Required:**
```typescript
export async function processReviewAnswer(
    userAnswer: CreateUserAnswerDto
): Promise<boolean> {
    // Add authentication check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || user.id !== userAnswer.user_id) {
        throw new Error("Unauthorized");
    }

    // Continue with original logic
    const progressUpdated = await processSpacedRepetitionAnswer(
        userAnswer.user_id,
        userAnswer.question_id,
        userAnswer.is_correct
    );
    return progressUpdated;
}
```

**Impact:** HIGH - Allows arbitrary data manipulation across user accounts

---

### 2. 🔴 POST /api/v1/create-user-profile - NO AUTHENTICATION

**File:** `web/src/app/api/v1/create-user-profile/route.ts`

**Issue:** Anyone can create a user profile with any user ID and email without authentication.

**Vulnerable Code:**
```typescript
export async function POST(request: Request) {
    const { userId, email } = await request.json();
    // ❌ No authentication check - accepts any userId/email from client

    if (!userId || !email) {
        return NextResponse.json(
            { error: "User ID and email are required" },
            { status: 400 }
        );
    }

    await db.insert(users).values({
        id: userId,
        email,
        isSubscribed: false,
    })

    return NextResponse.json({ success: true });
}
```

**Attack Vectors:**
1. Create profiles with arbitrary user IDs
2. Potentially hijack/poison the users table
3. Create duplicate profiles or conflicting data

**Fix Options:**
1. **Option A:** Only call this endpoint internally after Supabase auth user creation
2. **Option B:** Require authentication and only allow creating profile for authenticated user
3. **Option C:** Move to a protected admin-only route

**Recommended Fix (Option B):**
```typescript
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { email } = await request.json();

    // Use authenticated user's ID, don't trust client input
    await db.insert(users).values({
        id: user.id,
        email: user.email || email,
        isSubscribed: false,
    })

    return NextResponse.json({ success: true });
}
```

**Impact:** HIGH - Allows unauthorized user profile creation

---

### 3. ⚠️ GET /api/v1/auth/check-email-exists - Account Enumeration

**File:** `web/src/app/api/v1/auth/check-email-exists/route.ts`

**Issue:** Public endpoint that reveals if an email exists in the system.

**Vulnerable Code:**
```typescript
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    // ❌ No authentication required

    const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    const exists = !!data;
    return NextResponse.json({ exists });  // ❌ Leaks user existence
}
```

**Risk:** Account enumeration - attackers can determine which emails are registered users.

**Recommended Mitigations:**
- Add rate limiting
- Consider if this endpoint needs to be public (likely used for signup/login UX)
- Return generic error messages instead of specific "exists" boolean
- Add CAPTCHA for repeated requests

**Impact:** MEDIUM - Enables reconnaissance for targeted attacks

---

### 4. ⚠️ GET /api/v1/validate-email - Email Enumeration

**File:** `web/src/app/api/v1/validate-email/route.ts`

**Issue:** Publicly accessible endpoint that could be used to validate if emails are in the system.

**Risk:** Could be used for reconnaissance or spam targeting.

**Impact:** MEDIUM - Information disclosure

---

## Attack Scenarios

### Scenario 1: Manipulating Another User's Quiz Progress
```javascript
// Attacker intercepts submitAnswer() call in browser DevTools
await submitAnswer({
    user_id: "victim-user-id",  // Changed from their own ID
    question_id: 123,
    selected_option_id: 456,
    is_correct: true,
    video_id: 789
});
// ❌ This would succeed and modify victim's data
```

### Scenario 2: Creating Fake User Profiles
```javascript
// Anyone can call this without authentication
await fetch('https://www.recallai.io/api/v1/create-user-profile', {
    method: 'POST',
    body: JSON.stringify({
        userId: 'any-uuid-here',
        email: 'fake@example.com'
    })
});
// ❌ This would create a profile without authentication
```

---

## Properly Secured Routes (For Reference)

These routes demonstrate the correct pattern to follow:

### ✅ DELETE /api/v1/user/data
```typescript
export async function DELETE() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Uses authenticated user.id - never trusts client input
    await softDeleteAllUserVideos(user.id);
}
```

### ✅ Extension Video Routes Pattern
```typescript
const tokenData = await authenticateRequest(authToken);
if (tokenData.error) {
    return NextResponse.json(tokenData, { status: tokenData.status });
}

const authenticatedUserId = tokenData.userId;
// All operations use authenticatedUserId from token, not client input
```

---

## Recommendations

### Immediate Actions (Before Production):

1. **Fix Server Actions** (Highest Priority)
   - Add authentication to `processReviewAnswer()` and `submitAnswer()`
   - Verify authenticated user matches the user_id in the request
   - Never trust user_id from client input

2. **Secure /api/v1/create-user-profile**
   - Add authentication or make it internal-only
   - Validate the caller has permission to create the profile

3. **Add Rate Limiting**
   - Implement rate limiting on email enumeration endpoints
   - Consider using a service like Upstash Rate Limit or Vercel Edge Config

### Best Practices for Future Development:

1. **Always authenticate server actions** - They're callable directly from the client
2. **Never trust user IDs from client input** - Always use the authenticated user's ID
3. **Follow the established pattern** - Use the extension routes' authentication as a model
4. **Add authorization checks at the route level** - Don't rely solely on data access layer
5. **Consider re-enabling RLS** - As a defense-in-depth layer

### Long-term Considerations:

1. **Re-enable Row Level Security (RLS)**
   - While security checks in code are necessary, RLS provides defense-in-depth
   - Protects against authorization bugs at the database level
   - Consider implementing RLS policies even with Drizzle

2. **Implement Security Testing**
   - Add integration tests that verify authorization
   - Test that users cannot access other users' data
   - Add tests for common attack vectors

3. **Security Audit**
   - Regular security audits of new features
   - Code review checklist that includes authorization checks
   - Consider using automated security scanning tools

---

## Why RLS Matters

**What is Row Level Security (RLS)?**
RLS policies control what data users can see/modify at the database level, even when using service role keys.

**Why was it removed?**
During the Drizzle migration, RLS policies were removed because:
1. Drizzle uses service role key (bypasses RLS by default)
2. RLS policies were causing compatibility issues
3. Plan was to implement authorization in application code

**The risk:**
Without RLS, a single missed authorization check in application code can expose all user data. RLS acts as a safety net.

**Current situation:**
- ✅ Extension video routes: Properly authorized in code
- ❌ Server actions: Missing authorization checks
- ❌ create-user-profile: Missing authentication

**Recommendation:**
Even with proper authorization in code, consider re-enabling RLS as a defense-in-depth measure once all authorization issues are fixed.

---

## Testing Checklist

Before marking these issues as resolved, verify:

- [ ] Server actions authenticate the user before any database operations
- [ ] Server actions verify authenticated user matches the data being modified
- [ ] create-user-profile endpoint requires authentication
- [ ] create-user-profile only allows creating profile for authenticated user
- [ ] Rate limiting is implemented on email enumeration endpoints
- [ ] Integration tests cover authorization scenarios
- [ ] Manual testing of attack scenarios returns 401/403 errors

---

## References

- [OWASP Top 10: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Next.js Server Actions Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#security)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
