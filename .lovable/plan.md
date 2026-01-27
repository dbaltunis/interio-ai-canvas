

# Fix Library Collections, Pricing Grid & Rules for Gustin Decor

## Issues Identified

Based on thorough investigation, here are all the issues with their root causes and scope:

| # | Issue | Root Cause | Scope |
|---|-------|------------|-------|
| 1 | Collections can't be edited | Edit button exists in `CategoryManager.tsx` but clicking it doesn't show proper UI | All accounts (UI bug) |
| 2 | Library filter shows wrong items | When selecting "BAMBOO_25", showing Abachi items instead | Gustin Decor (screenshot shows BAMBOO_25 selected but Abachi displayed) |
| 3 | Pricing shows sqm instead of grid | `useFabricEnrichment` resolves grid but it's not being passed to `calculateBlindCosts` | Potentially all accounts |
| 4 | Option rules not filtering | Rules execute correctly (logs show `conditionMet: true`) but values still visible | Gustin Decor or code bug |
| 5 | Venetian materials not in collections | 58 slat materials have `collection_id: NULL` but have `price_group` | Gustin Decor data issue |
| 6 | Collections UI needs improvement | No inline edit, search, or batch actions | All accounts |

---

## Detailed Analysis

### Issue 1 & 6: Collection Editing UI
**Current State:**
- `CategoryManager.tsx` has an Edit button (line 319-323)
- Clicking Edit sets `editingCollection` state
- `CollectionForm` receives `editingCollection` but may not populate correctly
- `CollectionsView.tsx` has no edit capability at all (read-only display)

**Root Cause:**
The main Collections tab uses `CollectionsView.tsx` which only displays collections and allows clicking to filter - no edit functionality. The edit functionality exists in `CategoryManager.tsx` which is in a different location (Settings > Library Settings).

### Issue 2: Library Filter Shows Wrong Items
**Screenshot Analysis:**
- User selected "BAMBOO_25" filter chip
- Grid shows "Abachi 50mm - Aro", "Abachi 50mm - Elkin" etc.
- These items have `price_group: ABACHI_50` not `BAMBOO_25`

**Root Cause:**
The `PriceGroupFilter` component in `InventorySelectionPanel.tsx` sets `selectedPriceGroup`, but the filtering logic on line 346 checks `item.price_group === selectedPriceGroup`. The issue is that the filter chips display `price_group` names but the items being shown have different `price_group` values.

Looking at the query - this could be a display caching issue or the filter not being applied after template/treatment change.

### Issue 3: Pricing Shows sqm Instead of Grid
**What We Found:**
- Materials have `pricing_method: 'price_grid'` and `price_group: 'BASSWOOD_25'`
- Pricing grids exist with matching `product_type: 'venetian_blinds'` and `price_group`
- `useFabricEnrichment` hook resolves grids correctly
- But screenshot shows "9.95 sqm" and "3.56 sqm" in Quote Summary

**Root Cause:**
The `blindCostCalculator.ts` (line 73) checks for `fabricHasPricingGrid` using:
```typescript
const fabricHasPricingGrid = fabricItem?.pricing_grid_data && fabricItem?.resolved_grid_name;
```

The fabric must be enriched with grid data BEFORE being passed to the calculator. If the enrichment didn't complete or wasn't passed through, it falls back to sqm calculation.

The issue is likely in how `DynamicCurtainOptions.tsx` passes the selected fabric to `CostCalculationSummary`. The `selectedFabric` may not include the enriched grid data.

### Issue 4: Option Rules Not Filtering
**What We Found:**
- Rules execute with `conditionMet: true` (from console logs)
- `allowedValues` is populated with 6 UUIDs for mechanism_type_gustin
- But UI still shows ALL 9 mechanism options including Somfy

**Root Cause:**
The filtering code (line 1315-1317) filters based on UUID match:
```typescript
const filteredOptionValues = allowedValuesForOption && allowedValuesForOption.length > 0
  ? option.option_values.filter((v: any) => allowedValuesForOption.includes(v.id))
  : option.option_values;
```

The issue is that `allowedValuesForOption` might be correctly populated but the component may not be re-rendering when the selection changes, OR there's a timing issue where the filter is applied before the rules have evaluated.

### Issue 5: Venetian Materials Not in Collections
**Database Check Confirmed:**
```sql
SELECT collection_id FROM enhanced_inventory_items 
WHERE subcategory = 'venetian_slats' -- Returns NULL for all 58 items
```

**Solution:** Create 6 collections and link the 58 materials by price_group.

---

## Implementation Plan

### Step 1: Fix Option Value Filtering (Code)
**File:** `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx`

The issue is that `getAllowedValues` returns the allowed value IDs, but the filter might not trigger a re-render. We need to ensure the filtering happens reactively.

Add more detailed logging and verify the filter actually applies:
```typescript
// Add debug logging before filtering
console.log(`🔍 Filtering ${option.key}:`, {
  allowedValuesForOption,
  totalValues: option.option_values?.length,
  valuesAfterFilter: filteredOptionValues.length,
  filteredOut: option.option_values?.filter((v: any) => 
    allowedValuesForOption && !allowedValuesForOption.includes(v.id)
  ).map((v: any) => v.label)
});
```

Also verify that the filter is applied to the SELECT dropdown, not just logged.

### Step 2: Fix Pricing Grid Resolution (Code)
**File:** `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`

The issue is that `fabricToUse` might not have the enriched grid data. We need to ensure the fabric enrichment is applied before cost calculation.

Check lines ~400-450 where `blindCosts` is calculated - verify that `fabricToUse` includes `pricing_grid_data` and `resolved_grid_name`.

Add fallback enrichment if missing:
```typescript
// Before calculating blind costs, ensure fabric is enriched
const enrichedFabric = useMemo(() => {
  if (fabricToUse?.pricing_grid_data) return fabricToUse;
  // Trigger enrichment if fabric has price_group but no grid
  if (fabricToUse?.price_group && !fabricToUse.pricing_grid_data) {
    console.warn('⚠️ Fabric missing grid data, should be enriched');
  }
  return fabricToUse;
}, [fabricToUse]);
```

### Step 3: Create Venetian Material Collections (Database)
**Migration:** Create 6 collections and link 58 materials

```sql
-- Create 6 collections for venetian slat materials
INSERT INTO collections (id, user_id, name, description, active)
SELECT 
  gen_random_uuid(),
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  CASE price_group
    WHEN 'BASSWOOD_25' THEN 'Basswood 25mm'
    WHEN 'BASSWOOD_50' THEN 'Basswood 50mm'
    WHEN 'BAMBOO_25' THEN 'Bamboo 25mm'
    WHEN 'BAMBOO_50' THEN 'Bamboo 50mm'
    WHEN 'ABACHI_50' THEN 'Abachi 50mm'
    WHEN 'PAULOWNIA_50' THEN 'Paulownia 50mm'
  END,
  'Medinės žaliuzės - ' || price_group,
  true
FROM (SELECT DISTINCT price_group FROM enhanced_inventory_items 
      WHERE user_id = '32a92783-f482-4e3d-8ebf-c292200674e5' 
      AND subcategory = 'venetian_slats') pg;

-- Link materials to their collections
UPDATE enhanced_inventory_items eii
SET collection_id = c.id
FROM collections c
WHERE eii.user_id = c.user_id
  AND eii.subcategory = 'venetian_slats'
  AND c.name = CASE eii.price_group
    WHEN 'BASSWOOD_25' THEN 'Basswood 25mm'
    WHEN 'BASSWOOD_50' THEN 'Basswood 50mm'
    WHEN 'BAMBOO_25' THEN 'Bamboo 25mm'
    WHEN 'BAMBOO_50' THEN 'Bamboo 50mm'
    WHEN 'ABACHI_50' THEN 'Abachi 50mm'
    WHEN 'PAULOWNIA_50' THEN 'Paulownia 50mm'
  END;
```

### Step 4: Add Edit Button to CollectionsView (Code)
**File:** `src/components/library/CollectionsView.tsx`

Add an Edit button that opens a dialog or navigates to edit mode:
```typescript
// Add edit functionality to collection cards
<Button 
  variant="ghost" 
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    onEditCollection?.(collection.id);
  }}
>
  <Edit className="h-3 w-3" />
</Button>
```

### Step 5: Fix Library Price Group Filter (Code)
**File:** `src/components/inventory/InventorySelectionPanel.tsx`

Investigate why clicking BAMBOO_25 shows ABACHI items. This could be:
1. Filter state not resetting when treatment changes
2. Caching of previous filter results
3. Incorrect `price_group` matching logic

Add debug logging to verify filter state:
```typescript
console.log('🔍 Price Group Filter:', {
  selectedPriceGroup,
  itemsTotal: treatmentFabrics.length,
  matchingItems: treatmentFabrics.filter(i => i.price_group === selectedPriceGroup).length
});
```

---

## Files to Modify

| File | Change | Description |
|------|--------|-------------|
| `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` | Code | Fix option value filtering, add debug logging |
| `src/components/measurements/dynamic-options/CostCalculationSummary.tsx` | Code | Ensure fabric enrichment before blind cost calculation |
| `src/components/library/CollectionsView.tsx` | Code | Add edit functionality to collection cards |
| `src/components/inventory/InventorySelectionPanel.tsx` | Code | Fix price group filter reset on treatment change |
| Database: `collections` | Data | Create 6 venetian slat collections |
| Database: `enhanced_inventory_items` | Data | Link 58 materials to collections |

---

## Technical Details

### Gustin Decor Identifiers
- User ID: `32a92783-f482-4e3d-8ebf-c292200674e5`
- Template ID: `3c4d1b0f-c621-43ec-af72-c93644254fbd`
- Vendor ID: `f7e8d9c0-1234-5678-9abc-def012345678`

### Option Rules Configuration
The existing rules are correctly configured:
- Condition: `slat_width_gustin` in `[25_iso, 25_timberlux]`
- Effect: `filter_values` mechanism_type_gustin to 6 allowed IDs
- The rules ARE matching (console logs confirm `conditionMet: true`)
- The issue is in the React component rendering/filtering

### Grid Resolution
Grids exist and should resolve:
- `pricing_grids` has 6 grids for `product_type: venetian_blinds`
- Each grid has matching `price_group` (BASSWOOD_25, BAMBOO_25, etc.)
- `gridAutoMatcher.ts` should find FALLBACK match by product_type + price_group

---

## Testing After Implementation

1. **Library → Collections**: Verify 6 new venetian collections appear with correct item counts
2. **Library → Filter by BAMBOO_25**: Verify only Bamboo 25mm materials show
3. **Create Quote → Venetian Blinds**:
   - Select Bamboo 25mm material
   - Verify grid price appears (not sqm)
   - Select 25mm slat width → Verify Somfy options are HIDDEN
   - Select 50mm slat width → Verify ALL mechanism options show
4. **Collections → Edit**: Verify edit button works and saves changes

---

## Issue Scope Summary

| Issue | Gustin Decor Only? | Affects All? |
|-------|-------------------|--------------|
| Option filtering bug | Investigation needed | Likely code bug |
| Pricing shows sqm | No | Code bug (enrichment not passed) |
| Collections can't edit | No | UI feature missing |
| Price group filter wrong | Investigation needed | Could be code bug |
| Materials not in collections | Yes | Data migration needed |

