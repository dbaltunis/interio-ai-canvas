
# TWC Supplier Standards & Critical Bug Fixes

## Executive Summary

I've completed deep research into the codebase and identified the **exact root causes** of the recurring bugs. The core issue is **architectural inconsistency** - we have a single source of truth (`inventorySubcategories.ts`) but not all components use it. This plan fixes the three critical bugs while establishing TWC supplier standards that will prevent future issues.

---

## Root Cause Analysis

### Database Reality (What's Actually in the Data)

| Subcategory | Category | Count | Issue |
|-------------|----------|-------|-------|
| `vertical_slats` | material | 17 | ✅ Shows in Library "Vertical" tab |
| `vertical_fabric` | material | 8 | ❌ **HIDDEN** - Tab only filters `vertical_slats` |
| `awning_fabric` | fabric | 146 | ✅ In Fabrics view, but... |
| `awning_fabric` | - | - | ❌ **NOT FILTERED** in FabricSelector for awning worksheets |

### Bug #4: Vertical Blinds Missing from Library

**Root Cause:** `MaterialInventoryView.tsx` line 52 only defines `vertical_slats` tab:
```typescript
// Line 52 - ONLY shows vertical_slats
{ key: "vertical_slats", label: "Vertical" }
```

But the database has TWC items with `vertical_fabric` subcategory (8 items). The filter on line 115-116 uses **exact match**:
```typescript
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory;  // ← Exact match - misses vertical_fabric
```

**Additionally**, `FabricSelector.tsx` lines 75-77 also uses exact match:
```typescript
if (treatmentLower.includes('vertical')) {
  return subcategory === 'vertical_slats' || subcategory === 'vertical';
  // ❌ MISSING: 'vertical_fabric'
}
```

---

### Bug #5: Awnings Not Pricing

**Root Cause:** `FabricSelector.tsx` has **no awning handler** at all (lines 67-87):
```typescript
// Lines 69-86 - NO awning case!
if (treatmentLower.includes('roller')) { ... }
if (treatmentLower.includes('venetian')) { ... }
if (treatmentLower.includes('vertical')) { ... }
if (treatmentLower.includes('cellular')) { ... }
if (treatmentLower.includes('panel')) { ... }
if (treatmentLower.includes('shutter')) { ... }
// ❌ NO: if (treatmentLower.includes('awning')) { ... }
```

When creating an awning worksheet, fabrics aren't filtered properly, causing the pricing engine to fail silently.

---

### Bug #6: Rules Dropdown Shows ALL Options

**Root Cause:** `OptionRulesManager.tsx` lines 94-97 uses wrong query type:
```typescript
const { data: options = [] } = useTreatmentOptions(
  template?.treatment_category,   // ← Should be templateId
  'category'                      // ← Should be 'template'
);
```

The `'category'` query type fetches **all visible options** for the treatment category (e.g., all roller blind options), not just the ones enabled for this specific template.

The `'template'` query type (lines 60-136 of `useTreatmentOptions.ts`) correctly:
- Joins with `template_option_settings`
- Filters by `is_enabled: true`
- Respects `hidden_value_ids`

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SINGLE SOURCE OF TRUTH ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   src/constants/inventorySubcategories.ts                                   │
│   ════════════════════════════════════════                                  │
│   TREATMENT_SUBCATEGORIES = {                                               │
│     vertical_blinds: {                                                      │
│       category: 'both',                                                     │
│       subcategories: ['vertical_fabric', 'vertical_slats', ...]             │
│     },                                                                      │
│     awning: {                                                               │
│       category: 'fabric',                                                   │
│       subcategories: ['awning_fabric', 'awning']                            │
│     },                                                                      │
│     ...                                                                     │
│   }                                                                         │
│                                                                             │
│   Helper Functions:                                                         │
│   ├── getAcceptedSubcategories(treatmentCategory)                           │
│   ├── getTreatmentPrimaryCategory(treatmentCategory)                        │
│   └── isValidSubcategory(treatmentCategory, subcategory)                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Files that SHOULD use this (some don't currently):                        │
│                                                                             │
│   ✅ useTreatmentSpecificFabrics.ts - Uses it correctly                     │
│   ❌ MaterialInventoryView.tsx - Hardcodes tab subcategories                │
│   ❌ FabricSelector.tsx - Hardcodes treatment→subcategory mapping           │
│   ✅ InventorySelectionPanel.tsx - Uses it correctly                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. Create Subcategory Grouping Helper

**File:** `src/constants/inventorySubcategories.ts` (extend existing)

Add new helper functions for Library filtering:

```typescript
// NEW: Group related subcategories for Library tabs
export const LIBRARY_SUBCATEGORY_GROUPS = {
  vertical: ['vertical_slats', 'vertical_fabric', 'vertical_vanes', 'vertical'],
  venetian: ['venetian_slats', 'venetian', 'wood_slats', 'aluminum_slats'],
  roller: ['roller_fabric', 'roller', 'roller_material', 'roller_blind_fabric'],
  awning: ['awning_fabric', 'awning'],
  cellular: ['cellular', 'honeycomb', 'cellular_fabric', 'honeycomb_fabric'],
  shutter: ['shutter_material', 'shutter_panels', 'shutter'],
  panel_glide: ['panel_glide_fabric', 'panel_fabric', 'panel'],
};

// Helper: Check if item matches a Library tab group
export const matchesSubcategoryGroup = (
  itemSubcategory: string | undefined,
  groupKey: keyof typeof LIBRARY_SUBCATEGORY_GROUPS
): boolean => {
  const group = LIBRARY_SUBCATEGORY_GROUPS[groupKey];
  if (!group) return false;
  return group.includes(itemSubcategory?.toLowerCase() || '');
};
```

---

### 2. Fix MaterialInventoryView.tsx

**Location:** Lines 48-56, 115-116

**Change 1:** Update MATERIAL_CATEGORIES to use group keys:
```typescript
const MATERIAL_CATEGORIES = [
  { key: "all", label: "All Materials" },
  { key: "roller", label: "Roller Blinds" },      // Group key, not exact subcategory
  { key: "venetian", label: "Venetian" },
  { key: "vertical", label: "Vertical" },         // This will now show BOTH slats AND fabric
  { key: "cellular", label: "Cellular" },
  { key: "panel_glide", label: "Panel Glide" },
  { key: "shutter", label: "Shutters" },
];
```

**Change 2:** Update filter logic to use group matching:
```typescript
import { matchesSubcategoryGroup, LIBRARY_SUBCATEGORY_GROUPS } from '@/constants/inventorySubcategories';

// Line 115-116 - BEFORE:
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory;

// AFTER:
const matchesCategory = activeCategory === "all" || 
  (LIBRARY_SUBCATEGORY_GROUPS[activeCategory as keyof typeof LIBRARY_SUBCATEGORY_GROUPS]
    ? matchesSubcategoryGroup(item.subcategory, activeCategory as keyof typeof LIBRARY_SUBCATEGORY_GROUPS)
    : item.subcategory === activeCategory);
```

---

### 3. Fix FabricSelector.tsx

**Location:** Lines 67-87

**Add awning handler and fix vertical:**
```typescript
// Line 67-87 - Add awning and fix vertical
if (treatmentLower.includes('awning')) {
  return subcategory === 'awning_fabric' || subcategory === 'awning';
}
if (treatmentLower.includes('roller')) {
  return subcategory === 'roller_fabric' || subcategory === 'roller_material' || subcategory === 'roller';
}
if (treatmentLower.includes('venetian')) {
  return subcategory === 'venetian_slats' || subcategory === 'venetian';
}
if (treatmentLower.includes('vertical')) {
  // ✅ FIX: Include vertical_fabric
  return subcategory === 'vertical_slats' || subcategory === 'vertical_fabric' || subcategory === 'vertical';
}
// ... rest unchanged
```

---

### 4. Fix OptionRulesManager.tsx

**Location:** Lines 94-97

**Change query type from 'category' to 'template':**
```typescript
// BEFORE:
const { data: options = [] } = useTreatmentOptions(
  template?.treatment_category, 
  'category'
);

// AFTER:
const { data: options = [] } = useTreatmentOptions(
  templateId,    // Pass the template ID, not the category
  'template'     // Use template-specific query
);
```

This ensures the Rules dropdown only shows options that are:
1. Linked to this specific template via `template_option_settings`
2. Marked as `is_enabled: true`
3. Properly filtered by `hidden_value_ids`

---

## Files to Modify

| File | Lines | Change | Bug Fixed |
|------|-------|--------|-----------|
| `src/constants/inventorySubcategories.ts` | End of file | Add `LIBRARY_SUBCATEGORY_GROUPS` and `matchesSubcategoryGroup` helper | All |
| `src/components/inventory/MaterialInventoryView.tsx` | 48-56, 115-116 | Use group-based filtering | #4 (Vertical) |
| `src/components/fabric/FabricSelector.tsx` | 67-87 | Add awning handler, fix vertical | #4, #5 |
| `src/components/settings/tabs/products/OptionRulesManager.tsx` | 94-97 | Change to `templateId` + `'template'` query | #6 (Rules) |

---

## TWC Supplier Standards (For Future Reference)

### Product Categorization Rules

| TWC Product Type | `category` | `subcategory` | Notes |
|------------------|------------|---------------|-------|
| Vertical Fabrics | `material` | `vertical_slats` or `vertical_fabric` | Both are valid - use grouping |
| Roller Blinds | `material` | `roller_fabric` | Manufactured, not sewn |
| Venetian Slats | `material` | `venetian_slats` | Wood/Aluminum |
| Awnings | `fabric` | `awning_fabric` | SKU prefix 700-820 |
| Curtains | `fabric` | `curtain_fabric` | Sewn products |
| Roman | `fabric` | `curtain_fabric` | Shares curtain fabrics |
| Cellular | `material` | `cellular` | Honeycomb structure |
| Panel Glide | `material` | `panel_glide_fabric` | Panel tracks |
| Shutters | `material` | `shutter_material` | Plantation panels |

### Sync Function Rules (`twc-sync-products/index.ts`)

The sync function already uses:
1. **SKU prefix detection** (lines 289-312) - Most reliable for outdoor/awning products
2. **Parent product description** (lines 314-382) - Fallback for categorization
3. **Vendor ID inheritance** - Child materials inherit vendor_id from parent

These are working correctly - the issue was downstream filtering, not sync.

---

## Testing Checklist (Post-Implementation)

### Vertical Blinds (Bug #4)
- [ ] Navigate to Library → Materials → Vertical tab
- [ ] Verify count shows 25 items (17 slats + 8 fabric)
- [ ] Create a Vertical Blind worksheet
- [ ] Verify fabric selector shows BOTH vertical_slats AND vertical_fabric
- [ ] Select a vertical_fabric item and confirm pricing calculates

### Awnings (Bug #5)
- [ ] Navigate to Library → Fabrics → Awnings tab
- [ ] Verify awning_fabric items appear (146 items)
- [ ] Create an Awning worksheet
- [ ] Verify fabric selector filters to awning fabrics ONLY
- [ ] Select an awning fabric and confirm pricing calculates

### Rules Dropdown (Bug #6)
- [ ] Go to Settings → Products → Templates
- [ ] Select a Roller Blind template that has 5 options enabled
- [ ] Click Rules tab → Add Rule
- [ ] Verify dropdown shows ONLY those 5 options
- [ ] Verify NO options from other templates appear

---

## Prevention Strategy

### Memory Note to Add

After implementation, I'll create a memory note:

```
# Memory: inventory-subcategory-grouping-standard

When filtering inventory items in the Library or worksheets, ALWAYS use the 
centralized helpers from `src/constants/inventorySubcategories.ts`:

- For worksheet filtering: Use `getAcceptedSubcategories(treatmentCategory)`
- For Library tabs: Use `matchesSubcategoryGroup(subcategory, groupKey)`

Never hardcode subcategory strings in filter logic. This prevents the 
"vertical_fabric vs vertical_slats" problem from recurring.

Files using this pattern:
- useTreatmentSpecificFabrics.ts ✅
- InventorySelectionPanel.tsx ✅
- MaterialInventoryView.tsx ✅ (after fix)
- FabricSelector.tsx ✅ (after fix)
```

---

## Impact on Other Areas

Areas that use subcategory filtering (verified safe):

| Component | Status | Notes |
|-----------|--------|-------|
| `useTreatmentSpecificFabrics.ts` | ✅ Safe | Already uses `getAcceptedSubcategories` |
| `InventorySelectionPanel.tsx` | ✅ Safe | Uses the hook above |
| `PricingGridDiagnostic.tsx` | ⚠️ Review | Has hardcoded subcategories - minor diagnostic only |
| `CategoryProductTypeGuide.tsx` | ⚠️ Review | Documentation component - not critical |
| `twc-sync-products/index.ts` | ✅ Safe | Creates data with correct subcategories |

No breaking changes expected in other areas.
