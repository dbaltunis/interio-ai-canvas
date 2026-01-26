

# Fix Quote Total Display - Field Name Mismatch

## Problem Identified

**The Quote Total shows "AUD 0.00" because of a field name mismatch:**

| Database Column | What Code Looks For | Result |
|-----------------|---------------------|--------|
| `quotes.total_amount` = 487.50 | `quotationData.total` | `undefined` → displays as "0.00" |

The actual quote has the correct values:
- `total_amount`: **487.50**
- `subtotal`: **487.50**
- `currency`: **AUD**

But `TWCSubmitDialog.tsx` (line 441) accesses `quotationData.total` which doesn't exist on the raw database record.

## Solution

Update `TWCSubmitDialog.tsx` to use `total_amount` instead of `total`:

**File:** `src/components/integrations/TWCSubmitDialog.tsx`

**Line 441:**
```typescript
// Before (broken):
{quotationData.currency} {quotationData.total?.toFixed(2) || "0.00"}

// After (fixed):
{quotationData.currency} {(quotationData.total_amount ?? quotationData.total)?.toFixed(2) || "0.00"}
```

The fix uses `total_amount ?? total` to:
1. First try `total_amount` (database column name)
2. Fall back to `total` (for cases where quotationData comes from buildQuotationItems which may use different naming)

## Impact

- **This quote**: Will show "AUD 487.50" instead of "AUD 0.00"
- **All future quotes**: Will correctly display totals
- **All 600+ clients**: Automatically fixed (core code change)

## Files to Modify

| File | Change |
|------|--------|
| `src/components/integrations/TWCSubmitDialog.tsx` | Line 441: Use `total_amount ?? total` instead of just `total` |

