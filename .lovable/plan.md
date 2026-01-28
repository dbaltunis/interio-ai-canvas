

# Fix: Admin Panel Cannot Update Account Type or Features

## Problem Identified

The Admin Panel (`/admin/accounts`) cannot update account types or toggle unlimited users because of a **missing RLS policy**.

### Root Cause

The `user_profiles` table has inconsistent RLS policies:

| Operation | Policy | System Owner Access |
|-----------|--------|---------------------|
| **SELECT** | `get_effective_account_owner()` only | **NO bypass** |
| **UPDATE** | `get_effective_account_owner() OR is_admin()` | Has bypass |

When a System Owner tries to update another account's profile:
1. The UPDATE query runs with RLS
2. RLS first evaluates SELECT permissions (to identify which rows to update)
3. SELECT policy blocks access to other accounts' profiles
4. Update silently affects 0 rows

### Why Feature Flags Work (Sometimes)

The `account_feature_flags` table has proper System Owner policies:
```sql
-- This policy exists and works:
"System owners can manage all feature flags" -- cmd: ALL
```

But it relies on knowing the `user_id` upfront (passed from the edge function data), so it may work when the data is cached but fail on fresh queries.

---

## Solution

Add a System Owner bypass to the `user_profiles` SELECT policy OR add a dedicated System Owner SELECT policy.

### Option 1: Add Dedicated Policy (Recommended)

Create a new SELECT policy specifically for System Owner access:

```sql
-- Add System Owner global SELECT access to user_profiles
CREATE POLICY "System owners can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'System Owner'
  )
);
```

### Why This Pattern?

This matches the existing pattern used for other admin tables:
- `account_feature_flags` - has `System owners can manage all feature flags`
- `user_subscriptions` - has `System owners can view all subscriptions`

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/[timestamp]_add_system_owner_select_policy.sql` | Add missing RLS policy |

---

## Migration SQL

```sql
-- Add System Owner SELECT policy to user_profiles
-- This allows the admin panel to view and update any account

CREATE POLICY "System owners can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role = 'System Owner'
  )
);

-- Note: The UPDATE policy already has is_admin() bypass, so no changes needed there
```

---

## Technical Details

### Current State

```text
user_profiles RLS:
  SELECT: get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  UPDATE: (same as SELECT) OR is_admin()
  INSERT: (same as SELECT)
  DELETE: (same as SELECT)
```

### After Fix

```text
user_profiles RLS:
  SELECT: (existing policy) OR (System Owner check)  <- NEW
  UPDATE: (existing policy) OR is_admin()            <- Already has bypass
  INSERT: (existing policy)                          <- May need bypass too
  DELETE: (existing policy)                          <- May need bypass too
```

---

## Verification Steps

After migration:
1. Go to `/admin/accounts`
2. Open any account dialog
3. Change account type from dropdown
4. Verify success toast appears
5. Toggle "Unlimited Seats" switch
6. Verify feature flag saves correctly

---

## Summary

| Issue | Fix |
|-------|-----|
| Cannot change account type | Add System Owner SELECT policy |
| Cannot toggle unlimited users | Same fix (relies on user_profiles SELECT) |
| Silent failures | RLS will now allow SELECT, UPDATE will work |

