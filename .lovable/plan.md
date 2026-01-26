

# Fix Library Collections System + Improve UX

## Problem Summary

The Library/Inventory page has two main issues:

1. **Collections System is Broken**: The `CategoryManager` uses hardcoded mock data instead of connecting to the database. Collections created in the Admin panel don't actually save.

2. **Missing Industry-Standard Features**: Professional inventory systems group products by vendor collections (like "Warwick Heritage 2024" or "TWC Roller Fabrics"). Your system has 2,400+ items but no way to browse by collection.

---

## Solution Overview

### Part 1: Fix Collections to Use Real Database

**File:** `src/components/library/CategoryManager.tsx`

Replace mock data with actual database queries:

- Use `useCollections()` hook instead of hardcoded array
- Use `useCreateCollection()` mutation to save new collections
- Use `useDeleteCollection()` mutation for removal
- Connect the form submissions to real database operations

**Key Changes:**
```typescript
// BEFORE (lines 50-54):
const collections: Collection[] = [
  { id: "1", name: "Heritage Collection", ... },
  ...
];

// AFTER:
const { data: collections = [], isLoading } = useCollections();
const createCollection = useCreateCollection();
const deleteCollection = useDeleteCollection();
```

### Part 2: Auto-Create Collections from TWC Sync

**File:** `supabase/functions/twc-sync-products/index.ts`

When syncing products from TWC, extract collection/range names and create collection records:

- Parse TWC product ranges (e.g., "Straight Drop - SKYE" becomes "SKYE" collection)
- Create collection if it doesn't exist
- Link inventory items to their collection via `collection_id`

**Logic:**
```typescript
// Extract collection name from TWC product name
const collectionName = extractCollectionFromName(product.name);
// e.g., "Straight Drop - SKYE LIGHT FILTER" → "SKYE"

// Upsert collection
const { data: collection } = await supabase
  .from('collections')
  .upsert({ 
    name: collectionName, 
    vendor_id: twcVendorId,
    user_id: userId 
  })
  .select()
  .single();

// Link product to collection
item.collection_id = collection.id;
```

### Part 3: Add Collection Tab to Library

**File:** `src/components/inventory/ModernInventoryDashboard.tsx`

Add a dedicated "Collections" tab alongside Fabrics, Materials, Hardware:

- Shows all collections as cards/list
- Each collection shows item count and vendor
- Click to filter library by that collection
- Visual hierarchy similar to Shopify's collection browser

### Part 4: Improve Collection Display in Filters

**File:** `src/components/library/FilterButton.tsx`

When a vendor is selected, show their collections with item counts:

```typescript
// Show: "SKYE Collection (12 items)"
<SelectItem key={collection.id} value={collection.id}>
  <div className="flex justify-between">
    <span>{collection.name}</span>
    <Badge variant="secondary">{collection.itemCount}</Badge>
  </div>
</SelectItem>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/library/CategoryManager.tsx` | Replace mock data with `useCollections()` hook, connect form to `useCreateCollection()` |
| `supabase/functions/twc-sync-products/index.ts` | Auto-create collections from product names during sync |
| `src/components/inventory/ModernInventoryDashboard.tsx` | Add "Collections" tab for browsing by collection |
| `src/components/library/FilterButton.tsx` | Show collection item counts in dropdown |
| `src/hooks/useCollections.ts` | Add `useCollectionWithItemCounts()` hook for aggregated data |

---

## Implementation Order

1. **Phase 1 - Fix CategoryManager** (Critical)
   - Connect to database instead of mock data
   - Allow real collection creation/editing
   - Test creating a collection and verify it appears in filters

2. **Phase 2 - TWC Collection Auto-Import**
   - Parse collection names from product names
   - Create collections during product sync
   - Backfill existing items with collection_id

3. **Phase 3 - Collection Browsing Tab**
   - Add new tab to Library
   - Collection cards with thumbnails
   - Click-to-filter functionality

---

## Expected Outcome

After implementation:

1. **Admin Panel**: Creating collections actually saves to database
2. **Filter Dropdown**: Shows real collections with item counts
3. **TWC Sync**: Automatically creates collections like "SKYE", "SERENGETTI", "SANCTUARY" from product names
4. **Browse by Collection**: New tab shows all collections as visual cards
5. **Industry Parity**: Similar to Shopify's collection browser or BlindMatrix's catalog organization

---

## Technical Details

### Collection Name Extraction Pattern

TWC products follow patterns like:
- "Straight Drop - SKYE LIGHT FILTER" → Collection: "SKYE"
- "Straight Drop - SERENGETTI BLOCKOUT" → Collection: "SERENGETTI"
- "Straight Drop - SANCTUARY LIGHT FILTER" → Collection: "SANCTUARY"

Regex to extract:
```typescript
const match = productName.match(/^(?:Straight Drop|Panel Glide|Roller)\s*-\s*([A-Z]+)/i);
const collectionName = match ? match[1] : null;
```

### Database Schema (Already Exists)

The `collections` table is already set up with:
- `id`, `name`, `vendor_id`, `user_id`, `description`
- `season`, `year`, `tags[]`, `active`

Just needs to be populated!

