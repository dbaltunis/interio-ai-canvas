
# Fix TWC Library Organization: Collection Linking for All Items

## Problem Summary

The Library shows collections (DESIGNER, MOTORISED, RESIDENTIAL) with only 3 items total, but **896 fabric items have no collection linkage**. Users see fabrics in the measurement popup but not organized in the Library.

### Database Evidence

| Type | With Collection | Without Collection | Total |
|------|-----------------|-------------------|-------|
| Parent Products | 3 | 126 | 129 |
| Child Materials (Fabrics) | **0** | **896** | 896 |

### Root Causes

1. **Collection Name Extraction Fails**: The regex pattern expects "Product Type - COLLECTION" format, but most TWC products have names like "Balmoral Light Filter", "Aventus 5%", "Sanctuary Light Filter" - no dash separator.

2. **Child Materials Missing Collection**: The edge function sets `collection_id` for parent products but **NOT** for child fabrics (line 1013-1044 is missing `collection_id`).

3. **Product Name IS the Collection**: TWC product names like "Balmoral Light Filter" ARE the collection/range names and should be used directly as collection names.

---

## Solution

### Part 1: Fix Collection Name Extraction (Edge Function)

Update `extractCollectionName()` to handle TWC naming patterns better:

```typescript
const extractCollectionName = (productName: string | undefined | null): string | null => {
  if (!productName || typeof productName !== 'string') return null;
  
  // Pattern 1: "Product Type - COLLECTION NAME" 
  const dashPattern = productName.match(/^[^-]+\s*-\s*([A-Z][A-Z0-9\s]+)/i);
  if (dashPattern && dashPattern[1]) {
    return dashPattern[1].toUpperCase().trim();
  }
  
  // Pattern 2: "(COLLECTION)" parenthetical
  const parenPattern = productName.match(/\(([A-Z][A-Z0-9]+)\)/i);
  if (parenPattern && parenPattern[1]) {
    return parenPattern[1].toUpperCase();
  }
  
  // Pattern 3 (NEW): Use product name directly as collection
  // "Balmoral Light Filter" → "BALMORAL LIGHT FILTER"
  // Skip generic names like "Verticals", "Honeycells" 
  const genericNames = ['verticals', 'honeycells', 'new recloth', 'zip screen'];
  if (!genericNames.includes(productName.toLowerCase().trim())) {
    return productName.toUpperCase().trim();
  }
  
  return null;
};
```

### Part 2: Inherit Collection in Child Materials (Edge Function)

Add `collection_id` to child material insert (around line 1022):

```typescript
const { error: materialError } = await supabaseClient
  .from('enhanced_inventory_items')
  .insert({
    user_id: user.id,
    name: `${parentItem.name} - ${material.material}`,
    // ... existing fields ...
    supplier: 'TWC',
    vendor_id: twcVendorId,
    collection_id: parentItem.collection_id,  // ✅ ADD THIS - Inherit from parent
    // ... rest of fields ...
  });
```

### Part 3: Backfill Existing Data (SQL Migration)

Run migration to create collections from product names and link all orphaned fabrics:

```sql
-- Step 1: Create collections from parent product names
WITH parent_products AS (
  SELECT DISTINCT 
    user_id,
    name as collection_name,
    vendor_id
  FROM enhanced_inventory_items
  WHERE supplier = 'TWC' 
    AND metadata->>'parent_product_id' IS NULL
    AND collection_id IS NULL
    AND name NOT IN ('Verticals', 'Honeycells', 'New Recloth', 'Zip Screen')
)
INSERT INTO collections (user_id, name, vendor_id, description, season, active)
SELECT 
  user_id,
  collection_name,
  vendor_id,
  'TWC Collection: ' || collection_name,
  'All Season',
  true
FROM parent_products
ON CONFLICT (user_id, name) DO NOTHING;

-- Step 2: Link parent products to their collections
UPDATE enhanced_inventory_items eii
SET collection_id = c.id
FROM collections c
WHERE eii.supplier = 'TWC'
  AND eii.metadata->>'parent_product_id' IS NULL
  AND eii.collection_id IS NULL
  AND eii.user_id = c.user_id
  AND eii.name = c.name;

-- Step 3: Link child materials to parent's collection
UPDATE enhanced_inventory_items child
SET collection_id = parent.collection_id
FROM enhanced_inventory_items parent
WHERE child.metadata->>'parent_product_id' = parent.id::text
  AND child.collection_id IS NULL
  AND parent.collection_id IS NOT NULL;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/twc-sync-products/index.ts` | 1. Update `extractCollectionName()` to use product name as collection<br>2. Add `collection_id: parentItem.collection_id` to child material insert |
| SQL Migration | Create collections + backfill all 1,000+ items |

---

## Expected Outcome

| Before | After |
|--------|-------|
| 3 collections (DESIGNER, MOTORISED, RESIDENTIAL) | 100+ collections (Balmoral, Aventus, Sanctuary, etc.) |
| 3 items with collection links | 1,000+ items with collection links |
| Fabrics not filtered by collection | All fabrics organized under their collection |

---

## Technical Details

### Current extractCollectionName() - Only matches "X - Y" pattern
```typescript
const dashPattern = productName.match(/^[^-]+\s*-\s*([A-Z][A-Z0-9]+)/i);
```
Only "Curtain Tracks - Motorised" matches this.

### Fixed extractCollectionName() - Uses product name as collection
```typescript
// Fallback: Use product name directly as collection name
// "Balmoral Light Filter" → "BALMORAL LIGHT FILTER"
return productName.toUpperCase().trim();
```

### Current child material insert (missing collection_id)
```typescript
.insert({
  user_id: user.id,
  name: `${parentItem.name} - ${material.material}`,
  supplier: 'TWC',
  vendor_id: twcVendorId,
  // ❌ collection_id NOT set
})
```

### Fixed child material insert
```typescript
.insert({
  user_id: user.id,
  name: `${parentItem.name} - ${material.material}`,
  supplier: 'TWC',
  vendor_id: twcVendorId,
  collection_id: parentItem.collection_id,  // ✅ Inherit from parent
})
```

---

## Impact

- **All existing accounts**: Backfill migration will organize 1,000+ items into collections
- **All future imports**: Edge function fix ensures proper collection linking
- **Library UX**: Users can browse by Brand → Collection → Fabrics naturally
- **No CSV Import breakage**: Changes only affect TWC sync logic
