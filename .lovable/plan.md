
# Fix Venetian Blinds Setup Issues for Gustin Decor

## Issues Identified

Based on thorough investigation, here are the 6 issues and their root causes:

| Issue | Description | Scope | Root Cause |
|-------|-------------|-------|------------|
| 1. Collection descriptions | Shows "Auto-created from fabric imports" | Gustin Decor only | Data migration used placeholder text |
| 2. Pricing = €0.00 | Pricing grids not calculating | Gustin Decor only | Grid data uses `widths/heights/prices` but code expects `widthRanges/dropRanges/prices` |
| 3. Options empty in Settings | "No lamelių plotis found" | Gustin Decor only | Options exist in database but UI queries by `activeOptionType` which doesn't match |
| 4. Template options empty | "No options configured" | Code issue | Query in template editor not finding linked options |
| 5. Pricing grids not used | Grids "Ready" but €0 output | Gustin Decor only | Grid format incompatibility (see issue 2) |
| 6. Rules incomplete | Some rules missing | Gustin Decor only | Only 2 of planned 3+ rules were created |

**Important Finding**: Issues 1-6 are specific to Gustin Decor's data setup, NOT affecting other accounts. However, issue 2 (grid format) is a code bug that could affect any account using the same grid format.

---

## Detailed Technical Analysis

### Issue 1: Collection Descriptions

**Current State:**
- 433 collections with `description = 'Auto-created from fabric imports'`
- Collections have `vendor_id = NULL`
- Fabrics have `supplier` text field with vendor names (Maslina, SCR, Neutex, etc.)

**Solution:**
- Update collection descriptions to show supplier name or remove placeholder text
- Optionally link collections to vendors by matching supplier names

### Issue 2 & 5: Pricing Grid Format Mismatch (Critical Bug)

**Current Grid Data Structure (from database):**
```json
{
  "widths": [500, 600, 700, ...],
  "heights": [500, 600, 700, ...],
  "prices": [[69, 71, 74, ...], [71, 73, 77, ...], ...]
}
```

**Expected by `getPriceFromGrid()` function:**
```json
{
  "widthRanges": ["500", "600", "700", ...],
  "dropRanges": ["500", "600", "700", ...],
  "prices": [[69, 71, 74, ...], [71, 73, 77, ...], ...]
}
```

**Solution:** Update `getPriceFromGrid()` in `src/hooks/usePricingGrids.ts` to handle both formats:
- Check for `widths`/`heights` array format (new)
- Fall back to `widthRanges`/`dropRanges` string format (existing)

### Issue 3: Options Empty in Settings Tab

**Root Cause:**
The `WindowTreatmentOptionsManager` queries:
```typescript
const relevantOptions = allTreatmentOptions.filter((opt) => 
  opt.treatment_category === activeTreatment && opt.key === activeOptionType
);
```

But `activeOptionType` is set from `optionTypeCategories[0].type_key` which correctly returns `slat_width_gustin`. The issue is that when switching treatment types, the `activeOptionType` doesn't reset.

**Database shows:**
- 5 treatment_options exist with correct `account_id`
- 28 option_values exist with correct `account_id` and `option_id`
- 5 option_type_categories exist with correct keys

**Solution:** Reset `activeOptionType` when `activeTreatment` changes, and ensure the first available option type is selected.

### Issue 4: Template Editor Shows "No Options"

**Root Cause:**
The template editor queries `useTemplateOptionSettings(templateId)` which looks for records in `template_option_settings`. Records exist:
- 5 records linking template `3c4d1b0f-...` to treatment options
- `is_enabled = true` for all

The issue is likely the query filtering by `account_id` or template ownership.

**Solution:** Verify RLS policies and query logic in template options editor.

### Issue 6: Missing Rules

**Current State:** 2 rules created
- "Slėpti Somfy ir tilt_only mechanizmus 25mm lamelėms"
- "Slėpti 38mm juostines virveles 25mm lamelėms"

**Missing Rules:**
- Show all mechanism options for 50mm (was planned but skipped)
- Additional rules for other option dependencies

---

## Implementation Steps

### Step 1: Fix Pricing Grid Parser (Code Change)

Update `src/hooks/usePricingGrids.ts` to handle the `widths/heights/prices` format:

```typescript
// Add new handler for widths/heights format (lines ~120-156)
if (gridData.widths && gridData.heights && gridData.prices) {
  const widths = gridData.widths;
  const heights = gridData.heights;
  const prices = gridData.prices;
  
  // Find closest width and height indices
  const closestWidth = widths.reduce((prev, curr) => 
    Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
  );
  const widthIndex = widths.indexOf(closestWidth);
  
  const closestHeight = heights.reduce((prev, curr) => 
    Math.abs(curr - drop) < Math.abs(prev - drop) ? curr : prev
  );
  const heightIndex = heights.indexOf(closestHeight);
  
  return parseFloat(prices[heightIndex]?.[widthIndex]?.toString() || "0");
}
```

### Step 2: Update Collection Descriptions (Database)

Update collections to show supplier info instead of placeholder:

```sql
UPDATE collections c
SET description = COALESCE(
  (SELECT DISTINCT ei.supplier 
   FROM enhanced_inventory_items ei 
   WHERE ei.collection_id = c.id 
   AND ei.supplier IS NOT NULL 
   LIMIT 1),
  'Kolekcija'
)
WHERE c.user_id = '32a92783-f482-4e3d-8ebf-c292200674e5'
  AND c.description = 'Auto-created from fabric imports';
```

### Step 3: Fix Options Tab State Reset (Code Change)

Update `WindowTreatmentOptionsManager.tsx` to reset option type when treatment changes:

```typescript
// Add effect to reset activeOptionType when treatment changes
useEffect(() => {
  if (optionTypeCategories.length > 0) {
    setActiveOptionType(optionTypeCategories[0].type_key);
  } else {
    setActiveOptionType('');
  }
}, [activeTreatment, optionTypeCategories]);
```

### Step 4: Verify Template Options Query (Investigation + Fix)

Check the query in `TemplateOptionsManager.tsx` to ensure it correctly joins options:
- Verify `treatment_category` matches between template and options
- Ensure account_id filtering is correct

### Step 5: Add Missing Rules (Database)

Add additional option rules for complete functionality:

```sql
INSERT INTO option_rules (template_id, name, condition, effect, active)
VALUES (
  '3c4d1b0f-c621-43ec-af72-c93644254fbd',
  'Rodyti visus mechanizmus 50mm lamelėms',
  '{"option_key": "slat_width_gustin", "operator": "equals", "value": "50_timberlux"}',
  '{"action": "show_option", "target_option_key": "mechanism_type_gustin"}',
  true
);
```

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/hooks/usePricingGrids.ts` | Code | Add handler for `widths/heights/prices` grid format |
| `src/components/settings/tabs/components/WindowTreatmentOptionsManager.tsx` | Code | Fix state reset when changing treatment types |
| Database: `collections` | Data | Update descriptions with supplier names |
| Database: `option_rules` | Data | Add missing conditional rules |

---

## Testing After Implementation

1. **Library → Collections**: Verify descriptions show supplier names instead of "Auto-created..."
2. **Settings → Products → Options**: Select "Venetian Blinds" → Verify options appear
3. **Settings → Products → My Templates**: Edit "Medinės žaliuzės" → Options tab shows 5 options
4. **Create Quote → Venetian Blinds**: 
   - Enter 1000mm x 1500mm dimensions
   - Verify price calculates (should be ~€99 for Basswood 25mm)
   - Select 25mm slat → Somfy options hidden
   - Select 50mm slat → All mechanism options visible

---

## Summary

| Fix | Scope | Impact |
|-----|-------|--------|
| Grid format handler | Code (all accounts) | Fixes pricing for grids using `widths/heights` format |
| Collection descriptions | Gustin Decor data | Improves UX with meaningful descriptions |
| Options tab state | Code (all accounts) | Fixes state management when switching treatments |
| Template options query | Code (all accounts) | Ensures options display in template editor |
| Missing rules | Gustin Decor data | Completes conditional option logic |
