

# Fix Quote Total Display - Field Name Mismatch

## Problem Confirmed

Looking at line 441 in `TWCSubmitDialog.tsx`:

```typescript
{quotationData.currency} {quotationData.total?.toFixed(2) || "0.00"}
```

**The issue:** The database stores the quote total in `total_amount`, but the code looks for `total` which doesn't exist.

| What Database Has | What Code Looks For | Result |
|-------------------|---------------------|--------|
| `total_amount: 487.50` | `quotationData.total` | `undefined` → "0.00" |

## Solution

**File:** `src/components/integrations/TWCSubmitDialog.tsx`

**Line 441 - Change:**
```typescript
// FROM:
{quotationData.currency} {quotationData.total?.toFixed(2) || "0.00"}

// TO:
{quotationData.currency} {(quotationData.total_amount ?? quotationData.total)?.toFixed(2) || "0.00"}
```

This uses:
1. `total_amount` first (the actual database column name)
2. Falls back to `total` for compatibility with any code that might use that naming

## Impact

- Your current quote: Will show "AUD 487.50" instead of "AUD 0.00"  
- All future quotes: Correctly display totals
- All 600+ clients: Automatically fixed

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/components/integrations/TWCSubmitDialog.tsx` | 441 | Use `total_amount ?? total` |

