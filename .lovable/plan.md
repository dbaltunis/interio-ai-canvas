
# Fix TWC Submit Order Redirect Loop + Toast Visibility

## Two Issues Identified

### Issue 1: Maximum Redirects Error (Root Cause Found)

The logs show the URL being sent is:
```
https://twc.qodo.au/twcpublic/api/TwcPublic/SubmitOrder
```

**Problem:** The stored URL already contains `/twcpublic`, but the code appends `/api/TwcPublic/SubmitOrder` which creates a duplicate/incorrect path. The TWC server redirects this, creating an infinite loop.

**Evidence:** The working `twc-get-order-options` function correctly handles this by removing `/twcpublic` from the base URL first (line 78):
```typescript
const baseUrl = api_url.replace(/\/twcpublic\/?$/i, '');
```

But `twc-submit-order` does NOT do this normalization.

| Stored URL | twc-submit-order (broken) | twc-get-order-options (works) |
|------------|---------------------------|-------------------------------|
| `https://twc.qodo.au/twcpublic` | `/twcpublic/api/TwcPublic/...` ❌ | `/api/TwcPublic/...` ✅ |

### Issue 2: Toast Hidden Behind Dialog

The dialog has `z-[9999]` but the ToastViewport only has `z-[100]`, so notifications appear **behind** the modal and are not visible.

## Solution

### Fix 1: URL Normalization in twc-submit-order

**File:** `supabase/functions/twc-submit-order/index.ts`

Add the same URL normalization logic used in `twc-get-order-options`:

```typescript
// Line 104-118 - Replace current normalization with:
let normalizedUrl = api_url?.trim() || '';

// Ensure HTTPS
if (normalizedUrl.startsWith('http://')) {
  normalizedUrl = normalizedUrl.replace('http://', 'https://');
}
if (!normalizedUrl.startsWith('https://')) {
  normalizedUrl = 'https://' + normalizedUrl;
}

// CRITICAL: Remove trailing /twcpublic if present (as done in twc-get-order-options)
normalizedUrl = normalizedUrl.replace(/\/twcpublic\/?$/i, '');

// Remove trailing slashes
normalizedUrl = normalizedUrl.replace(/\/+$/, '');
```

This ensures URLs like `https://twc.qodo.au/twcpublic` become `https://twc.qodo.au` before appending `/api/TwcPublic/SubmitOrder`.

### Fix 2: Toast Z-Index

**File:** `src/components/ui/toast.tsx` (Line 18)

Change:
```typescript
z-[100]
```
To:
```typescript
z-[10000]
```

This ensures toasts appear **above** dialogs (`z-[9999]`).

**File:** `src/components/ui/toaster.tsx` (Line 31)

Also update the viewport className:
```typescript
z-[100] → z-[10000]
```

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/twc-submit-order/index.ts` | Add `/twcpublic` removal logic at line ~116 |
| `src/components/ui/toast.tsx` | Line 18: Change `z-[100]` to `z-[10000]` |
| `src/components/ui/toaster.tsx` | Line 31: Change `z-[100]` to `z-[10000]` |

## Expected Outcome

1. TWC order submission will work correctly for all URL formats stored in the database
2. Toast notifications will be visible above all dialogs
3. Fix applies automatically to all 600+ clients
