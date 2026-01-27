

# Fix: Tax-Inclusive Discount Calculation Bugs

## Summary

Found **3 critical bugs** in the discount calculation flow that cause incorrect amounts in tax-inclusive mode (NZ/AU/UK businesses). The bugs compound to create wildly wrong totals after page refresh.

## Bugs Identified

### Bug #1: `InlineDiscountPanel` saves discount on GROSS instead of NET

**File:** `src/components/jobs/quotation/InlineDiscountPanel.tsx`  
**Line:** 129

**Problem:** When saving the discount, the component passes the GROSS `subtotal` (£487.50) to `applyDiscount`, but `calculateDiscountAmount` should receive the NET amount for tax-inclusive mode.

**Current:**
```typescript
const result = await applyDiscount.mutateAsync({
  quoteId,
  config,
  items,
  subtotal,  // This is GROSS (sellingTotal)
});
```

**Fix:** Pass the pre-calculated net amount instead:
```typescript
const result = await applyDiscount.mutateAsync({
  quoteId,
  config,
  items,
  subtotal: preDiscountNetSubtotal,  // Use NET for tax-inclusive consistency
});
```

---

### Bug #2: `QuotationTab` double-extracts NET from subtotal

**File:** `src/components/jobs/tabs/QuotationTab.tsx`  
**Line:** 434

**Problem:** In tax-inclusive mode, `quotationData.subtotal` is ALREADY the net value (extracted in `useQuotationSync` line 795). But line 434 divides by `(1 + taxRate)` again, causing double-extraction.

**Current:**
```typescript
if (taxInclusive) {
  const preDiscountNetSubtotal = subtotal / (1 + taxRate);  // WRONG: subtotal is already NET!
  const discountedNetSubtotal = preDiscountNetSubtotal - discountAmount;
```

**Fix:** Use `quotationData.sellingTotal` (GROSS) as the base, or recognize that `subtotal` is already net:
```typescript
if (taxInclusive) {
  // subtotal is already NET (extracted in useQuotationSync)
  // discountAmount was calculated on NET, so apply directly
  const discountedNetSubtotal = subtotal - discountAmount;  // subtotal IS net already
  subtotalAfterDiscount = discountedNetSubtotal;
  totalAfterDiscount = discountedNetSubtotal * (1 + taxRate);
  taxAmountAfterDiscount = totalAfterDiscount - discountedNetSubtotal;
}
```

---

### Bug #3: `useQuotationSync` discount recalculation inconsistency

**File:** `src/hooks/useQuotationSync.ts`  
**Line:** 940

**Problem:** The sync passes `quotationData.subtotal` to `calculateDiscountAmount`. In tax-inclusive mode, this is NET (£423.91), but the initial save from `InlineDiscountPanel` passed GROSS. This causes the discount to change on every refresh.

**Current:**
```typescript
discountAmount = calculateDiscountAmount(
  quotationData.items,
  { type, value, scope, selectedItems },
  quotationData.subtotal  // NET in tax-inclusive mode
);
```

**Fix:** Always pass the NET subtotal for consistency. Since `quotationData.subtotal` is already NET in tax-inclusive mode (after Bug #1 fix), this will be consistent.

---

## Correct Math After Fixes

**Tax-Inclusive Example (15% GST, £487.50 items, 10% discount on all):**

| Step | Value | Calculation |
|------|-------|-------------|
| Gross selling total | £487.50 | Item prices (inc. GST) |
| Net subtotal | £423.91 | 487.50 / 1.15 |
| Discount (10% on NET) | £42.39 | 423.91 × 0.10 |
| Net after discount | £381.52 | 423.91 - 42.39 |
| Gross after discount | £438.75 | 381.52 × 1.15 |
| GST amount | £57.23 | 438.75 - 381.52 |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/quotation/InlineDiscountPanel.tsx` | Pass NET subtotal to applyDiscount |
| `src/components/jobs/tabs/QuotationTab.tsx` | Remove double-extraction in tax-inclusive branch |

---

## Technical Implementation

### InlineDiscountPanel.tsx (Line 129)

```typescript
// BEFORE
const result = await applyDiscount.mutateAsync({
  quoteId,
  config,
  items,
  subtotal,
});

// AFTER - Pass NET subtotal for consistent discount calculation
const result = await applyDiscount.mutateAsync({
  quoteId,
  config,
  items,
  subtotal: preDiscountNetSubtotal, // Use calculated NET for tax-inclusive compatibility
});
```

### QuotationTab.tsx (Lines 428-443)

```typescript
// BEFORE
if (hasDiscount && discountAmount > 0) {
  if (taxInclusive) {
    const preDiscountNetSubtotal = subtotal / (1 + taxRate);  // WRONG!
    const discountedNetSubtotal = preDiscountNetSubtotal - discountAmount;
    // ...
  }
}

// AFTER
if (hasDiscount && discountAmount > 0) {
  if (taxInclusive) {
    // In tax-inclusive mode, quotationData.subtotal is already NET (extracted in useQuotationSync)
    // discountAmount was also calculated on NET, so apply directly
    const discountedNetSubtotal = subtotal - discountAmount;
    subtotalAfterDiscount = discountedNetSubtotal;
    totalAfterDiscount = discountedNetSubtotal * (1 + taxRate);
    taxAmountAfterDiscount = totalAfterDiscount - discountedNetSubtotal;
  } else {
    // Tax-exclusive mode unchanged
    subtotalAfterDiscount = subtotal - discountAmount;
    taxAmountAfterDiscount = subtotalAfterDiscount * taxRate;
    totalAfterDiscount = subtotalAfterDiscount + taxAmountAfterDiscount;
  }
}
```

---

## Verification Scenarios

### Test 1: Tax-Exclusive (Current Setup)
- Items: £487.50, Discount: 10%, Tax: 15%
- Expected: Discount £48.75, Total £504.56 (after discount + tax)

### Test 2: Tax-Inclusive (NZ/AU/UK)
- Items: £487.50 (inc. GST), Discount: 10%, Tax: 15%
- Expected: Discount £42.39 (on NET), Total £438.75 (after discount, inc. GST)

### Test 3: Page Refresh Persistence
- Apply discount, hard refresh (Ctrl+Shift+R)
- Discount should show same values before and after refresh

### Test 4: Item Changes
- Apply discount, then modify item prices
- Discount should recalculate proportionally

---

## Notes

- The fix aligns discount calculations with Xero/QuickBooks standards (discount on pre-tax amount)
- Both `InlineDiscountPanel` and `useQuotationSync` will now consistently use NET subtotal for discount calculation
- The edge function fallback logic (already fixed) will correctly handle these values

