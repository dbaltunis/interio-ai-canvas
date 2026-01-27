

# Fix: Payment Configuration Bugs and GST/Discount Calculation Issue

## Why Did the Data Isolation Bug Happen?

The share link RLS policy bug occurred because when the feature to share work orders publicly was implemented, the policy was added to **both** `anon` AND `authenticated` roles:

```sql
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon, authenticated -- BUG: should be anon only
```

This was likely done to handle the case where a logged-in user clicks their own shared link. However, PostgreSQL combines permissive RLS policies using **OR** logic. This meant:

- **Policy 1**: "Users can see projects in their account" 
- **Policy 2**: "Users can see projects with share links" (accidentally applied to ALL authenticated users)
- **Combined**: ANY logged-in user could see ANY project with a share link

This is a common multi-tenant security pitfall - share/public access features must be carefully scoped to only the `anon` role, never `authenticated`.

---

## New Bugs Identified (From Your Image)

### Bug 1: Fixed Amount Mode - No Save Button

**Problem**: When switching from "Percentage" to "Fixed Amount" deposit mode, the "Save Configuration" button never appears.

**Root Cause**: The `hasChanges` tracking in `InlinePaymentConfig.tsx` only monitors `paymentType` and `depositPercentage`:

```typescript
// Line 54-65 - CURRENT (BUG)
useEffect(() => {
  const typeChanged = currentPayment.type !== paymentType;
  const percentageChanged = currentPayment.type === 'deposit' && 
    currentPayment.percentage !== depositPercentage;
  
  setHasChanges(typeChanged || percentageChanged);
  // ❌ Does NOT track useFixedAmount or fixedAmount changes!
}, [paymentType, depositPercentage, currentPayment]);
```

**Fix**: Add `useFixedAmount` and `fixedAmount` to the change tracking logic.

---

### Bug 2: Deposit Amount Calculation - GST Mismatch

**Problem** (from your spreadsheet):
- Quote Total (inc GST): **NZ$115.00** 
- Discount Applied: **-NZ$10.00** (this is GST-exclusive!)
- After Discount shown: **NZ$105.00**
- Deposit (50%): **NZ$52.50**

**What it SHOULD be**:
- Quote Total (inc GST): **NZ$115.00**
- Discount (GST-inclusive equivalent): **-NZ$11.50** (10 × 1.15)
- After Discount: **NZ$103.50**
- Deposit (50%): **NZ$51.75**

**Root Cause**: The discount is applied to the **pre-tax subtotal** in `QuotationSummary` (which is correct for accounting), but `InlinePaymentConfig` receives:
- `total` = GST-inclusive price (NZ$115)
- `discountAmount` = GST-exclusive discount (NZ$10)

Then it calculates: `discountedTotal = total - discountAmount = 115 - 10 = 105`

But this is mathematically wrong because you're subtracting apples from oranges!

**Correct calculation**: Either:
1. Pass the already-discounted total (after GST recalculation) to the payment config, OR
2. Pass the GST-inclusive discount amount

**Fix**: Pass the **already-discounted total** (`totalAfterDiscount`) instead of the raw `total` and `discountAmount` separately.

---

## Solution Implementation

### Part 1: Fix Missing Save Button for Fixed Amount

**File**: `src/components/jobs/quotation/InlinePaymentConfig.tsx`

Update the `hasChanges` tracking to include fixed amount state:

```typescript
// Track changes - FIXED
useEffect(() => {
  if (!currentPayment) {
    // New config - any non-default settings count as changes
    const hasDepositChanges = paymentType === 'deposit' || depositPercentage !== 50;
    const hasFixedAmountChanges = useFixedAmount && fixedAmount > 0;
    setHasChanges(hasDepositChanges || hasFixedAmountChanges);
    return;
  }
  
  const typeChanged = currentPayment.type !== paymentType;
  const percentageChanged = currentPayment.type === 'deposit' && 
    currentPayment.percentage !== depositPercentage;
  const fixedAmountModeChanged = useFixedAmount; // Fixed amount is always a change from saved
  const fixedAmountValueChanged = useFixedAmount && fixedAmount !== currentPayment.amount;
  
  setHasChanges(typeChanged || percentageChanged || fixedAmountModeChanged || fixedAmountValueChanged);
}, [paymentType, depositPercentage, currentPayment, useFixedAmount, fixedAmount]);
```

Also update `handleSaveConfig` to support fixed amounts:

```typescript
const handleSaveConfig = async () => {
  await updatePaymentConfig.mutateAsync({
    quoteId,
    paymentType,
    paymentPercentage: paymentType === 'deposit' && !useFixedAmount ? depositPercentage : undefined,
    fixedAmount: paymentType === 'deposit' && useFixedAmount ? fixedAmount : undefined,
    total,
    discountAmount,
  });
  setHasChanges(false);
};
```

### Part 2: Fix GST-Inclusive Discount in Payment Summary

**File**: `src/components/jobs/tabs/QuotationTab.tsx`

Pass the **already-calculated discounted total** instead of raw total + separate discount:

```typescript
// Line 1017-1030 - FIXED
{isPaymentConfigOpen && (
  <InlinePaymentConfig
    quoteId={activeQuoteId || quoteId || quoteVersions?.[0]?.id || ''}
    total={currentQuote?.discount_type ? totalAfterDiscount : total} // Pass discounted total!
    discountAmount={0} // No longer needed - already factored in
    currency={projectData.currency}
    currentPayment={currentQuote ? {
      type: currentQuote.payment_type as 'full' | 'deposit' || 'full',
      percentage: currentQuote.payment_percentage || undefined,
      amount: currentQuote.payment_amount || (currentQuote?.discount_type ? totalAfterDiscount : total),
      status: currentQuote.payment_status as 'pending' | 'paid' | 'deposit_paid' | 'failed' || undefined
    } : undefined}
  />
)}
```

This ensures the payment configuration receives the **correct GST-inclusive discounted total**, and the 50% deposit will calculate correctly.

### Part 3: Update useQuotePayment Hook

**File**: `src/hooks/useQuotePayment.ts`

Add support for fixed amounts:

```typescript
const updatePaymentConfig = useMutation({
  mutationFn: async ({ 
    quoteId, 
    paymentType, 
    paymentPercentage,
    fixedAmount, // NEW
    total,
    discountAmount = 0
  }: {
    quoteId: string;
    paymentType: 'full' | 'deposit';
    paymentPercentage?: number;
    fixedAmount?: number; // NEW
    total: number;
    discountAmount?: number;
  }) => {
    // Calculate payment amount
    let paymentAmount: number;
    if (paymentType === 'full') {
      paymentAmount = total; // Already discounted from caller
    } else if (fixedAmount !== undefined) {
      paymentAmount = fixedAmount; // User specified exact amount
    } else {
      paymentAmount = (total * (paymentPercentage || 50)) / 100;
    }

    const { data, error } = await supabase
      .from("quotes")
      .update({
        payment_type: paymentType,
        payment_percentage: paymentType === 'deposit' && !fixedAmount ? paymentPercentage : null,
        payment_amount: paymentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  // ... rest unchanged
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/jobs/quotation/InlinePaymentConfig.tsx` | Fix hasChanges to include fixed amount, update handleSaveConfig |
| `src/components/jobs/tabs/QuotationTab.tsx` | Pass totalAfterDiscount instead of total + discountAmount |
| `src/hooks/useQuotePayment.ts` | Add fixedAmount parameter support |

---

## Expected Results After Fix

Based on your spreadsheet example:

| Field | Current (Bug) | After Fix |
|-------|---------------|-----------|
| Quote Total | NZ$115.00 | NZ$115.00 |
| Discount Applied | -NZ$10.00 (wrong: excl GST) | Discount already in total |
| After Discount | NZ$105.00 | NZ$103.50 |
| Payment Required (50%) | NZ$52.50 | NZ$51.75 |
| Balance Due | NZ$52.50 | NZ$51.75 |

---

## Summary

1. **Data Isolation Bug**: Happened because share link RLS policy was applied to authenticated users - now fixed in previous migration
2. **Missing Save Button**: `hasChanges` effect doesn't track fixed amount state - will add those dependencies  
3. **Incorrect Deposit Amount**: GST-exclusive discount subtracted from GST-inclusive total - will pass pre-calculated discounted total instead

