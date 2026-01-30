

# Testing Findings & Fix Plan - Fabric Library Display Issues

## Issues Identified from Your Screenshots

### Issue 1: Confusing Pricing Display 🔴
**Problem:** Cards show **BOTH** a green "✓ Grid: X" badge AND a yellow "⚠️ No pricing grid for Group X" warning simultaneously.

**Screenshot evidence:**
- Cards like "Curtains - AESOP" show "✓ Grid: 6" badge at bottom of image
- Same card also shows "Grid Pricing" label + "⚠️ No pricing grid for Group 6" warning below

**Root Cause:** Logic conflict in `InventorySelectionPanel.tsx`:
```typescript
// Line 670: Shows green badge if price_group exists
{(item.price_group || item.pricing_grid_id || ...) && (
  <Badge className="bg-success">✓ Grid: {item.price_group}</Badge>
)}

// Line 759: Shows warning if price_group exists BUT no resolved_grid_id
{item.price_group && !item.resolved_grid_id && !item.pricing_grid_id && (
  <span>⚠️ No pricing grid for Group {item.price_group}</span>
)}
```

**The contradiction:** Both conditions are true simultaneously because:
1. `price_group` exists → green badge shows
2. `resolved_grid_id` is null (enrichment hasn't happened yet) → warning shows

---

### Issue 2: Color Dropdown in Measurements Shows Multiple Colors
**Problem:** When you select a fabric and go to Measurements, the color dropdown shows many colors (CHALK, FROST, ASPHALT, VANILLA, JASPER, DRIFTWOOD, TAUPE, BLUESTONE...)

**Root Cause:** The `getColorsFromItem()` function in `VisualMeasurementSheet.tsx` correctly extracts colors from TWC metadata. Each TWC fabric has multiple color options because TWC products come in many colors.

**This is actually CORRECT behavior!** TWC fabrics like "Curtains - AMANDA" come in multiple colors (COCOA, ECRU, GLACIER, GREY, MERCURY, PARCHMENT, SAND, WHITE). The user picks the specific color for the customer's order.

However, the issue is that `tags` array contains BOTH colors AND non-color tags like "wide_width", "DISCONTINUED". The `filterColorTags` function should filter these out but may be missing some entries.

---

### Issue 3: Multiple Same Fabric with Different Color Options
**Your observation:** "Multiple same fabric different colour options which is fine because TWC adds SKU number"

**Clarification:** This is **NOT** what's happening. TWC stores ONE inventory record per product (e.g., "Curtains - AMANDA") with ALL colors stored in the `tags` array and `metadata.twc_fabrics_and_colours`. You're seeing different PRODUCTS (AESOP, ALLUSION, AMANDA, AMAZON) - not the same fabric with different colors.

---

## Technical Root Cause Analysis

### Database State
From database query, fabrics have:
```json
{
  "name": "Curtains - AMANDA",
  "price_group": "2",
  "pricing_grid_id": null,    // ← Not assigned directly
  "pricing_method": "pricing_grid",
  "tags": ["COCOA", "ECRU", "GLACIER", "GREY", "wide_width", "DISCONTINUED"],
  "color": null               // ← Primary color not set
}
```

### Pricing Grid State
Grids exist for Groups 1, 2, 3, 4, 5, 6, BUDGET for product_type="curtains".

**Problem:** The inventory panel doesn't know if a matching grid EXISTS until enrichment happens (when fabric is selected for a quote). The check `!item.resolved_grid_id` is always true at display time.

---

## Fix Implementation Plan

### Fix 1: Remove Contradictory Warning in Library Panel
**Logic change:** If `price_group` exists, show ONLY the green badge. The warning should only appear AFTER enrichment fails (in the measurements step, not in the library selection).

**File:** `src/components/inventory/InventorySelectionPanel.tsx`
**Change:** Remove the warning from the card display OR change the logic to pre-check if a grid exists.

```typescript
// Option A: Remove warning entirely from card (simplest)
// Delete lines 758-763

// Option B: Pre-check grid existence (better UX but more complex)
// Add a hook to fetch available pricing grids and check if 
// a grid with matching price_group + product_type exists
```

### Fix 2: Cleaner Label Instead of "Grid Pricing" + Number
**Current (confusing):**
```
Grid Pricing
6
⚠️ No pricing grid for Group 6
```

**Proposed (clean):**
```
Group 6
per pricing grid
```
OR if no grid exists:
```
Group 6 ⚠️
pricing grid required
```

**File:** `src/components/inventory/InventorySelectionPanel.tsx`
**Changes:**
1. Line 721: Change "Grid Pricing" to show `Group {item.price_group}`
2. Line 729: Change second line to "per pricing grid"
3. The green badge already shows the group number, so no duplication needed

### Fix 3: Pre-Validate Grid Existence (Optional Enhancement)
Create a hook that pre-fetches pricing grids for the treatment category and checks if matching grids exist:

**New hook:** `useAvailableGrids(productType: string)`
**Returns:** Map of available price groups → grid names

This would allow the UI to show:
- ✅ Green badge with "Group 2" if grid exists
- ⚠️ Yellow badge with "Group 2 - Grid missing" if no matching grid

### Fix 4: Color Dropdown Refinement (Minor)
Add more non-color tags to the filter list:

**File:** `src/components/measurements/VisualMeasurementSheet.tsx`
**Line 962-967:** Add to `NON_COLOR_TAGS`:
```typescript
const NON_COLOR_TAGS = [
  'wide_width', 'blockout', 'sunscreen', 'sheer', 'light_filtering', 
  'dimout', 'thermal', 'to confirm', 'discontinued', 'imported', 
  'twc', 'fabric', 'material', 'roller', 'venetian', 'vertical',
  'cellular', 'roman', 'curtain', 'awning', 'panel',
  // NEW additions:
  'lf', 'lf twill', 'lf twill lf', 'standard'
];
```

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/components/inventory/InventorySelectionPanel.tsx` | Remove duplicate warning, clean up price display | 🔴 High |
| `src/components/measurements/VisualMeasurementSheet.tsx` | Expand NON_COLOR_TAGS list | 🟡 Medium |

---

## Summary of What Needs to Happen

1. **Remove the "⚠️ No pricing grid" warning from the Library selection cards** - This warning should only appear AFTER a fabric is selected and enrichment fails, not as a preemptive warning that confuses users.

2. **Clean up the pricing display** - Instead of showing "Grid Pricing" + "6" underneath, show "Group 6" with "per grid" subtext.

3. **Keep the green "✓ Grid" badge** - This indicates the fabric uses grid-based pricing.

4. **The color dropdown is working correctly** - TWC fabrics have multiple colors by design. The dropdown lets users pick the specific color for the order.

---

## Testing After Fix

1. Navigate to Library → Fabric selection
2. Verify cards show ONLY the green "✓ Grid: X" badge (no yellow warning)
3. Verify price area shows "Group X" not "Grid Pricing"
4. Select a fabric, proceed to Measurements
5. Verify color dropdown shows only color names (no "wide_width", "DISCONTINUED", etc.)

