

# Fix TWC Supplier Detection - Complete Data Flow

## Root Cause Summary
The Supplier Ordering dropdown shows "No supplier products detected" because:
1. `useQuotes` hook doesn't fetch `quote_items` - the array is always empty
2. Even if it did, `twc_item_number` is not being saved to `quote_items.product_details`

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useQuotes.ts` | Add `quote_items(*)` to the select query |
| `src/hooks/useQuotationSync.ts` | Verify TWC fields extraction from measurements_details |
| `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx` | Ensure `twc_item_number` is stored in measurements state |

## Implementation Details

### Step 1: Fix useQuotes to Include quote_items

In `src/hooks/useQuotes.ts` (lines 24-44), add `quote_items` to the select:

```typescript
let query = supabase
  .from("quotes")
  .select(`
    *,
    quote_items(*),
    clients (id, name, email),
    projects (id, name, status, client_id, clients (id, name, email))
  `);
```

This ensures `SupplierOrderingDropdown` receives actual quote items data.

### Step 2: Verify TWC Item Number Detection

In `DynamicRollerBlindFields.tsx`, the `twc_item_number` detection logic must call `onChange('twc_item_number', value)` when a TWC-linked template is selected. This value must flow to `measurements_details` in `windows_summary`.

### Step 3: Verify useQuotationSync Extraction

In `useQuotationSync.ts` (lines 288-333), the extraction is already in place:
```typescript
const twcItemNumber = measurementsDetails.twc_item_number || summary.twc_item_number || null;
```

The fix is ensuring this value exists in `measurementsDetails` from the saved summary.

## Expected Outcome

After implementation:
1. `useQuotes` returns quotes WITH `quote_items` array populated
2. `SupplierOrderingDropdown` receives actual quote items
3. `useProjectSuppliers` finds `twc_item_number` in `product_details`
4. TWC products are detected and shown in the dropdown

## Additional Fix: Options Not Displaying Initially (Issue #3)

The options not displaying when first creating a treatment is likely a separate UI state issue where the selected options aren't being rendered until after save/reload. This may require checking the `CostCalculationSummary` component and ensuring it reads from the current measurement state rather than only from saved data.

