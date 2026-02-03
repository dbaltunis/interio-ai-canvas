

## Fix: Backfill Collections from CSV Import Data

### Problem Identified

When fabrics/materials/hardware were imported via CSV, the `collection_name` column was saved as **plain text** in the `enhanced_inventory_items` table, but no actual **collection records** were created in the `collections` table.

**Current State:**
| Account | Items with collection_name | Linked to collections table |
|---------|---------------------------|----------------------------|
| Homekaara | 711 items | 0 items |
| Interioapp Admin | 1,356 items | 1,351 linked |
| InterioApp_Australasia | 71 items | 0 items |
| CCCO Admin | 74 items | 56 linked |

**Homekaara's top collection names (from CSV):**
- Contract (75 items)
- Celestial (64 items)
- Curtain Bible - 2 (62 items)
- Flair (45 items)
- Eloise (40 items)
- And 50+ more collections...

---

### Solution: Two-Part Fix

#### Part 1: Manual Database Backfill (Immediate)

Run these SQL commands in **Supabase SQL Editor** to create collection records and link items:

```sql
-- Step 1: Create collection records from unique collection_name values
INSERT INTO collections (name, user_id, active, created_at, updated_at)
SELECT DISTINCT 
  collection_name as name, 
  user_id, 
  true as active, 
  now() as created_at, 
  now() as updated_at
FROM enhanced_inventory_items
WHERE collection_name IS NOT NULL 
  AND collection_name != ''
  AND collection_id IS NULL
ON CONFLICT (name, user_id) DO NOTHING;

-- Step 2: Link inventory items to their collections
UPDATE enhanced_inventory_items ei
SET collection_id = c.id,
    updated_at = now()
FROM collections c
WHERE ei.collection_name = c.name
  AND ei.user_id = c.user_id
  AND ei.collection_id IS NULL;
```

#### Part 2: Fix Import Logic (Permanent)

Update the CSV import process to automatically create/link collections during import, preventing this from happening again.

**File to modify:** `src/hooks/useEnhancedInventory.ts`

In the `useCreateEnhancedInventoryItem` mutation:
1. Check if `collection_name` is provided
2. Look up existing collection by name + user_id
3. If not found, create new collection record
4. Set `collection_id` on the inventory item

---

### Affected Accounts

This backfill will fix collections for all accounts with unlinked data:

| Account | Collections to Create | Items to Link |
|---------|----------------------|---------------|
| Homekaara | ~60 new collections | 711 items |
| InterioApp_Australasia | ~30 new collections | 71 items |
| CCCO Admin | ~20 new collections | 18 items |
| Others | Various | Various |

---

### Implementation Steps

1. **Run SQL backfill** - Creates collections and links existing inventory items
2. **Update import hook** - Ensures future CSV imports automatically create/link collections
3. **Add vendor linking** - When vendor_name is provided in CSV, also link collection to that vendor

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useEnhancedInventory.ts` | Add collection auto-creation logic in create mutation |
| `src/utils/categoryImportExport.ts` | Ensure collection_name is properly mapped during import |

---

### Expected Outcome

After running the backfill:
- Homekaara will see 60+ collections in their filter dropdown
- All 711 items will be properly categorized
- Future CSV imports will automatically create and link collections

