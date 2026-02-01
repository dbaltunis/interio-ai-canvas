

# Fix Multi-Tenant Data Saving Issue: Team Members Can't See Their Own Created Data

## Problem Summary

**CRITICAL BUG CONFIRMED**: When team members (e.g., Padam Singvi with role "Admin") create data like headings, the data IS saved to the database but DISAPPEARS immediately because of a mismatch between:

1. **INSERT operation**: Uses `user_id: user.id` (team member's own ID)
2. **SELECT operation**: Queries with `effectiveOwnerId` (account owner's ID)

**Result**: Data is created with the wrong `user_id`, making it invisible to everyone including the creator.

### Evidence From Database

| Team Member | Role | Orphaned Items |
|-------------|------|----------------|
| Padam Singvi | Admin | 10 items |
| Padam Dealer Test | Dealer | 3 items |
| CHRISTOS FOUNDOULIS | Owner* | 1 item |

*Note: This user is marked "Owner" but has a parent_account_id, indicating a misconfiguration

### Root Cause Analysis

The code in `useCreateEnhancedInventoryItem` (line 243):
```typescript
const item: Record<string, any> = { user_id: userId, active: true };
// userId = auth.uid() = team member's ID ❌
// Should be: effectiveOwnerId = account owner's ID ✅
```

---

## Affected Systems

### Confirmed Affected Hooks (Using Wrong user_id)

| Hook | Table | Impact |
|------|-------|--------|
| `useEnhancedInventory.ts` | enhanced_inventory_items | Headings, fabrics, hardware |
| `useBusinessSettings.ts` | business_settings | Company settings not saving |
| `useStitchingPrices.ts` | enhanced_inventory_items | Stitching prices |
| `useClientFiles.ts` | client_files | Client document uploads |
| `useBatchInventoryImport.ts` | enhanced_inventory_items | Bulk imports |

### Other Affected Areas (From Client Report)

1. **Heading Library** - Headings disappear after save
2. **Business Settings** - Company name/logo not updating
3. **Quote Settings** - Template configurations lost

---

## Solution

### Part 1: Fix useCreateEnhancedInventoryItem Hook

**File:** `src/hooks/useEnhancedInventory.ts`

Change the mutation to use `get_effective_account_owner()` pattern:

```typescript
export const useCreateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (raw: any) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (authError || !userId) {
        throw new Error('You must be logged in to add inventory items.');
      }

      // ✅ FIX: Get effective account owner for multi-tenant support
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", userId)
        .single();
      
      // Use parent account if exists (team member), otherwise own ID (account owner)
      const effectiveOwnerId = profile?.parent_account_id || userId;

      // ... whitelist fields code stays the same ...

      const item: Record<string, any> = { 
        user_id: effectiveOwnerId, // ✅ USE EFFECTIVE OWNER, NOT AUTH USER
        active: true 
      };
      
      // ... rest of the function stays the same ...
    },
  });
};
```

### Part 2: Fix useUpdateEnhancedInventoryItem Hook

Same pattern - ensure updates work for team members editing account data.

### Part 3: Fix HeadingInventoryManager Component

**File:** `src/components/settings/tabs/components/HeadingInventoryManager.tsx`

Line 192 - Remove the direct `user_id: user.id` assignment since the hook now handles it:

```typescript
const itemData = {
  // Remove: user_id: user.id,  ← Let the hook determine this
  name: formData.name.trim(),
  // ... rest of fields
};
```

### Part 4: Fix useBusinessSettings Hooks

**File:** `src/hooks/useBusinessSettings.ts`

Update `useUpdateBusinessSettings` to use effective owner:

```typescript
export const useUpdateBusinessSettings = () => {
  return useMutation({
    mutationFn: async ({ id, ...settings }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // ✅ FIX: Get effective account owner
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .single();
      
      const effectiveOwnerId = profile?.parent_account_id || user.id;

      const { data, error } = await supabase
        .from('business_settings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', effectiveOwnerId) // ✅ Use effective owner
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};
```

### Part 5: Fix Orphaned Data (Database Migration)

Reassign existing orphaned inventory items to their correct account owners:

```sql
-- Fix orphaned inventory items created by team members
UPDATE enhanced_inventory_items eii
SET user_id = (
  SELECT COALESCE(up.parent_account_id, up.user_id)
  FROM user_profiles up
  WHERE up.user_id = eii.user_id
)
WHERE eii.user_id IN (
  SELECT up.user_id 
  FROM user_profiles up 
  WHERE up.parent_account_id IS NOT NULL
);
```

### Part 6: Create Reusable Helper (Optional Enhancement)

To prevent this bug pattern across all hooks:

**File:** `src/hooks/useEffectiveAccountOwner.ts` (already exists, good!)

Add a sync version for mutations:

```typescript
export const getEffectiveAccountOwnerSync = async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("parent_account_id")
    .eq("user_id", user.id)
    .single();

  return profile?.parent_account_id || user.id;
};
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useEnhancedInventory.ts` | Use effectiveOwnerId in create/update mutations |
| `src/hooks/useBusinessSettings.ts` | Use effectiveOwnerId in update mutation |
| `src/components/settings/tabs/components/HeadingInventoryManager.tsx` | Remove explicit user_id setting |
| Database Migration | Reassign orphaned items to correct owners |

---

## Testing Checklist

1. **Team Member Heading Test**
   - Log in as a team member (e.g., Padam Singvi)
   - Create a new heading style
   - Verify it appears in the list immediately
   - Refresh the page → Verify it persists

2. **Account Owner Sees Team Data**
   - Log in as the account owner (Homekaara)
   - Verify you can see headings created by team members

3. **Business Settings Test**
   - Log in as team member
   - Update company name
   - Verify the update persists after refresh

4. **Data Isolation Test**
   - Log in as a different account
   - Verify you cannot see the first account's headings

---

## Technical Notes

### Why This Happened

The original code assumed all users are account owners. When team members were added, the INSERT logic wasn't updated to route data to the account owner's `user_id`.

### RLS Policy Analysis

The table has this INSERT policy:
```sql
"Account isolation - INSERT" 
WITH CHECK: get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
```

This policy ALLOWS inserts where the user_id maps to the same effective owner - but the code wasn't setting the right user_id in the first place!

### Memory Pattern to Add

This fix should be documented in architecture memory:
- Pattern: All tenant-scoped data MUST use `effectiveOwnerId` not `auth.uid()`
- Tables affected: Any table with `user_id` used for RLS

