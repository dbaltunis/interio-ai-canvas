
# Fix: Discount Amount Not Recalculated During Quote Sync

## Root Cause Identified

After thorough investigation, I found the critical bug:

**The `useQuotationSync` hook updates quote totals but does NOT recalculate the `discount_amount` when the subtotal changes.**

### Evidence from Database

| Field | Value | Analysis |
|-------|-------|----------|
| `discount_type` | `percentage` | ✓ Saved correctly |
| `discount_value` | `10.00` | ✓ Saved correctly |
| `discount_scope` | `all` | ✓ Saved correctly |
| `discount_amount` | `0.00` | ❌ **Should be £48.75** (10% of £487.50) |
| `subtotal` | `£487.50` | ✓ Updated by sync |
| `total_amount` | `£487.50` | ❌ Should reflect discount |

### The Problem Flow

```text
1. User applies 10% discount → discount_amount = £50 (on subtotal £500)
2. User makes changes OR page refreshes
3. useQuotationSync runs and detects changes
4. Sync recalculates: subtotal = £487.50, total = £487.50
5. Sync updates quote with NEW subtotal/total
6. BUT sync does NOT recalculate discount_amount!
7. discount_amount stays at £0 (or stale value)
8. UI shows no discount because discount_amount = 0
```

---

## Solution

### Update `useQuotationSync.ts` to Recalculate Discount

When updating a quote, check if a discount configuration exists and recalculate the `discount_amount` based on the NEW subtotal.

**Location**: `src/hooks/useQuotationSync.ts` lines 922-935

**Current Code**:
```typescript
await updateQuote.mutateAsync({
  id: existingQuote.id,
  client_id: clientId || null,
  subtotal: quotationData.subtotal,
  tax_rate: taxRate,
  tax_amount: quotationData.taxAmount,
  total_amount: quotationData.total,
  notes: `Updated with ${quotationData.items.length} items - ${new Date().toISOString()}`,
  updated_at: new Date().toISOString()
});
```

**Fixed Code**:
```typescript
// CRITICAL FIX: Recalculate discount_amount if discount config exists
let discountAmount = 0;
if (existingQuote.discount_type && existingQuote.discount_value) {
  const discountConfig = {
    type: existingQuote.discount_type as 'percentage' | 'fixed',
    value: existingQuote.discount_value,
    scope: existingQuote.discount_scope as 'all' | 'fabrics_only' | 'selected_items',
    selectedItems: existingQuote.selected_discount_items || undefined
  };
  
  // Recalculate discount on NEW subtotal
  if (discountConfig.scope === 'all') {
    discountAmount = discountConfig.type === 'percentage'
      ? (quotationData.subtotal * discountConfig.value) / 100
      : Math.min(discountConfig.value, quotationData.subtotal);
  } else if (discountConfig.scope === 'fabrics_only') {
    // Filter fabric items and calculate
    const fabricItems = quotationData.items.filter(item => {
      const text = (item.name + ' ' + item.description).toLowerCase();
      return text.includes('fabric') || text.includes('material') || 
             text.includes('blind') || text.includes('curtain');
    });
    const fabricTotal = fabricItems.reduce((sum, item) => sum + (item.total || 0), 0);
    discountAmount = discountConfig.type === 'percentage'
      ? (fabricTotal * discountConfig.value) / 100
      : Math.min(discountConfig.value, fabricTotal);
  } else if (discountConfig.scope === 'selected_items' && discountConfig.selectedItems) {
    const selectedSet = new Set(discountConfig.selectedItems);
    const selectedTotal = quotationData.items
      .filter(item => selectedSet.has(item.id))
      .reduce((sum, item) => sum + (item.total || 0), 0);
    discountAmount = discountConfig.type === 'percentage'
      ? (selectedTotal * discountConfig.value) / 100
      : Math.min(discountConfig.value, selectedTotal);
  }
  
  console.log('[QUOTE SYNC] Recalculated discount:', {
    config: discountConfig,
    newSubtotal: quotationData.subtotal,
    recalculatedDiscount: discountAmount
  });
}

await updateQuote.mutateAsync({
  id: existingQuote.id,
  client_id: clientId || null,
  subtotal: quotationData.subtotal,
  tax_rate: taxRate,
  tax_amount: quotationData.taxAmount,
  total_amount: quotationData.total,
  discount_amount: discountAmount, // CRITICAL: Include recalculated discount
  notes: `Updated with ${quotationData.items.length} items - ${new Date().toISOString()}`,
  updated_at: new Date().toISOString()
});
```

---

## Alternative: Extract Helper Function

To avoid code duplication with `useQuoteDiscount.ts`, extract the calculation logic to a shared utility:

**Create**: `src/utils/quotes/calculateDiscountAmount.ts`

```typescript
export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'all' | 'fabrics_only' | 'selected_items';
  selectedItems?: string[];
}

export const calculateDiscountAmount = (
  items: any[],
  config: DiscountConfig,
  subtotal: number
): number => {
  let discountableAmount = 0;

  if (config.scope === 'all') {
    discountableAmount = subtotal;
  } else if (config.scope === 'fabrics_only') {
    const fabricItems = items.filter(item => {
      const text = ((item.name || '') + ' ' + (item.description || '')).toLowerCase();
      return text.includes('fabric') || text.includes('material') ||
             text.includes('textile') || text.includes('curtain') ||
             text.includes('drape') || text.includes('blind') ||
             text.includes('roman') || text.includes('roller');
    });
    discountableAmount = fabricItems.reduce((sum, item) => 
      sum + (item.total || item.total_price || 0), 0);
  } else if (config.scope === 'selected_items' && config.selectedItems) {
    const selectedSet = new Set(config.selectedItems);
    discountableAmount = items
      .filter(item => selectedSet.has(item.id))
      .reduce((sum, item) => sum + (item.total || item.total_price || 0), 0);
  }

  if (config.type === 'percentage') {
    return (discountableAmount * config.value) / 100;
  } else {
    return Math.min(config.value, discountableAmount);
  }
};
```

Then update both `useQuotationSync.ts` and `useQuoteDiscount.ts` to use this shared function.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useQuotationSync.ts` | Add discount recalculation when updating quote |
| `src/utils/quotes/calculateDiscountAmount.ts` | NEW - shared discount calculation utility |
| `src/hooks/useQuoteDiscount.ts` | Update to use shared utility (optional refactor) |

---

## Verification Steps

After implementing the fix:

1. **Page Refresh Test**:
   - Apply 10% discount on a quote with £487.50 subtotal
   - Hard refresh the page (Ctrl+Shift+R)
   - Verify discount line shows `-£48.75`
   - Verify total shows `£438.75` (or tax-adjusted equivalent)

2. **Item Change Test**:
   - Apply discount, then add/remove a window treatment
   - Verify discount recalculates based on new subtotal

3. **Multiple Scopes Test**:
   - Test `all`, `fabrics_only`, and `selected_items` scopes
   - Verify each recalculates correctly after page refresh

---

## Expected Outcome

| Before Fix | After Fix |
|------------|-----------|
| Discount shows in config but not applied | Discount shows correctly in quote total |
| `discount_amount = 0` after refresh | `discount_amount` recalculates on every sync |
| UI shows full price | UI shows discounted price |
| Payment calculations wrong | Payment calculations correct |

---

## Technical Notes

- The discount is always calculated on the **pre-tax subtotal** (selling price with markup, before GST)
- This follows accounting standards (Xero/QuickBooks)
- The fix maintains compatibility with tax-inclusive mode calculations in `QuotationTab.tsx`
- The `total_amount` stored in DB remains the **pre-discount total** - discount is applied at display time
- This is consistent with the existing architecture where `QuotationTab.tsx` handles discount display logic
