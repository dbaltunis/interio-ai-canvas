

## Fix Supplier Ordering: Complete Root Cause Analysis and Fix

### What is Actually Broken (Database Proof)

The Supplier Ordering dropdown shows "No products" because **quote_items for this project are completely empty** (0 rows). The quote sync is crashing every time it runs.

**Console error (visible in logs):**
```
Error saving quote items: foreign key constraint "quote_items_inventory_item_id_fkey"
Key is not present in table "enhanced_inventory_items"
```

**Root cause chain:**

```text
windows_summary has fabric_details.id / material_details.id
  -> Some IDs (d2ed3c0b, af6eed75) do NOT exist in enhanced_inventory_items
  -> useQuotationSync passes these as inventory_item_id on quote_items
  -> FK constraint rejects the insert
  -> ENTIRE batch insert fails
  -> quote_items = 0 rows
  -> useProjectSuppliers has nothing to scan
  -> "No products detected"
```

This is NOT a detection logic problem. The quote items literally do not exist because the save crashes.

### Three Fixes Required

#### Fix 1: Validate `inventory_item_id` Before Insert (Critical)

**File: `src/hooks/useQuotationSync.ts` (~line 1101)**

Before assigning `inventory_item_id`, verify the ID actually exists in `enhanced_inventory_items`. Since we cannot do a lookup for every item during save, the safest fix is:

- Set `inventory_item_id` to `null` if the value is not confirmed valid
- Store the raw ID in `product_details.inventory_item_id` (JSONB, no FK constraint) for detection purposes
- Only set the actual column when the ID is verified

Concrete change:
```typescript
// Line 1101 - change from:
inventory_item_id: inventoryItemId,
// to:
inventory_item_id: null,  // Don't risk FK crash - use product_details instead
```

And ensure line 1119 captures vendor_id from children:
```typescript
vendor_id: (() => {
  // Extract vendor_id from children's data
  const children = item.children || [];
  for (const child of children) {
    if (child.vendor_id) return child.vendor_id;
  }
  // Fallback to item-level vendor_id
  return item.vendor_id || null;
})(),
inventory_item_id: inventoryItemId || null,  // Store in JSONB (no FK)
```

#### Fix 2: Also Fix `useQuoteItems.ts`

**File: `src/hooks/useQuoteItems.ts`**

This file also inserts quote_items but does NOT set `inventory_item_id` at all. It should also store `vendor_id` in `product_details` for consistency:

```typescript
product_details: {
  // ... existing fields ...
  vendor_id: item.vendor_id || item.product_details?.vendor_id || null,
  inventory_item_id: item.inventory_item_id || item.product_details?.inventory_item_id || null,
},
```

#### Fix 3: Update Detection to Use JSONB `product_details.inventory_item_id`

**File: `src/hooks/useProjectSuppliers.ts`**

The detection already checks `product_details.vendor_id` (the fallback we added). But we should also check `product_details.inventory_item_id` for the inventory lookup path:

```typescript
// Line 139 - also check product_details for inventory_item_id
const effectiveInventoryItemId = item.inventory_item_id || productDetails?.inventory_item_id;
if (effectiveInventoryItemId) {
  const inventoryItem = inventoryWithVendors.find(
    (inv) => inv.id === effectiveInventoryItemId
  );
  // ... existing vendor detection ...
}
```

And update the `inventoryItemIds` extraction (line 52-56) to also pull from product_details:

```typescript
const inventoryItemIds = useMemo(() => {
  return quoteItems
    .map((item) => item.inventory_item_id || (item.product_details as any)?.inventory_item_id)
    .filter(Boolean);
}, [quoteItems]);
```

#### Fix 4: Backfill with Direct SQL (run once)

Run a direct UPDATE to populate `product_details.vendor_id` on existing quote_items by looking up from `windows_summary` and `enhanced_inventory_items`:

```sql
-- For each quote_item, find the vendor from its project's windows
UPDATE quote_items qi
SET product_details = jsonb_set(
  COALESCE(qi.product_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM quotes q
JOIN surfaces s ON s.project_id = q.project_id
JOIN windows_summary ws ON ws.window_id = s.id
JOIN enhanced_inventory_items eii ON eii.id = COALESCE(ws.selected_fabric_id, ws.selected_material_id)
WHERE qi.quote_id = q.id
  AND eii.vendor_id IS NOT NULL
  AND (qi.product_details->>'vendor_id') IS NULL;
```

Also backfill `windows_summary` vendor_id using `fabric_details.id` and `material_details.id` (not just `selected_fabric_id`):

```sql
-- Backfill using fabric_details->>'id' 
UPDATE windows_summary ws
SET fabric_details = jsonb_set(
  ws.fabric_details::jsonb,
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE (ws.fabric_details->>'id')::uuid = eii.id
  AND eii.vendor_id IS NOT NULL
  AND ws.fabric_details IS NOT NULL
  AND (ws.fabric_details->>'vendor_id') IS NULL;

-- Same for material_details->>'id'
UPDATE windows_summary ws
SET material_details = jsonb_set(
  ws.material_details::jsonb,
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE (ws.material_details->>'id')::uuid = eii.id
  AND eii.vendor_id IS NOT NULL
  AND ws.material_details IS NOT NULL
  AND (ws.material_details->>'vendor_id') IS NULL;
```

### Why Previous Fixes Did Not Work

1. **Previous backfill** joined on `selected_fabric_id` / `selected_material_id` only -- but most windows_summary rows have those as NULL while having the ID inside `fabric_details->>'id'` or `material_details->>'id'`
2. **Code changes to useQuotationSync** correctly added `inventory_item_id` -- but this CAUSED the FK crash because some IDs (collections, deleted items) don't exist in `enhanced_inventory_items`
3. The FK crash means quote_items are **never saved**, so detection has nothing to detect

### Files to Change

| File | Change |
|---|---|
| `useQuotationSync.ts` | Stop setting `inventory_item_id` column directly; store in `product_details` JSONB instead; extract `vendor_id` from children |
| `useQuoteItems.ts` | Add `vendor_id` and `inventory_item_id` to `product_details` JSONB |
| `useProjectSuppliers.ts` | Read `inventory_item_id` and `vendor_id` from `product_details` JSONB as well as columns |
| SQL (run once) | Backfill `vendor_id` using `fabric_details->>'id'` and `material_details->>'id'` join paths |

### After the Fix

- Quote items will save successfully (no more FK crash)
- Supplier ordering will detect vendors from `product_details.vendor_id`
- Existing jobs get backfilled via SQL
- TWC ordering and email ordering both activate once products are detected
- No re-saving of existing windows required

