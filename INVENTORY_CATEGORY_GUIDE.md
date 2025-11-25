# Inventory Category & Subcategory Guide

## How Inventory Filtering Works

When a user selects a treatment template (e.g., "Honeycomb Blind"), the inventory panel automatically filters products by matching the product's **category** and **subcategory** fields to the treatment type.

## Critical Rules

1. **Category**: Must be either `fabric`, `material`, `hardware`, or `both` (for treatments supporting multiple material types)
2. **Subcategory**: Must match one of the expected values for that treatment type (see table below)
3. **Both fields must be set correctly** for products to appear in the inventory panel
4. **Vertical Blinds Special Case**: Vertical blinds use `category: 'both'` because they can have either fabric vanes OR material slats - products should be categorized as either `fabric` with `vertical_fabric` subcategory OR `material` with `vertical_slats`/`vertical_vanes` subcategory

## Treatment Type → Subcategory Mapping

| Treatment Type | Category | Accepted Subcategories | Notes |
|---------------|----------|----------------------|-------|
| **Curtains** | `fabric` | `curtain_fabric` | Standard curtain fabrics |
| **Roman Blinds** | `fabric` | `curtain_fabric` | Uses same fabrics as curtains |
| **Roller Blinds** | `fabric` | `roller_fabric`, `roller_blind_fabric` | Both naming variations accepted |
| **Cellular/Honeycomb Blinds** | `fabric` | `cellular`, `cellular_fabric`, `honeycomb`, `honeycomb_fabric` | All variations accepted |
| **Panel Glide** | `fabric` | `panel_glide_fabric`, `panel_fabric`, `curtain_fabric` | Can use panel or curtain fabrics |
| **Venetian Blinds** | `material` | `venetian_slats`, `wood_slats`, `aluminum_slats`, `venetian` | Slat materials |
| **Vertical Blinds** | `both` | `vertical_fabric`, `vertical_slats`, `vertical_vanes`, `vertical` | Supports both fabric vanes AND material slats |
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
- **Fabric filtering**: `src/hooks/useTreatmentSpecificFabrics.ts` - lines 38-47, defines accepted subcategories
- **Material filtering**: `src/components/inventory/InventorySelectionPanel.tsx` - `getTreatmentMaterialSubcategories()` function

## Example Fix

If you create a cellular blind fabric but it doesn't show:

1. Check database: `SELECT * FROM enhanced_inventory_items WHERE name = 'My Cellular Fabric'`
2. If subcategory is `cellular_honeycomb` (not in accepted list)
3. Either:
   - **Option A**: Update product to use accepted subcategory: `UPDATE enhanced_inventory_items SET subcategory = 'cellular' WHERE id = 'xxx'`
   - **Option B**: Add `cellular_honeycomb` to the accepted list in `useTreatmentSpecificFabrics.ts` line 43

## Best Practice

**Use the shortest, clearest subcategory name** from the accepted list:
- ✅ `cellular` (simple, clear)
- ❌ `cellular_fabric_for_honeycomb_blinds` (too long, unclear)

Keep subcategory names consistent across all products of the same type.
