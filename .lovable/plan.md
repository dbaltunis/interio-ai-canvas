
## Fix: Discount Applied to Unchecked/Excluded Items

### Root Cause

Two issues combine to create this bug:

1. **Excluded items not filtered from discount calculation**: The `items` array passed to `InlineDiscountPanel` and `QuoteDiscountDialog` includes ALL quote items, even those excluded via `useQuoteExclusions`. When calculating the discount for `selected_items` scope, excluded items can still match selected IDs and contribute to the discountable amount.

2. **Sync fallback overrides scope**: In `useQuotationSync.ts` line 1013, the code `(existingQuote.discount_scope as ...) || 'all'` falls back to `'all'` if `discount_scope` is null or empty. This means if the scope field is ever cleared (e.g., during a version duplication or data migration), the discount silently applies to ALL items instead of selected ones.

3. **Auto-apply on panel mount**: The `InlineDiscountPanel` has an auto-apply mechanism (lines 72-86) that re-saves the discount on every panel open. If `currentDiscount.selectedItems` is undefined (JSONB parsing edge case), it saves an empty array, which combined with a stale scope can produce unexpected results.

### Changes

#### 1. Filter excluded items from discount calculations
**File:** `src/components/jobs/tabs/QuotationTab.tsx`

Before passing `items` to `InlineDiscountPanel` and `QuoteDiscountDialog`, filter out any excluded items using the existing `useQuoteExclusions` hook. This ensures excluded items cannot be selected for discounting and do not contribute to the discountable amount.

#### 2. Guard against scope fallback in sync
**File:** `src/hooks/useQuotationSync.ts`

Remove the `|| 'all'` fallback on line 1013. If `discount_scope` is null, the guard clause in `calculateDiscountAmount` already handles it (returns 0 when scope is null). The fallback silently changes behavior from "no discount" to "discount everything."

Change:
```
scope: (existingQuote.discount_scope as ...) || 'all',
```
To:
```
scope: existingQuote.discount_scope as 'all' | 'fabrics_only' | 'selected_items' | null,
```

#### 3. Remove auto-apply on mount from InlineDiscountPanel
**File:** `src/components/jobs/quotation/InlineDiscountPanel.tsx`

Remove the auto-apply useEffect (lines 70-86). This mechanism re-saves the discount every time the panel opens, which can overwrite the saved discount with potentially stale data. The first useEffect (lines 53-66) already correctly loads saved values for display. The user should explicitly click "Apply and Save" to persist changes.

#### 4. Validate selectedItems from JSONB
**File:** `src/hooks/useQuotationSync.ts`

Add validation to ensure `selected_discount_items` from the DB is a proper string array before using it:
```
selectedItems: Array.isArray(existingQuote.selected_discount_items)
  ? (existingQuote.selected_discount_items as any[]).filter(id => typeof id === 'string')
  : null
```

### Files to Modify
1. `src/components/jobs/tabs/QuotationTab.tsx` -- filter excluded items from discount panels
2. `src/hooks/useQuotationSync.ts` -- remove scope fallback, validate selectedItems
3. `src/components/jobs/quotation/InlineDiscountPanel.tsx` -- remove auto-apply on mount
