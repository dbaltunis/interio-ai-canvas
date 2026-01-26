

# Fix TWC Supplier Detection - Complete Data Flow Fix

## Root Cause Identified

The TWC item number IS correctly saved to `windows_summary.measurements_details.twc_item_number` (value: 245), but the mapping logic in `useQuotationSync.ts` at **lines 988-996** does NOT include the TWC-specific fields when building `product_details` for the database insert.

### Data Flow Proof

| Location | twc_item_number |
|----------|-----------------|
| `enhanced_inventory_items.metadata` | 245 ✅ |
| `windows_summary.measurements_details` | 245 ✅ |
| `parentItem` object (line 321) | 245 ✅ |
| `itemsToSave.product_details` (line 988) | **MISSING** ❌ |
| `quote_items.product_details` in database | NULL ❌ |

### The Bug (useQuotationSync.ts lines 988-996)

```typescript
product_details: {
  room_id: item.room_id,
  room_name: item.room_name,
  surface_name: item.surface_name,
  treatment_type: item.treatment_type,
  image_url: item.image_url,
  hasChildren: item.hasChildren || false,
  children: item.children || [],
  // ❌ MISSING: TWC-specific fields are NOT being mapped!
},
```

## Solution

### File to Modify
`src/hooks/useQuotationSync.ts` (lines 988-996)

### Required Changes
Add the missing TWC fields to the `product_details` object:

```typescript
product_details: {
  room_id: item.room_id,
  room_name: item.room_name,
  surface_name: item.surface_name,
  treatment_type: item.treatment_type,
  image_url: item.image_url,
  hasChildren: item.hasChildren || false,
  children: item.children || [],
  // TWC-specific fields for supplier ordering detection
  twc_item_number: item.twc_item_number,
  twc_selected_colour: item.twc_selected_colour,
  twc_selected_material: item.twc_selected_material,
  twc_custom_fields: item.twc_custom_fields || [],
  selected_options: item.selected_options || [],
  // Measurements for order submission
  measurements: item.measurements,
},
```

## Expected Outcome After Fix

1. `quote_items.product_details.twc_item_number` will be `245` (or applicable TWC ID)
2. `useProjectSuppliers` hook will detect TWC products via `productDetails.twc_item_number`
3. `SupplierOrderingDropdown` will show "TWC" as a detected supplier with item count
4. TWC orders can be submitted through the dropdown

## Technical Flow Summary

```text
Template (Pure Wood 50mm) 
  → linked to inventory_item_id (c16efca1-6599-4900-af08-e62df4c97c64)
  → which has metadata.twc_item_number = 245

When user selects treatment:
  DynamicRollerBlindFields → onChange('twc_item_number', 245)
  → Saved to windows_summary.measurements_details.twc_item_number

When quote syncs:
  buildQuotationItems → parentItem.twc_item_number = 245 ✅
  → itemsToSave mapping DROPS the field ❌ (BUG)
  → quote_items.product_details.twc_item_number = NULL

After fix:
  → itemsToSave includes twc_item_number ✅
  → quote_items.product_details.twc_item_number = 245 ✅
  → useProjectSuppliers detects TWC products ✅
  → Supplier dropdown shows TWC ✅
```

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useQuotationSync.ts` | Add 6 missing TWC fields to `itemsToSave.product_details` mapping (lines 988-996) |

