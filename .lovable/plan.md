
# Complete Fix: Add Missing `cost_price` to Saved Fabric Details

## Root Cause Confirmed

The `pricePerMeter` fix was applied correctly (prioritizing `cost_price`), BUT when treatments are saved to the database, the `cost_price` field is **NOT being included** in the `fabric_details` JSONB.

### Evidence from Database

**Inventory Item (LELIN 231)**:
| Field | Value |
|-------|-------|
| cost_price | 440 ✅ |
| selling_price | 924 ✅ |

**Saved workshop_items.fabric_details**:
```json
{
  "name": "LELIN 231",
  "selling_price": 924,
  "cost_price": /* MISSING! */
}
```

When the treatment is reloaded, `selectedFabricItem.cost_price` is `undefined` (not saved), so the code falls back to `selling_price: 924`.

---

## Files to Modify

### File 1: `src/components/measurements/DynamicWindowWorksheet.tsx`

**Location 1: Lines 2123-2139** (fabric_details in summaryData)

Add `cost_price` to the saved fabric details:

```typescript
fabric_details: selectedItems.fabric ? {
  id: selectedItems.fabric.id,
  name: selectedItems.fabric.name,
  fabric_width: selectedItems.fabric.fabric_width || selectedItems.fabric.wallpaper_roll_width || 140,
  cost_price: selectedItems.fabric.cost_price,  // ✅ ADD THIS
  selling_price: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price,
  category: selectedItems.fabric.category,
  image_url: selectedItems.fabric.image_url,
  color: measurements.selected_color || selectedItems.fabric.tags?.[0] || selectedItems.fabric.color || null,
  pricing_grid_data: selectedItems.fabric.pricing_grid_data,
  resolved_grid_name: selectedItems.fabric.resolved_grid_name,
  resolved_grid_code: selectedItems.fabric.resolved_grid_code,
  resolved_grid_id: selectedItems.fabric.resolved_grid_id,
  price_group: selectedItems.fabric.price_group,
  product_category: selectedItems.fabric.product_category
} : null,
```

**Location 2: Lines 2409-2422** (fabric_details in treatmentData)

Add `cost_price` to the treatment record:

```typescript
fabric_details: selectedItems.fabric ? {
  id: selectedItems.fabric.id,
  fabric_id: selectedItems.fabric.id,
  name: selectedItems.fabric.name,
  fabric_width: selectedItems.fabric.fabric_width,
  cost_price: selectedItems.fabric.cost_price,  // ✅ ADD THIS
  selling_price: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price,
  pricing_grid_data: selectedItems.fabric.pricing_grid_data,
  resolved_grid_name: selectedItems.fabric.resolved_grid_name,
  resolved_grid_code: selectedItems.fabric.resolved_grid_code,
  resolved_grid_id: selectedItems.fabric.resolved_grid_id,
  price_group: selectedItems.fabric.price_group,
  product_category: selectedItems.fabric.product_category
} : null,
```

---

## Why This Is Required

The flow is:
1. User selects fabric from inventory (has `cost_price: 440`)
2. Treatment is saved to `windows_summary` and `workshop_items`
3. **If `cost_price` isn't saved**, it's lost forever
4. When treatment is loaded, only `selling_price: 924` is available
5. The `pricePerMeter` fix tries `cost_price` first → gets `undefined`
6. Falls back to `selling_price: 924` → wrong price displayed

---

## Testing Required After Fix

### New Treatments
1. Create new project with curtain treatment
2. Select fabric that has both `cost_price` and `selling_price`
3. Verify Cost column shows `cost_price × meters` (not selling_price)
4. Verify Sell column shows `cost × (1 + implied_markup%)`

### Existing Treatments
Existing treatments saved before this fix will NOT have `cost_price` in their `fabric_details`. They will continue to use `selling_price` until:
- The user opens and re-saves the treatment (which will now include `cost_price`)
- OR a migration script updates existing records

---

## Impact Assessment

| Scenario | Impact |
|----------|--------|
| New treatments | Will work correctly after fix |
| Existing treatments | Will need re-save to update |
| Other accounts | No negative impact - only adds data |
| Markup settings | Already fixed - 0% respected |

---

## Code Changes Summary

| File | Lines | Change |
|------|-------|--------|
| DynamicWindowWorksheet.tsx | 2127 | Add `cost_price: selectedItems.fabric.cost_price,` |
| DynamicWindowWorksheet.tsx | 2414 | Add `cost_price: selectedItems.fabric.cost_price,` |
