# Inventory Category & Subcategory Guide

## How Inventory Filtering Works

When a user selects a treatment template (e.g., "Honeycomb Blind"), the inventory panel automatically filters products by matching the product's **category** and **subcategory** fields to the treatment type.

## Critical Rules

1. **Category**: Must be either `fabric`, `material`, or `hardware`
2. **Subcategory**: Must match one of the expected values for that treatment type (see table below)
3. **Both fields must be set correctly** for products to appear in the inventory panel
4. **Vertical Blinds Special Case**: 
   - Vertical blind **FABRICS** use: `category: 'fabric'` + `subcategory: 'vertical_fabric'`
   - Vertical blind **MATERIALS** (slats) use: `category: 'material'` + `subcategory: 'vertical_slats'` OR `'vertical_vanes'` OR `'vertical'`
   - Do NOT mix these - fabric products must be in fabric category, material products in material category

## Treatment Type → Subcategory Mapping

| Treatment Type | Category | Accepted Subcategories | Notes |
|---------------|----------|----------------------|-------|
| **Curtains** | `fabric` | `curtain_fabric` | Standard curtain fabrics |
| **Roman Blinds** | `fabric` | `curtain_fabric` | Uses same fabrics as curtains |
| **Roller Blinds** | `fabric` | `roller_fabric`, `roller_blind_fabric` | Both naming variations accepted |
| **Cellular/Honeycomb Blinds** | `fabric` | `cellular`, `cellular_fabric`, `honeycomb`, `honeycomb_fabric` | All variations accepted |
| **Panel Glide** | `fabric` | `panel_glide_fabric`, `panel_fabric`, `curtain_fabric` | Can use panel or curtain fabrics |
| **Venetian Blinds** | `material` | `venetian_slats`, `wood_slats`, `aluminum_slats`, `venetian` | Slat materials |
| **Vertical Blind Fabrics** | `fabric` | `vertical_fabric` | Fabric vanes for vertical blinds |
| **Vertical Blind Materials** | `material` | `vertical_slats`, `vertical_vanes`, `vertical` | Material slats/vanes for vertical blinds |
| **Shutters** | `material` | `shutter_material`, `shutter_panels`, `shutter` | Panel materials |
| **Wallpaper** | `fabric` | `wallcovering` | Uses fabric category for wallpaper |

## How to Prevent Mismatches

### When Creating Products in Library:

1. **Use the correct tab**: Create products under the appropriate fabric subcategory tab (Cellular/Honeycomb, Roller Blind Fabrics, etc.)
2. **Set subcategory manually**: When adding products, ensure the subcategory field matches one of the accepted values from the table above
3. **Use consistent naming**: Stick to one subcategory name (e.g., always use `cellular` not mixing `cellular`, `cellular_fabric`, `honeycomb`)

### When Products Don't Show:

1. **Check the database**: Run this query to see what category/subcategory the product has:
   ```sql
   SELECT name, category, subcategory FROM enhanced_inventory_items WHERE name ILIKE '%product_name%'
   ```

2. **Compare with mapping table**: Check if the subcategory matches one of the accepted values for that treatment type

3. **Update if needed**: Either:
   - Update the product's subcategory to match an accepted value, OR
   - Add the product's subcategory to the filtering logic in `useTreatmentSpecificFabrics.ts`

## Code Locations

- **Treatment configs**: `src/utils/treatmentTypeDetection.ts` - defines `inventoryCategory` for each treatment
- **Subcategory constants**: `src/constants/inventorySubcategories.ts` - **SINGLE SOURCE OF TRUTH** for all subcategory groupings
- **Fabric filtering**: `src/hooks/useTreatmentSpecificFabrics.ts` - uses `getAcceptedSubcategories()`
- **Material filtering**: `src/components/inventory/InventorySelectionPanel.tsx` - uses the hook above
- **Library tabs**: `src/components/inventory/MaterialInventoryView.tsx` - uses `matchesSubcategoryGroup()`
- **Worksheet selector**: `src/components/fabric/FabricSelector.tsx` - filters by treatment type

## CRITICAL: Using Subcategory Groups

**ALWAYS use the centralized helpers** from `src/constants/inventorySubcategories.ts`:

```typescript
// For Library tab filtering (shows ALL related subcategories):
import { matchesSubcategoryGroup, LIBRARY_SUBCATEGORY_GROUPS } from '@/constants/inventorySubcategories';

const matchesCategory = activeCategory === "all" || 
  (LIBRARY_SUBCATEGORY_GROUPS[activeCategory]
    ? matchesSubcategoryGroup(item.subcategory, activeCategory)
    : item.subcategory === activeCategory);

// For worksheet filtering (by treatment type):
import { getAcceptedSubcategories } from '@/constants/inventorySubcategories';

const acceptedSubcategories = getAcceptedSubcategories('vertical_blinds');
// Returns: ['vertical_fabric', 'vertical_slats', 'vertical_vanes', 'vertical', 'blind_material']
```

**NEVER hardcode subcategory strings** in filter logic. This prevents items from "disappearing" due to exact-match filtering.

## Example Fix

If you create a cellular blind fabric but it doesn't show:

1. Check database: `SELECT * FROM enhanced_inventory_items WHERE name = 'My Cellular Fabric'`
2. If subcategory is `cellular_honeycomb` (not in accepted list)
3. Either:
   - **Option A**: Update product to use accepted subcategory: `UPDATE enhanced_inventory_items SET subcategory = 'cellular' WHERE id = 'xxx'`
   - **Option B**: Add `cellular_honeycomb` to the `LIBRARY_SUBCATEGORY_GROUPS.cellular` array in `inventorySubcategories.ts`

## Best Practice

**Use the shortest, clearest subcategory name** from the accepted list:
- ✅ `cellular` (simple, clear)
- ❌ `cellular_fabric_for_honeycomb_blinds` (too long, unclear)

Keep subcategory names consistent across all products of the same type.
