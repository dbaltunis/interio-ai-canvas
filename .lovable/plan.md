

# TWC Integration Fix - Remove Duplicate UI, Keep Your Rules Working

## Problem Summary
When selecting a TWC-linked template (like Pure Wood 50mm), the quote builder shows:
1. Your configured treatment options (with rules support) - at the top
2. TWC Manufacturing Options blue card (without rules) - duplicate below

This causes confusion and breaks your rules workflow.

## Solution
Hide the TWC Manufacturing Options card from the quote builder. Your existing options will continue working with rules, and we'll silently detect TWC products for supplier ordering.

## Files to Modify

| File | Change |
|------|--------|
| `DynamicRollerBlindFields.tsx` | Remove TWCProductOptions rendering (keep twc_item_number detection) |
| `DynamicCurtainOptions.tsx` | Same - remove card rendering, keep detection |
| `useQuotationSync.ts` | Ensure twc_item_number flows to quote_items.product_details |
| `TWCSubmitDialog.tsx` | Map your option selections to TWC API format |

## Implementation Details

### Step 1: Remove TWC Card from UI (Keep Detection)

In `DynamicRollerBlindFields.tsx` (lines 832-847):
- KEEP: The useEffect that detects TWC products and calls `onChange('twc_item_number', ...)`
- REMOVE: The `{linkedTWCData && <TWCProductOptions ... />}` rendering

Same for `DynamicCurtainOptions.tsx` (lines 1582-1612).

### Step 2: Fix Data Flow to Quote Items

In `useQuotationSync.ts`, extract TWC fields from `measurements_details` when building parent items:
- Extract `twc_item_number` from summary.measurements_details
- Add to parentItem object so it flows to `useQuoteItems.saveItems()`

### Step 3: Map Your Options to TWC API

In `TWCSubmitDialog.tsx`, add mapping layer:
- Your `control_type` → TWC's "Control Type"
- Your `fixing` → TWC's "Fixing"
- Your `chain_side` → TWC's "Cont Side"

This ensures your option selections are correctly formatted for TWC order submission.

## What This Preserves

- All pricing and markup calculations - unchanged
- Rules engine - continues working with your options
- Settings toggles - enable/disable options as before
- Non-TWC clients - zero impact
- Supplier detection - works via silent twc_item_number storage

## Expected Outcome

1. Select TWC template → only YOUR options appear (no blue card)
2. Configure using your dropdowns with rules working
3. Save quote → twc_item_number stored for supplier detection
4. Supplier Ordering → TWC detected correctly
5. Submit order → your selections mapped to TWC API format

