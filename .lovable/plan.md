
# Fix: QuotationSummary Double-Discount Bug and Edge Function Tax-Inclusive Fallback

## Summary

This plan addresses two remaining issues identified in the comprehensive payment calculation audit:

1. **QuotationSummary Double-Discount Bug**: The component subtracts `discountAmount` from `subtotal` even when `subtotal` is already discounted
2. **Edge Function Tax-Inclusive Fallback**: The `create-quote-payment` function's fallback calculation ignores the `tax_inclusive` setting

---

## Issue #1: QuotationSummary Double-Discount Bug

### Current State

**File**: `src/components/jobs/quotation/QuotationSummary.tsx`

The component is currently **unused** (orphaned code) - `QuoteProfitSummary` has replaced it in `QuotationTab.tsx`. However, the bug should still be fixed for code hygiene and future safety.

**Bug Location (Line 63)**:
```typescript
const subtotalAfterDiscount = subtotal - discountAmount;
```

**Problem**: The component interface expects EITHER:
- `subtotal` = pre-discount amount (and it applies discount), OR  
- `subtotal` = already-discounted amount (and should NOT apply discount again)

The current code always subtracts, causing double-discounting if the caller passes an already-discounted subtotal.

### Solution

Add a new prop `originalSubtotal` to explicitly separate pre-discount and post-discount values, making the component's behavior unambiguous:

```typescript
interface QuotationSummaryProps {
  subtotal: number;              // After discount (what displays as "After Discount")
  originalSubtotal?: number;     // Before discount (optional, for display purposes)
  // ... rest unchanged
}
```

Then update the logic:
```typescript
// Use originalSubtotal if provided, otherwise assume subtotal is pre-discount
const displayOriginalSubtotal = originalSubtotal ?? subtotal;
const displayDiscountedSubtotal = discountAmount > 0 ? subtotal : displayOriginalSubtotal;
// No need to recalculate - just use what's passed
```

**Simpler Alternative (Recommended)**: Since this component appears unused, simply remove the redundant calculation and trust the passed values:

```typescript
// Line 63 - BEFORE
const subtotalAfterDiscount = subtotal - discountAmount;

// Line 63 - AFTER  
// subtotal is already the discounted value when discount is applied
// discountAmount is only for display purposes
const subtotalAfterDiscount = subtotal;
```

And update the UI to show discount properly:
```typescript
// Lines 130-148 - Update discount section display
{discountAmount > 0 && (
  <div className="space-y-1">
    <div className="flex justify-between text-sm items-center">
      <span className="text-destructive flex items-center gap-2">
        Discount Applied:
        {onEditDiscount && (
          <button onClick={onEditDiscount} className="text-xs underline hover:no-underline">
            Edit
          </button>
        )}
      </span>
      <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
    </div>
    <div className="flex justify-between font-medium">
      <span>After Discount:</span>
      <span>{formatCurrency(subtotal)}</span>  {/* subtotal IS the after-discount value */}
    </div>
  </div>
)}
```

---

## Issue #2: Edge Function Tax-Inclusive Fallback

### Current State

**File**: `supabase/functions/create-quote-payment/index.ts`

**Bug Location (Lines 90-93)**:
```typescript
const discountAmount = quote.discount_amount || 0;
const quoteTotal = quote.total || 0;
const discountedTotal = Math.max(0, quoteTotal - discountAmount);  // ❌ WRONG for tax-inclusive
const paymentAmount = quote.payment_amount || discountedTotal;
```

**Problem**: `discount_amount` is stored as a pre-tax value. For tax-inclusive businesses:
- `quoteTotal` = $115 (inc. GST)
- `discount_amount` = $10 (excl. GST)
- `discountedTotal` = $115 - $10 = $105 ❌

**Should be**:
- GST-inclusive discount = $10 × 1.15 = $11.50
- `discountedTotal` = $115 - $11.50 = $103.50 ✓

### Solution

1. **Fetch pricing_settings from business_settings**:
```typescript
const { data: businessSettings } = await supabaseClient
  .from("business_settings")
  .select("currency, company_name, tax_rate, pricing_settings")  // Add tax_rate and pricing_settings
  .eq("user_id", user.id)
  .single();

const currency = (businessSettings?.currency || "USD").toLowerCase();
const companyName = businessSettings?.company_name || "Company";
const taxRate = (businessSettings?.tax_rate || 0) / 100;  // Convert from percentage
const pricingSettings = businessSettings?.pricing_settings as { tax_inclusive?: boolean } | null;
const taxInclusive = pricingSettings?.tax_inclusive || false;
```

2. **Update fallback calculation**:
```typescript
// Fallback calculation respects tax_inclusive mode
const discountAmount = quote.discount_amount || 0;
const quoteTotal = quote.total || 0;

let discountedTotal: number;
if (discountAmount > 0 && taxInclusive && taxRate > 0) {
  // Tax-inclusive: discount was calculated on pre-tax subtotal
  // Convert to GST-inclusive discount before subtracting from GST-inclusive total
  const discountWithGST = discountAmount * (1 + taxRate);
  discountedTotal = Math.max(0, quoteTotal - discountWithGST);
} else {
  // Tax-exclusive or no discount: simple subtraction
  discountedTotal = Math.max(0, quoteTotal - discountAmount);
}

const paymentAmount = quote.payment_amount || discountedTotal;
```

3. **Add enhanced logging**:
```typescript
logStep("Preparing payment", { 
  paymentAmount, 
  paymentType, 
  currency,
  clientEmail,
  discountAmount,
  quoteTotal,
  discountedTotal,
  storedPaymentAmount: quote.payment_amount,
  taxInclusive,  // NEW
  taxRate        // NEW
});
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/quotation/QuotationSummary.tsx` | Remove double-discount calculation at line 63 |
| `supabase/functions/create-quote-payment/index.ts` | Add tax_inclusive handling to fallback calculation |

---

## Technical Details

### QuotationSummary.tsx Changes

**Line 63**: Remove the redundant subtraction
```typescript
// BEFORE
const subtotalAfterDiscount = subtotal - discountAmount;

// AFTER - subtotal is already the discounted value
const subtotalAfterDiscount = subtotal;
```

**Lines 143-146**: Update display to use subtotal directly (already correct label)
```typescript
<div className="flex justify-between font-medium">
  <span>After Discount:</span>
  <span>{formatCurrency(subtotalAfterDiscount)}</span>
</div>
```

### create-quote-payment/index.ts Changes

**Lines 73-77**: Expand business settings query
```typescript
const { data: businessSettings } = await supabaseClient
  .from("business_settings")
  .select("currency, company_name, tax_rate, pricing_settings")
  .eq("user_id", user.id)
  .single();

const currency = (businessSettings?.currency || "USD").toLowerCase();
const companyName = businessSettings?.company_name || "Company";
const taxRate = (businessSettings?.tax_rate || 0) / 100;
const pricingSettings = businessSettings?.pricing_settings as { tax_inclusive?: boolean } | null;
const taxInclusive = pricingSettings?.tax_inclusive || false;
```

**Lines 90-93**: Tax-aware fallback calculation
```typescript
const discountAmount = quote.discount_amount || 0;
const quoteTotal = quote.total || 0;

let discountedTotal: number;
if (discountAmount > 0 && taxInclusive && taxRate > 0) {
  const discountWithGST = discountAmount * (1 + taxRate);
  discountedTotal = Math.max(0, quoteTotal - discountWithGST);
} else {
  discountedTotal = Math.max(0, quoteTotal - discountAmount);
}

const paymentAmount = quote.payment_amount || discountedTotal;
```

---

## Verification

After implementation:

1. **QuotationSummary** (if ever used):
   - When passed `subtotal=90` and `discountAmount=10`, displays "After Discount: $90" (not $80)

2. **Stripe Payment (Tax-Exclusive)**:
   - Quote total: $103.50 (subtotal $90 + $13.50 GST)
   - Discount: $10 (pre-tax)
   - Payment amount: $103.50 (already includes discount in total)

3. **Stripe Payment (Tax-Inclusive, Fallback)**:
   - Quote total: $115 (inc. GST)
   - Discount: $10 (pre-tax stored value)
   - Fallback calculation: $115 - ($10 × 1.15) = $103.50 ✓

---

## Notes

- The `QuotationSummary` component appears to be unused (replaced by `QuoteProfitSummary`), but fixing it prevents future bugs if it's reactivated
- The edge function fix only affects the fallback path - if `payment_amount` is properly set by the frontend (which it now is after previous fixes), this fallback won't be triggered
- Both fixes align with Xero/QuickBooks export standards (discounts applied to pre-tax subtotals)
