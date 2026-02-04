
# Fix Pricing Grid Data Persistence for Awnings & SmartDrapes

## Problem Summary

Greg Shave's (CCCO) awning and SmartDrape windows show **$0 pricing** because critical fields are missing when saving to `windows_summary`:

| Field | Status | Impact |
|-------|--------|--------|
| `subcategory` in fabric_details | ❌ MISSING | Awning fabrics can't map to `awning` grids |
| `subcategory` in material_details | ❌ MISSING | SmartDrape materials lose `vertical_fabric` mapping |

## Evidence from Database

**Awning Window (`08e3a515-...`):**
```json
{
  "fabric_details": {
    "name": "Auto - DAYSCREEN 95",
    "price_group": "Auto-Budget",
    "product_category": null  // ← Missing subcategory to identify as awning
  },
  "total_cost": 0,
  "total_selling": 0
}
```

**Source Item Has Correct Data:**
```json
{
  "name": "Auto - DAYSCREEN 95",
  "subcategory": "awning_fabric",  // ← This is NOT saved!
  "price_group": "Auto-Budget"
}
```

## Solution

### Fix 1: Add `subcategory` to fabric_details (autoSave)

**File:** `src/components/measurements/DynamicWindowWorksheet.tsx`  
**Lines:** 2190-2207

Add the missing `subcategory` field:

```typescript
fabric_details: selectedItems.fabric ? {
  id: selectedItems.fabric.id,
  name: selectedItems.fabric.name,
  fabric_width: selectedItems.fabric.fabric_width ?? selectedItems.fabric.wallpaper_roll_width ?? null,
  cost_price: selectedItems.fabric.cost_price,
  selling_price: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price,
  category: selectedItems.fabric.category,
  subcategory: selectedItems.fabric.subcategory,  // ← ADD THIS
  image_url: selectedItems.fabric.image_url,
  // ... rest unchanged
} : null,
```

### Fix 2: Add `subcategory` to material_details (autoSave)

**File:** `src/components/measurements/DynamicWindowWorksheet.tsx`  
**Lines:** 2219-2232

Add the missing `subcategory` field:

```typescript
material_details: selectedItems.material ? {
  id: selectedItems.material.id,
  name: selectedItems.material.name,
  selling_price: selectedItems.material.selling_price || selectedItems.material.unit_price,
  image_url: selectedItems.material.image_url,
  color: measurements.selected_color || selectedItems.material.tags?.[0] || selectedItems.material.color || null,
  subcategory: selectedItems.material.subcategory,  // ← ADD THIS
  // ... rest unchanged
} : null,
```

### Fix 3: Add `subcategory` to fabric_details (handleItemSelect)

**File:** `src/components/measurements/DynamicWindowWorksheet.tsx`  
**Lines:** 2674-2688

```typescript
fabric_details: {
  id: item.id,
  fabric_id: item.id,
  name: item.name,
  fabric_type: item.name,
  fabric_width: item.fabric_width || item.wallpaper_roll_width,
  selling_price: item.selling_price || item.unit_price,
  cost_price: item.cost_price,  // ← Also add cost_price for consistency
  category: item.category,
  subcategory: item.subcategory,  // ← ADD THIS
  image_url: item.image_url,
  // ... rest unchanged
}
```

---

## Why This Fixes the Issue

The `useFabricEnrichment` hook (lines 44-65) maps `subcategory` to `productTypeForGrid`:

```typescript
if (subcategory.includes('awning')) {
  productTypeForGrid = 'awning';
} else if (subcategory.includes('vertical') || subcategory.includes('smartdrape')) {
  productTypeForGrid = 'vertical_blinds';
}
```

Without `subcategory` in the persisted data, the grid auto-matcher receives incorrect product type and fails to find matching grids.

---

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/components/measurements/DynamicWindowWorksheet.tsx` | 2196 | Add `subcategory` to fabric_details in autoSave |
| `src/components/measurements/DynamicWindowWorksheet.tsx` | 2219-2232 | Add `subcategory` to material_details in autoSave |
| `src/components/measurements/DynamicWindowWorksheet.tsx` | 2674-2688 | Add `subcategory` and `cost_price` to fabric_details in handleItemSelect |

---

## Expected Outcome

After this fix:

1. **New windows:** Awning and SmartDrape windows will calculate prices correctly and persist them
2. **Existing windows:** Need to be re-saved (open worksheet → save) to populate the missing subcategory
3. **Room/Quote display:** Will show correct prices instead of $0

---

## Note on SmartDrape Template Issue

The SmartDrape template has `pricing_grid_data: {}` (empty) and `price_group: null`. This means:
- Users must select a **specific SmartDrape material** from the library (like "Lakeshore Stripe LF")
- The template alone won't provide pricing without a material selection with a valid `price_group`

This is expected behavior - the template defines the treatment type, but materials with price groups drive the grid pricing.
