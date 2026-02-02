

## Fix Collections Not Displaying in Filters

### Problem Summary

The collections dropdown in the filter panel shows "All Collections" but no actual collections appear in the list. The root cause is that the collection-related hooks are missing the multi-tenant support pattern that other hooks (like `useVendors`) correctly implement.

### Root Cause Analysis

Comparing `useCollections.ts` with `useVendors.ts`:

| Aspect | useVendors (correct) | useCollections (broken) |
|--------|---------------------|------------------------|
| Uses `useEffectiveAccountOwner` | Yes | No |
| Includes `effectiveOwnerId` in queryKey | Yes | No |
| Filters by `user_id` explicitly | Yes | No |
| Has `enabled` condition | Yes, waits for `effectiveOwnerId` | No |

The RLS policies on the `collections` table DO use `get_effective_account_owner`, but the React Query cache behavior causes issues because:
1. The query fires before the effective owner context is established
2. The cache key doesn't differentiate between users/accounts
3. This leads to stale empty arrays being cached

### Solution

Update all collection and inventory filter hooks to follow the same multi-tenant pattern as `useVendors`:

**Files to modify:**
1. `src/hooks/useCollections.ts` - Add multi-tenant support to all hooks
2. `src/hooks/useInventoryTags.ts` - Add multi-tenant support to all three hooks

### Technical Changes

#### 1. useCollections.ts

**Add import for `useEffectiveAccountOwner`:**
```typescript
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
```

**Update `useCollections` hook:**
- Add `const { effectiveOwnerId } = useEffectiveAccountOwner();`
- Update queryKey to include `effectiveOwnerId`
- Add `.eq("user_id", effectiveOwnerId)` filter to query
- Add `enabled: !!effectiveOwnerId` to prevent premature execution

**Update `useCollectionsByVendor` hook:**
- Same pattern as above

**Update `useCollectionsWithCounts` hook:**
- Same pattern for both the collections query and the inventory items count query
- This is the hook used by `FilterButton.tsx` for the collection dropdown

**Update `useVendorsWithCollections` hook:**
- Same pattern

#### 2. useInventoryTags.ts

Apply the same pattern to:
- `useInventoryTags`
- `useInventoryLocations`
- `useInventoryColors`

### Before/After Code Example

**Before (useCollectionsWithCounts):**
```typescript
export const useCollectionsWithCounts = () => {
  return useQuery({
    queryKey: ["collections", "with-counts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: collections } = await supabase
        .from("collections")
        .select(...)
        .eq("active", true);  // Missing user_id filter!
      ...
    },
  });
};
```

**After (useCollectionsWithCounts):**
```typescript
export const useCollectionsWithCounts = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["collections", "with-counts", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];
      
      const { data: collections } = await supabase
        .from("collections")
        .select(...)
        .eq("user_id", effectiveOwnerId)  // Explicit filter
        .eq("active", true);
      
      const { data: inventoryItems } = await supabase
        .from("enhanced_inventory_items")
        .select("collection_id")
        .eq("user_id", effectiveOwnerId)  // Also filter inventory
        .not("collection_id", "is", null);
      ...
    },
    enabled: !!effectiveOwnerId,  // Wait for context
  });
};
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useCollections.ts` | Add multi-tenant support to `useCollections`, `useCollectionsByVendor`, `useCollectionsWithCounts`, `useVendorsWithCollections` |
| `src/hooks/useInventoryTags.ts` | Add multi-tenant support to `useInventoryTags`, `useInventoryLocations`, `useInventoryColors` |

### Expected Outcome

After implementation:
- Collections will appear in the filter dropdown
- Tags, locations, and colors will display correctly
- Team members will see the same data as account owners
- Query caching will work correctly across account switches

