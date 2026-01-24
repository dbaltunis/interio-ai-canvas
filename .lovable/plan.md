
# Fix: "Something went wrong" Error on First Login Attempt

## Problem Analysis

The screenshot shows the **global ErrorBoundary** catching an unhandled error during the first login. This is NOT a toast message - it's the full-page error fallback with "Try Again" and "Refresh Page" buttons.

### Root Cause: Race Condition

When a user logs in:
1. `AuthProvider` sets `user` state and fires `SIGNED_IN` event
2. `ProtectedRoute` sees `user` exists, renders `Index` page
3. `Index` page immediately fires multiple queries that depend on `user_profiles`:
   - `useUserRole()` - queries `user_profiles` 
   - `useUserPermissions()` - queries `user_profiles`
   - `useAccountStatus()` - queries `user_profiles` with `.single()`
4. **Problem**: The `user_profiles` row may not exist yet (created by database trigger) or the query fails transiently
5. The `.single()` call in `useAccountStatus` throws an error if no row exists
6. This error propagates up and crashes the ErrorBoundary

### Evidence
- `useAccountStatus` (line 73) uses `.single()` which throws on 0 rows
- `useUserRole` has a duplicate `if (!user) return null;` check (line 12-13) suggesting past issues
- The error happens consistently on first attempt but succeeds on retry (data is ready by then)

---

## Solution

### Fix 1: Use `.maybeSingle()` instead of `.single()` in `useAccountStatus`

**File**: `src/hooks/useBlockAccount.ts` (line 73)

The `.single()` method throws an error if zero or multiple rows are returned. For first-time users, the profile might not exist immediately.

```typescript
// Before (line 73)
.single();

// After
.maybeSingle();
```

### Fix 2: Add defensive checks in `AccountStatusGuard`

**File**: `src/components/auth/AccountStatusGuard.tsx`

Handle the case where account status query fails gracefully:

```typescript
export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const { user } = useAuth();
  const { data: accountStatus, isLoading, isError } = useAccountStatus(user?.id);

  // Don't block while loading, on error, or if no user
  if (isLoading || isError || !user) {
    return <>{children}</>;
  }

  // Rest of the logic...
}
```

### Fix 3: Add error handling in Index page queries

**File**: `src/pages/Index.tsx` (lines 107-122)

Ensure explicit permissions query doesn't throw:

```typescript
const { data: explicitPermissions } = useQuery({
  queryKey: ['explicit-user-permissions', user?.id],
  queryFn: async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[Index] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('[Index] Exception fetching permissions:', e);
      return [];
    }
  },
  enabled: !!user && !permissionsLoading,
  retry: 2, // Retry twice on failure
});
```

### Fix 4: Add retry configuration to critical auth queries

**File**: `src/hooks/useUserRole.ts`

Add retry logic to handle transient failures:

```typescript
return useQuery({
  queryKey: ["user-role", user?.id],
  enabled: !authLoading && !!user,
  retry: 2,
  retryDelay: 500,
  queryFn: async () => {
    // existing logic
  },
});
```

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/hooks/useBlockAccount.ts` | Change `.single()` to `.maybeSingle()` | **Critical** |
| `src/components/auth/AccountStatusGuard.tsx` | Handle `isError` state gracefully | **Critical** |
| `src/pages/Index.tsx` | Add try/catch and retry to permission queries | Medium |
| `src/hooks/useUserRole.ts` | Add retry configuration | Medium |

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| First login success rate | ~50% (requires retry) | 100% |
| Error boundary triggers on login | Yes | No |
| User experience | Frustrating "Try Again" flow | Seamless first-time login |

---

## Technical Notes

### Why `.maybeSingle()` vs `.single()`?

- `.single()` throws `PGRST116` error if 0 or >1 rows returned
- `.maybeSingle()` returns `null` if 0 rows, still errors on >1 rows
- For new users, the profile might not exist for a few hundred milliseconds after signup

### Query Retry Strategy

React Query's retry mechanism will automatically retry failed queries, giving the database trigger time to create the user_profiles row before the query succeeds.
