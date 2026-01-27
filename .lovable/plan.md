
# Comprehensive Payment Calculation Testing & Fix Plan

## Executive Summary

After thorough investigation of the codebase, database records, and accounting integration logic, I've identified **3 critical issues** affecting payment calculations across the application. The good news: the Xero/QuickBooks export logic follows best practices, but the internal payment configuration has calculation mismatches.

---

## Issues Identified

### Issue 1: Fixed Amount Mode - No Save Button ✅ (Already Fixed)

The previous fix addressed this by adding `useFixedAmount` and `fixedAmount` to the `hasChanges` tracking. This should now work correctly.

**Status**: Fixed in previous message. Needs verification.

---

### Issue 2: Tax-Inclusive Mode Not Respected in Discount Calculation

**Location**: `QuotationTab.tsx` lines 414-419

**Current (Bug)**:
```typescript
const subtotalAfterDiscount = subtotal - discountAmount;
const taxAmountAfterDiscount = subtotalAfterDiscount * taxRate;
const totalAfterDiscount = subtotalAfterDiscount + taxAmountAfterDiscount;
```

**Problem**: This always calculates as if `tax_inclusive = false` (tax-exclusive mode). For users with `tax_inclusive = true`, this produces wrong totals.

**Correct Logic**:
```typescript
const pricingSettings = businessSettings?.pricing_settings as any;
const taxInclusive = pricingSettings?.tax_inclusive || false;

let totalAfterDiscount: number;
let subtotalAfterDiscount: number;
let taxAmountAfterDiscount: number;

if (taxInclusive) {
  // Prices include tax - discount applies to inclusive price
  // discount_amount is calculated on pre-tax subtotal by useQuoteDiscount
  // So we need to apply discount to subtotal, then recalculate inclusive total
  const baseSubtotalAfterDiscount = (subtotal / (1 + taxRate)) - discountAmount;
  subtotalAfterDiscount = baseSubtotalAfterDiscount;
  totalAfterDiscount = baseSubtotalAfterDiscount * (1 + taxRate);
  taxAmountAfterDiscount = totalAfterDiscount - subtotalAfterDiscount;
} else {
  // Tax-exclusive: discount applies to subtotal, tax recalculated
  subtotalAfterDiscount = subtotal - discountAmount;
  taxAmountAfterDiscount = subtotalAfterDiscount * taxRate;
  totalAfterDiscount = subtotalAfterDiscount + taxAmountAfterDiscount;
}
```

---

### Issue 3: Discount Storage is Tax-Ambiguous

**Location**: `useQuoteDiscount.ts` and database `quotes.discount_amount`

**Current Problem**: 
- The discount is calculated against the **subtotal** (pre-tax in tax-exclusive mode)
- But the stored `discount_amount` has no metadata about whether it's pre-tax or post-tax
- When passed to `InlinePaymentConfig`, it may be subtracted from a GST-inclusive total

**Example from User's Image**:
| Field | Value | Analysis |
|-------|-------|----------|
| Quote Total (inc GST) | NZ$115.00 | Correct - subtotal + 15% GST |
| Discount Applied | -NZ$10.00 | Wrong - this is GST-exclusive! |
| After Discount | NZ$105.00 | Wrong - should be NZ$103.50 |

**Correct Calculation**:
- Subtotal: $100.00
- Discount: $10.00 (applied to subtotal)
- Discounted Subtotal: $90.00
- GST (15%): $13.50
- **Total After Discount: $103.50**

The bug is mixing a pre-tax discount ($10) with a post-tax total ($115), yielding $105 instead of $103.50.

---

## Best Practices from QuickBooks/Xero

The export logic (`invoiceExport.ts`) already follows accounting best practices:

### Standard (Recommended):
1. Discounts are applied to the **pre-tax subtotal**
2. Tax is calculated on the discounted subtotal
3. Final total = discounted subtotal + tax

### For Xero Exports:
- Uses negative line items for discounts
- Tax type on discount line is `NONE` (discount doesn't attract GST)

### For QuickBooks Exports:
- Proportionally distributes discount across all line items
- Adjusts each item's `unit_price` and `total` by `discountRatio`

These patterns should be replicated in the payment calculation flow.

---

## Files Requiring Modification

| File | Issue | Change Required |
|------|-------|-----------------|
| `src/components/jobs/tabs/QuotationTab.tsx` | Tax-inclusive mode ignored | Add tax_inclusive check to `projectData` calculation |
| `src/components/jobs/quotation/InlinePaymentConfig.tsx` | Already fixed | Verify fix works |
| `src/hooks/useQuotePayment.ts` | Already fixed | Verify fix works |
| `src/components/jobs/quotation/InlineDiscountPanel.tsx` | Display accuracy | Should show GST-inclusive discount for tax-inclusive users |

---

## Detailed Fix Implementation

### Fix 1: Update QuotationTab.tsx `projectData` Calculation

**Lines 414-419** - Add tax_inclusive awareness:

```typescript
// Get tax inclusive setting from business settings
const pricingSettings = businessSettings?.pricing_settings as any;
const taxInclusive = pricingSettings?.tax_inclusive || false;

// Calculate discount if applicable
const hasDiscount = !!currentQuote?.discount_type;
const discountAmount = currentQuote?.discount_amount || 0; // This is pre-tax

let subtotalAfterDiscount: number;
let taxAmountAfterDiscount: number;
let totalAfterDiscount: number;

if (hasDiscount) {
  // Discount was calculated on pre-tax subtotal
  // Apply consistently regardless of tax_inclusive mode
  const preDiscountSubtotal = taxInclusive 
    ? subtotal / (1 + taxRate)  // Extract net from gross
    : subtotal;
  
  const discountedSubtotal = preDiscountSubtotal - discountAmount;
  
  if (taxInclusive) {
    totalAfterDiscount = discountedSubtotal * (1 + taxRate);
    subtotalAfterDiscount = discountedSubtotal;
    taxAmountAfterDiscount = totalAfterDiscount - discountedSubtotal;
  } else {
    subtotalAfterDiscount = discountedSubtotal;
    taxAmountAfterDiscount = discountedSubtotal * taxRate;
    totalAfterDiscount = discountedSubtotal + taxAmountAfterDiscount;
  }
} else {
  subtotalAfterDiscount = subtotal;
  taxAmountAfterDiscount = taxAmount;
  totalAfterDiscount = total;
}
```

### Fix 2: Update InlineDiscountPanel Display

Show the GST-inclusive discount impact when `tax_inclusive = true`:

```typescript
// In InlineDiscountPanel.tsx, calculate GST-inclusive discount display
const pricingSettings = businessSettings?.pricing_settings as any;
const taxInclusive = pricingSettings?.tax_inclusive || false;

const displayDiscountAmount = taxInclusive 
  ? discountAmount * (1 + taxRate / 100)  // Show GST-inclusive amount
  : discountAmount;
```

This ensures users see the true impact of their discount in their configured pricing mode.

---

## Verification Test Cases

### Test Case 1: Tax-Exclusive Mode (Default)
- **Settings**: tax_inclusive = false, tax_rate = 15%
- **Subtotal**: $100.00
- **Discount**: 10% ($10.00)
- **Expected**:
  - Discounted Subtotal: $90.00
  - GST: $13.50
  - **Total: $103.50**
  - 50% Deposit: **$51.75**

### Test Case 2: Tax-Inclusive Mode (NZ Standard)
- **Settings**: tax_inclusive = true, tax_rate = 15%
- **Total**: $115.00 (which = $100 net + $15 GST)
- **Discount**: 10% of net ($10.00)
- **Expected**:
  - Discounted Net: $90.00
  - GST on Discounted: $13.50
  - **Total After Discount: $103.50**
  - 50% Deposit: **$51.75**

### Test Case 3: Fixed Amount Deposit
- **Total After Discount**: $103.50
- **Fixed Deposit**: $50.00
- **Expected**:
  - Payment Required: **$50.00**
  - Balance Due: **$53.50**
  - "Save Configuration" button should appear

### Test Case 4: Xero Export Validation
- Export a discounted quote to Xero format
- Verify discount appears as negative line item
- Verify tax on discount line is `NONE`
- Verify final total matches UI

### Test Case 5: QuickBooks Export Validation
- Export a discounted quote to QuickBooks format
- Verify each line item's price is proportionally reduced
- Verify memo includes discount note
- Verify final total matches UI

---

## Database Considerations

The current `quotes.discount_amount` field stores the **pre-tax discount amount**. This is correct and follows accounting standards. No schema change needed.

However, the code consuming this value must be aware that:
1. It's always pre-tax (applied to subtotal)
2. Tax should be recalculated AFTER applying discount
3. Display in tax-inclusive mode should show the GST-inclusive equivalent

---

## Impact Assessment

| Change | Affects | Risk |
|--------|---------|------|
| QuotationTab.tsx tax-inclusive fix | All quotes with discounts in tax-inclusive accounts | Low - purely display/calculation, no data change |
| InlineDiscountPanel display fix | Discount preview UI | Low - cosmetic improvement |
| Verification of fixed amount save | Payment configuration | None - already fixed |

---

## Summary

The core issue is that the discount calculation logic in `QuotationTab.tsx` doesn't respect the `tax_inclusive` setting from business settings. The accounting exports (Xero/QuickBooks) ARE correctly implemented following standard practices.

The fix requires:
1. Add tax_inclusive awareness to `projectData` calculation in QuotationTab
2. Optionally improve InlineDiscountPanel to show tax-inclusive discount amounts
3. Verify the previously implemented fixed amount save button fix works

No database changes required. No changes to export logic needed (already correct).
