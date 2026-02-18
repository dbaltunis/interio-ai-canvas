

## Fix Supplier Ordering Product Detection + Backfill Existing Jobs

### Problem Summary

Products are not showing in the Supplier Ordering dropdown because `vendor_id` is never saved to `windows_summary` or `quote_items`. The detection system (`useProjectSuppliers`) relies on `inventory_item_id` on quote_items to look up vendor info, but that field is also null.

**Database proof:**
- 944 of 960 windows_summary records have NO `vendor_id` in fabric/material details
- All quote_items in the current job have `inventory_item_id: null` and `vendor_id: null`
- The inventory items themselves DO have `vendor_id` (e.g., "Curtains - ALLUSION" has `vendor_id: d6775560` pointing to TWC)

### Three-Part Fix

#### Part 1: Save `vendor_id` Going Forward

**File: `DynamicWindowWorksheet.tsx` (lines 2342-2398)**

Add `vendor_id` and `inventory_item_id` to both `fabric_details` and `material_details` when saving:

```typescript
fabric_details: selectedItems.fabric ? {
  // ... existing fields ...
  vendor_id: selectedItems.fabric.vendor_id || null,
  inventory_item_id: selectedItems.fabric.id,
} : null,

material_details: selectedItems.material ? {
  // ... existing fields ...
  vendor_id: selectedItems.material.vendor_id || null,
  inventory_item_id: selectedItems.material.id,
} : null,
```

**File: `useQuotationSync.ts` (lines 402-414 and 1088-1110)**

Pass `inventory_item_id` and `vendor_id` through structured breakdown children and into quote_items:

```typescript
// In structured breakdown children (line 402):
inventory_item_id: item.category === 'fabric'
  ? (materialDetails?.inventory_item_id || materialDetails?.id || fabricDetails?.id || null)
  : null,

// In quote_items save (line 1096):
product_details: {
  // ... existing fields ...
  vendor_id: materialDetails?.vendor_id || fabricDetails?.vendor_id || null,
},
inventory_item_id: inventoryItemId || materialDetails?.id || fabricDetails?.id || null,
```

#### Part 2: Backfill Existing Data (No Re-save Needed)

**New SQL migration** to populate `vendor_id` in existing windows_summary records by joining `selected_fabric_id` and `selected_material_id` to `enhanced_inventory_items`:

```sql
-- Backfill fabric_details.vendor_id from inventory
UPDATE windows_summary ws
SET fabric_details = jsonb_set(
  COALESCE(ws.fabric_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE ws.selected_fabric_id = eii.id
  AND eii.vendor_id IS NOT NULL
  AND (ws.fabric_details->>'vendor_id') IS NULL;

-- Same for material_details
UPDATE windows_summary ws
SET material_details = jsonb_set(
  COALESCE(ws.material_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE ws.selected_material_id = eii.id
  AND eii.vendor_id IS NOT NULL
  AND (ws.material_details->>'vendor_id') IS NULL;
```

**Also backfill quote_items** to populate `inventory_item_id` from windows_summary:

```sql
-- Backfill quote_items.inventory_item_id from windows_summary fabric/material IDs
UPDATE quote_items qi
SET inventory_item_id = COALESCE(
  ws.selected_fabric_id,
  ws.selected_material_id
)
FROM windows_summary ws
JOIN treatments t ON ws.window_id = t.window_id
JOIN quotes q ON qi.quote_id = q.id AND q.project_id = t.project_id
WHERE qi.inventory_item_id IS NULL
  AND qi.name = t.product_name
  AND (ws.selected_fabric_id IS NOT NULL OR ws.selected_material_id IS NOT NULL);
```

#### Part 3: Enhanced Detection (Belt and Suspenders)

**File: `useProjectSuppliers.ts` (lines 99-166)**

Add a fallback detection path that checks `product_details.vendor_id` directly when `inventory_item_id` lookup fails:

```typescript
quoteItems.forEach((item) => {
  // ... existing TWC detection (unchanged) ...

  // Existing path: inventory_item_id lookup
  if (item.inventory_item_id) { /* ... existing code ... */ }

  // NEW fallback: check product_details.vendor_id directly
  const directVendorId = productDetails?.vendor_id;
  if (directVendorId && !supplierMap.has(directVendorId)) {
    const vendorInfo = allSettingsVendors.find(v => v.id === directVendorId);
    if (vendorInfo) {
      supplierMap.set(directVendorId, {
        id: directVendorId,
        name: vendorInfo.name,
        type: 'vendor',
        items: [{ id: item.id, name: item.name, quantity: item.quantity || 1 }],
        isOrdered: false,
      });
    }
  }
});
```

Also pass `allSettingsVendors` into the suppliers detection memo so it can resolve vendor names without a separate DB lookup.

### TWC Ordering Status

The TWC ordering flow (TWCSubmitDialog) is functional -- it maps options, submits via the `twc-submit-order` edge function, and tracks status in `supplier_orders`. The client's inability to order was caused by the same root issue: products weren't being detected because of the missing `vendor_id`/`inventory_item_id` linkage, so the "Send Order" button never activated.

Once the backfill runs and the detection fix is deployed, TWC ordering will work for existing jobs without re-saving.

### Email Ordering for Other Suppliers

Email ordering for non-TWC vendors is already implemented in `SupplierOrderingDropdown.tsx` (lines 209-244). When a vendor-type supplier is selected, it:
1. Records the order in `supplier_orders` JSONB on the quote
2. Opens the user's email client with a pre-filled purchase order (items list, quantities, project ref)
3. Uses the vendor's email from Settings

This will also start working once products are correctly detected.

### Files to Change

| File | Change |
|---|---|
| `DynamicWindowWorksheet.tsx` | Add `vendor_id` and `inventory_item_id` to fabric_details and material_details save |
| `useQuotationSync.ts` | Pass `inventory_item_id` through children + save `vendor_id` in product_details |
| `useProjectSuppliers.ts` | Add fallback detection via `product_details.vendor_id` |
| SQL Migration | Backfill existing windows_summary and quote_items with vendor data |

### After the Fix

- Existing jobs: backfill populates vendor links -- products appear in Supplier Ordering immediately
- New jobs: vendor data is saved automatically during worksheet save
- TWC ordering: works for TWC-linked products (when integration is in production mode)
- Email ordering: works for all other vendors with email configured in Settings
- No re-saving of existing windows required
