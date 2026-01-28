

# Fix TWC Import: Missing vendor_id on Child Materials + Data Backfill

## Root Cause Identified

**Critical Bug Found:** The TWC sync creates child materials (fabrics) WITHOUT the `vendor_id` field:

```text
Parent Items:     vendor_id = SET ✅ (line 561)
Child Materials:  vendor_id = NULL ❌ (lines 1011-1041 - MISSING)
```

**Database Evidence:**
| Status | Count | % |
|--------|-------|---|
| Missing vendor_id | 174 | 60% |
| Has vendor_id | 115 | 40% |

This is why grids aren't matching - the auto-matcher needs `vendor_id` for exact supplier matching, and 60% of curtain fabrics don't have it.

---

## What TWC API Provides (and Doesn't)

**Available from TWC API:**
- Product descriptions ✅
- Questions/Options ✅
- Fabrics & Colours ✅  
- Price Groups (per color) ✅
- Fabric Width (default 300cm) ✅

**NOT available from TWC API:**
- Cost prices ❌ (TWC doesn't expose wholesale costs)
- Selling prices ❌ (Dealers set their own)

This means `cost_price: 0` is expected behavior - users must set their own prices or rely entirely on pricing grids (which IS the intended workflow for TWC).

---

## Solution

### Part 1: Fix Edge Function - Add vendor_id to Child Materials

**File:** `supabase/functions/twc-sync-products/index.ts`

Around line 1011, add `vendor_id: twcVendorId` to the child material insert:

```typescript
const { error: materialError } = await supabaseClient
  .from('enhanced_inventory_items')
  .insert({
    user_id: user.id,
    name: `${parentItem.name} - ${material.material}`,
    sku: `${parentItem.sku}-${material.material}`.replace(/\s+/g, '-'),
    category: materialCategoryMapping.category,
    subcategory: materialCategoryMapping.subcategory,
    supplier: 'TWC',
    vendor_id: twcVendorId,  // ✅ ADD THIS - Critical for grid matching
    active: true,
    // ... rest of fields
  });
```

### Part 2: Backfill Existing Data

All existing TWC materials without `vendor_id` need to be updated. This requires:

1. Find each user's TWC vendor ID
2. Update all their TWC materials to use that vendor ID

**SQL Migration (Run SQL in Supabase Dashboard):**

```sql
-- Backfill vendor_id for TWC materials that are missing it
-- Links to the same TWC vendor as the parent product

WITH twc_vendors AS (
  -- Get each user's TWC vendor
  SELECT user_id, id as vendor_id
  FROM vendors 
  WHERE name ILIKE '%TWC%'
)
UPDATE enhanced_inventory_items eii
SET vendor_id = tv.vendor_id
FROM twc_vendors tv
WHERE eii.user_id = tv.user_id
  AND eii.supplier = 'TWC'
  AND eii.vendor_id IS NULL;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/twc-sync-products/index.ts` | Add `vendor_id: twcVendorId` to child material insert (~line 1019) |

## Database Action Required

Run SQL migration to backfill existing data (affects all Australasia/Greg's accounts).

---

## Expected Results

### After Fix

1. **New imports:** All child materials will have `vendor_id` set
2. **Existing data:** Backfill migration updates 174+ fabrics
3. **Grid matching:** Auto-matcher can now do exact supplier+product+group matching
4. **Pricing accuracy:** Grids resolve correctly → accurate quotes

### What Users Still Need to Do

- Pricing grids must exist for their TWC products (Groups 1-6, Budget)
- If they want per-meter fabric pricing, they need to set `cost_price` manually (TWC API doesn't provide this)

---

## Technical Details

### Current Child Material Insert (Missing vendor_id)
```typescript
// Line 1011-1041
const { error: materialError } = await supabaseClient
  .from('enhanced_inventory_items')
  .insert({
    user_id: user.id,
    name: `${parentItem.name} - ${material.material}`,
    sku: `${parentItem.sku}-${material.material}`.replace(/\s+/g, '-'),
    category: materialCategoryMapping.category,
    subcategory: materialCategoryMapping.subcategory,
    supplier: 'TWC',
    // ❌ vendor_id is MISSING
    active: true,
    show_in_quote: true,
    // ...
  });
```

### Fixed Child Material Insert
```typescript
const { error: materialError } = await supabaseClient
  .from('enhanced_inventory_items')
  .insert({
    user_id: user.id,
    name: `${parentItem.name} - ${material.material}`,
    sku: `${parentItem.sku}-${material.material}`.replace(/\s+/g, '-'),
    category: materialCategoryMapping.category,
    subcategory: materialCategoryMapping.subcategory,
    supplier: 'TWC',
    vendor_id: twcVendorId,  // ✅ ADD THIS
    active: true,
    show_in_quote: true,
    // ...
  });
```

---

## Impact Scope

- **All Australasia accounts** with TWC imports
- **Greg's demo accounts** with TWC products
- **Any account** that imported TWC products before this fix

The backfill migration will fix all existing data in one operation, and the code fix ensures all future imports work correctly.

