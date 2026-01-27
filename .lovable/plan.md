
# Fix Wrong Login URL in Invitation Emails

## Problem Summary

When new accounts are created or invitations are resent, the "Login Now" button in emails points to the wrong URL (`ldgrcodffsalkevafbkb.supabase.co` or a SendGrid tracking URL) instead of `https://appinterio.app/auth`.

## Root Cause

Two edge functions have incorrect fallback URLs and are missing the `/auth` path:

| Function | Current Fallback | Should Be |
|----------|------------------|-----------|
| `create-admin-account` | `https://ldgrcodffsalkevafbkb.supabase.co` | `https://appinterio.app` |
| `resend-account-invitation` | `https://ldgrcodffsalkevafbkb.supabase.co` | `https://appinterio.app` |

Additionally, when SendGrid is used, click tracking rewrites URLs to go through tracking domains (like `url3728.interioapp.com`), which can cause 404s if DNS/redirects are misconfigured.

## Solution

### Fix 1: Update `create-admin-account/index.ts`

**Line 420:** Change fallback URL and add `/auth` path to the login button

```typescript
// BEFORE (line 420)
const siteUrl = Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co';

// AFTER
const siteUrl = Deno.env.get('SITE_URL') || 'https://appinterio.app';
```

**Line 467:** Add `/auth` to the login link

```typescript
// BEFORE (line 467)
<a href="${siteUrl}" style="...">Login Now</a>

// AFTER
<a href="${siteUrl}/auth" style="...">Login Now</a>
```

**Line 498-517:** Add SendGrid click tracking disable (like `send-invitation` does)

```typescript
// Add to SendGrid payload (after line 516):
tracking_settings: {
  click_tracking: {
    enable: false,
    enable_text: false
  }
}
```

### Fix 2: Update `resend-account-invitation/index.ts`

**Line 111:** Change fallback URL

```typescript
// BEFORE (line 111)
const siteUrl = Deno.env.get('SITE_URL') || 'https://ldgrcodffsalkevafbkb.supabase.co';

// AFTER
const siteUrl = Deno.env.get('SITE_URL') || 'https://appinterio.app';
```

**Line 140:** Add `/auth` to the login link

```typescript
// BEFORE (line 140)
<a href="${siteUrl}" style="...">Login Now</a>

// AFTER
<a href="${siteUrl}/auth" style="...">Login Now</a>
```

### Fix 3: Verify SITE_URL Secret

Ensure the `SITE_URL` secret in Supabase is set to: `https://appinterio.app`

(Currently there IS a `SITE_URL` secret configured, but it may have the wrong value)

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/create-admin-account/index.ts` | Update fallback URL, add `/auth` to button link, add SendGrid click tracking disable |
| `supabase/functions/resend-account-invitation/index.ts` | Update fallback URL, add `/auth` to button link |

## Impact

After this fix:
- New admin-created accounts will receive emails with correct login links
- Resent invitations will have correct login links
- SendGrid click tracking won't rewrite URLs (preventing 404s)
- Links will go directly to `/auth` page where users can log in

## Verification After Fix

1. Create a new test account via Admin panel
2. Check the welcome email - "Login Now" should link to `https://appinterio.app/auth`
3. Click the link - should land on login page (not 404)
4. Resend an invitation - should also have correct link
