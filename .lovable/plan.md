
# Fix TWC Products Not Appearing in Library Page

## Root Cause Analysis

After tracing through the code, I found **multiple filtering mismatches** between what TWC imports create and what the Library page displays:

### Issue 1: Missing Subcategory Tabs in Library

**FabricInventoryView.tsx** has these tabs:
```typescript
const FABRIC_CATEGORIES = [
  { key: "all", label: "All Fabrics" },
  { key: "curtain_fabric", label: "Curtain & Roman" },
  { key: "lining_fabric", label: "Linings" },
  { key: "sheer_fabric", label: "Sheers" },
  { key: "awning_fabric", label: "Awnings" },
  { key: "upholstery_fabric", label: "Upholstery" },
];
```

**But TWC imports create:**
- `roman_fabric` → NOT matched by any tab except "All Fabrics"
- The "Curtain & Roman" tab filters by `subcategory === 'curtain_fabric'` which excludes `roman_fabric`

### Issue 2: Inconsistent Category Mapping

TWC sync currently maps:
- Roman products → `category: 'fabric', subcategory: 'roman_fabric'`
- But romans should use `curtain_fabric` since they share the same fabrics

### Issue 3: Cellular Blinds Wrong Category

TWC creates cellular with `category: 'material', subcategory: 'cellular'`
But `cellular_blinds` in `TREATMENT_SUBCATEGORIES` expects `category: 'fabric'`

---

## Solution Overview

### Part 1: Update Library Tab Filters (FabricInventoryView)

Modify filtering logic to accept both `curtain_fabric` AND `roman_fabric` under the same "Curtain & Roman" tab:

```typescript
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory ||
  // Group roman_fabric with curtain_fabric
  (activeCategory === 'curtain_fabric' && item.subcategory === 'roman_fabric');
```

### Part 2: Fix TWC Category Mapping (Edge Function)

Update `twc-sync-products/index.ts` to align with Library expectations:

| Product Type | Category | Subcategory (Current → Fixed) |
|-------------|----------|-------------------------------|
| Roman | fabric | `roman_fabric` → `curtain_fabric` |
| Cellular | material | `cellular` → Keep but add to Material tabs |

### Part 3: Add Missing Subcategory Tabs

**MaterialInventoryView.tsx** - Add `cellular` to `MATERIAL_CATEGORIES` since TWC creates them:

```typescript
const MATERIAL_CATEGORIES = [
  { key: "all", label: "All Materials" },
  { key: "roller_fabric", label: "Roller Blinds" },
  { key: "venetian_slats", label: "Venetian" },
  { key: "vertical_slats", label: "Vertical" },
  { key: "cellular", label: "Cellular" }, // Already exists ✅
  { key: "panel_glide_fabric", label: "Panel Glide" },
  { key: "shutter_material", label: "Shutters" },
];
```

This is already correct in the codebase!

### Part 4: Backfill Existing Data

Run SQL migration to unify roman_fabric → curtain_fabric for consistency:

```sql
UPDATE enhanced_inventory_items 
SET subcategory = 'curtain_fabric' 
WHERE subcategory = 'roman_fabric' AND supplier = 'TWC';
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/inventory/FabricInventoryView.tsx` | Add `roman_fabric` grouping to "Curtain & Roman" tab filter |
| `supabase/functions/twc-sync-products/index.ts` | Map roman → `curtain_fabric` instead of `roman_fabric` |
| Database | Backfill 126 roman_fabric items to curtain_fabric |

---

## Technical Implementation Details

### FabricInventoryView.tsx Changes

Update the filtering logic around line 134:

```typescript
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory ||
  // Roman fabrics display under Curtain & Roman tab
  (activeCategory === 'curtain_fabric' && item.subcategory === 'roman_fabric');
```

### TWC Sync Edge Function Changes

In `mapCategoryForMaterial()` function (around line 373):

```typescript
// CRITICAL: Roman fabrics = curtain_fabric (same fabrics, show in same Library section)
if (parentDesc.includes('roman')) {
  return { category: 'fabric', subcategory: 'curtain_fabric' }; // Changed from 'roman_fabric'
}
```

And in `mapCategory()` function (around line 270):

```typescript
// Roman = FABRIC with curtain_fabric (sewn products, shares fabrics with curtains)
if (lowerDesc.includes('roman')) {
  return { category: 'fabric', subcategory: 'curtain_fabric' }; // Changed from 'roman_fabric'
}
```

### SQL Migration for Backfill

```sql
-- Unify roman_fabric to curtain_fabric for Library display consistency
UPDATE enhanced_inventory_items 
SET subcategory = 'curtain_fabric',
    updated_at = NOW()
WHERE subcategory = 'roman_fabric';
```

---

## Expected Outcome After Implementation

| Library Section | Before | After |
|----------------|--------|-------|
| **Fabrics Tab** | | |
| All Fabrics | 507 items | 507 items |
| Curtain & Roman | 289 items | 415 items (+126 roman) |
| Awnings | 92 items | 92 items |
| **Materials Tab** | | |
| All Materials | 384 items | 384 items |
| Roller Blinds | 228 items | 228 items |
| Panel Glide | 114 items | 114 items |
| Cellular | 4 items | 4 items |
| **Hardware Tab** | | |
| Tracks | 9 items | 9 items |

---

## Why This Fixes the Global SaaS Issue

1. **Edge Function Fix**: Future TWC imports across ALL accounts will use consistent subcategories
2. **Backfill Migration**: Existing data across ALL accounts gets unified
3. **Library Filter Fix**: Even if some items have `roman_fabric`, they'll display correctly
4. **No CSV Import Breakage**: The changes only affect TWC mapping logic, not general import
