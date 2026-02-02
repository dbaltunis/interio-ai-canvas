
# Fix Plan: Vertical Blinds TWC Templates Not Working

## Executive Summary

After comprehensive investigation of CCCO account (Daniel/Greg), I've identified **5 distinct issues** causing vertical blinds templates "NORMAN SmartDrape" and "Verticals (Slats Only)" to not work properly:

1. **No Options Linked** (0 options) - Templates missing product-specific TWC options
2. **Configuration Mismatch** - `inventoryCategory: 'none'` vs `primaryCategory: 'material'/'both'` conflict
3. **Missing Parent Product Link** - NORMAN SmartDrape has `inventory_item_id: null`
4. **TWC Sync Skip Logic** - "Slats Only" products are classified as `hardware` and skip template option creation
5. **$0 Pricing Persistence** - Some windows show $0 despite having pricing grids

---

## Database Findings

### Templates Status

| Template | Options | inventory_item_id | Status |
|----------|---------|-------------------|--------|
| Verticals | 11 ✅ | linked ✅ | Working |
| NORMAN SmartDrape | 0 ❌ | **null** ❌ | Not configured |
| Verticals (Slats Only) | 0 ❌ | linked ✅ | Not configured |

### Child Materials Exist

"Verticals (Slats Only)" has 7 child materials correctly linked via `parent_product_id`:
- BALMORAL BLOCKOUT (price_group: 2)
- FOCUS (price_group: 1)
- KARMA (price_group: 2)
- QUBE (price_group: Budget)
- SOLITAIRE (price_group: 1)
- VIBE (price_group: 1)
- VIBE METALLIC (price_group: 2)

### Pricing Grids Exist

CCCO has 4 vertical blinds pricing grids with correct price groups:
- Group 1 (price_group: "1")
- Group 2 (price_group: "2")
- Group Budget (price_group: "BUDGET")
- Group 0_LF_Air (price_group: "0_LF_AIR")

---

## Root Cause Analysis

### Issue #1: TWC Sync Skips "Slats Only" Products

**Location:** `supabase/functions/twc-sync-products/index.ts` (Lines 158-161)

```typescript
if (lowerDesc.includes('slats only') || lowerDesc.includes('slat only')) {
  return 'hardware'; // Replacement parts, not full product
}
```

When `treatmentCategory === 'hardware'`:
- Line 717-720: Template creation is SKIPPED
- Options are NEVER created for these products

**Impact:** "Verticals (Slats Only)" exists as a template BUT has no options because TWC sync treated it as hardware and skipped the option creation phase.

### Issue #2: `inventoryCategory: 'none'` Conflict

**Location:** `src/utils/treatmentTypeDetection.ts` (Line 164)

```typescript
vertical_blinds: {
  inventoryCategory: 'none', // ❌ Wrong for vertical blinds!
}
```

**However**, `inventorySubcategories.ts` (Line 78-84) correctly defines:

```typescript
vertical_blinds: {
  category: 'both', // ✅ Correct - supports fabric vanes AND material slats
  fabricSubcategories: ['vertical_fabric'],
  materialSubcategories: ['vertical_slats', 'vertical_vanes', 'vertical', 'blind_material'],
}
```

**Impact:** When `useTreatmentSpecificFabrics.ts` runs:
1. It checks `treatmentConfig.inventoryCategory` → gets `'none'`
2. It then checks `primaryCategory` → gets `'material'` from inventorySubcategories
3. Line 192-218: The code handles this special case BUT only when `parentProductId` is not set

### Issue #3: NORMAN SmartDrape Has No Linked Inventory Item

```sql
id: d9053931-fbac-4fb8-95ec-89fc780a9a02
inventory_item_id: null  -- ❌ No link!
```

This template was likely created manually, not through TWC sync, so it:
- Has no parent product to pull child materials from
- Has no TWC questions to create options from

### Issue #4: $0 Pricing on Some Windows

Windows with working "Verticals" template show:
- Some records: `total_selling: 266.47` ✅
- Some records: `total_selling: 0` ❌

The $0 records happen when:
1. `liveBlindCalcResult` is not yet populated when save triggers
2. Fabric cost = 0 because no fabric was selected
3. The fallback logic doesn't have pricing grid data

---

## Fix Plan

### Phase 1: Fix TWC Sync Logic (Edge Function)

**File:** `supabase/functions/twc-sync-products/index.ts`

**Change 1:** Don't skip template creation for "Slats Only" - treat as `vertical_blinds`

```typescript
// Lines 158-161: REMOVE or MODIFY this
if (lowerDesc.includes('slats only') || lowerDesc.includes('slat only')) {
  return 'hardware'; // ❌ Remove this
}

// Instead, add BEFORE the "vertical" check:
if (lowerDesc.includes('slats only') && lowerDesc.includes('vertical')) {
  return 'vertical_blinds'; // ✅ Keep as vertical blinds
}
```

**Change 2:** Ensure options are created even when product was synced without questions

Add a fallback to copy options from an existing working template with the same treatment_category when no TWC questions exist.

### Phase 2: Fix Detection Configuration

**File:** `src/utils/treatmentTypeDetection.ts`

**Change:** Update `vertical_blinds` inventoryCategory from `'none'` to `'both'`

```typescript
vertical_blinds: {
  requiresFullness: false,
  requiresHardwareType: false,
  requiresFabricOrientation: false,
  requiresHeading: false,
  requiresLining: false,
  showPooling: false,
  inventoryCategory: 'both', // ✅ Changed from 'none'
  specificFields: ['louvre_width', 'headrail_type', 'control_type'],
  visualComponent: 'BlindVisualizer',
},
```

### Phase 3: SQL Migration - Fix Existing Templates

Run SQL to:
1. Copy options from working "Verticals" template to "Verticals (Slats Only)"
2. Link "NORMAN SmartDrape" to its inventory item (if one exists)

```sql
-- Copy options from working template to broken template
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
SELECT 
  'a6ab02d7-cac3-4f31-87d8-6046eb65f597', -- Verticals (Slats Only)
  treatment_option_id,
  is_enabled,
  order_index
FROM template_option_settings
WHERE template_id = 'ccc26823-36ae-4dfe-9c22-6bb9851e45ca' -- Working Verticals
ON CONFLICT DO NOTHING;
```

### Phase 4: Price Group Case Sensitivity

The pricing grid has `price_group: "BUDGET"` (uppercase) but some items have `price_group: "Budget"` (mixed case). 

**File:** `src/utils/pricing/gridAutoMatcher.ts`

Verify the existing normalization handles this (looks like it does with `normalizedSearch.toLowerCase()`).

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/twc-sync-products/index.ts` | Fix "Slats Only" categorization |
| `src/utils/treatmentTypeDetection.ts` | Change `inventoryCategory: 'none'` → `'both'` |
| SQL Migration | Copy options to broken templates |

---

## Expected Results After Fix

| Test | Before | After |
|------|--------|-------|
| Verticals (Slats Only) options | 0 options ❌ | 11 options ✅ |
| NORMAN SmartDrape options | 0 options ❌ | 11 options ✅ (if linked) |
| Materials appear in Library | Missing for some | All visible ✅ |
| Pricing grid resolution | Sometimes fails | Consistent ✅ |
| Saved window total_selling | $0 on some | Correct price ✅ |

---

## Technical Details

### Why "Slats Only" Was Treated as Hardware

The TWC sync logic was designed to skip creating templates for replacement parts (like individual slats sold without the headrail system). However, TWC sells "Verticals (Slats Only)" as a full product with its own set of options - it just uses replacement slats from other collections.

The fix allows these products to create templates and options while still routing true hardware items (brackets, motors, remotes) correctly.

### Why `inventoryCategory: 'none'` Was Wrong

This was set because venetian blinds (wood/aluminum slats) don't need fabric inventory - they use pre-cut slats from manufacturers. However, vertical blinds use FABRIC vanes that need to be tracked in inventory, priced via grids, and displayed in the material selection panel.

Setting this to `'both'` aligns with the already-correct `inventorySubcategories.ts` configuration and enables proper material display.
