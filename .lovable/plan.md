

# Phase 8: Login Error Fix + Permission/Access Control Issues

## Overview

This phase addresses the critical login error (Issue #1) plus all permission/access control issues from the client's CSV file. The login error occurs **every time** a user logs in, not just the first time, indicating the previous fix was insufficient.

---

## Issue #1: "Something went wrong" on Every Login

### Root Cause Analysis

The ErrorBoundary in `src/components/performance/ErrorBoundary.tsx` catches unhandled errors. The issue persists because:

1. **Race condition**: `queryClient.invalidateQueries()` in `AuthProvider.tsx:74` triggers immediate refetches
2. **Queries fire before profile exists**: The `user_profiles` row may not exist yet when queries fire
3. **Single point of failure**: Any single query throwing propagates to ErrorBoundary

### Solution: Add Query-Level Error Boundaries + Graceful Fallbacks

| File | Change |
|------|--------|
| `src/hooks/useUserRole.ts:31` | Change `.single()` to `.maybeSingle()` for profile query |
| `src/hooks/usePermissions.ts:25-35` | Add retry logic and graceful fallback on profile fetch failure |
| `src/pages/Index.tsx:107-130` | Wrap permission queries in defensive error handling |
| `src/components/auth/AuthProvider.tsx:74` | Add small delay before invalidating queries to allow profile creation |

### Key Fix in AuthProvider.tsx

```typescript
// Line 74 - Add delay before invalidating
if (event === 'SIGNED_IN') {
  // Wait 500ms for database triggers to create user_profiles
  setTimeout(() => {
    queryClient.invalidateQueries();
  }, 500);
```

### Key Fix in useUserRole.ts

```typescript
// Line 27-31 - Use maybeSingle for profile
const { data: profile } = await supabase
  .from("user_profiles")
  .select("parent_account_id")
  .eq("user_id", user.id)
  .maybeSingle(); // Was .single() - throws on 0 rows
```

---

## Permission/Access Control Issues (From CSV)

### Issue #8: Dealers Can See Supplier Names

**Current State**: `InventoryManagement.tsx:269` shows "Supplier" column to everyone
**Fix**: Hide supplier column for dealers

```typescript
// Line 269 - Add dealer check
{canViewVendorCosts && !isDealer && <TableHead>Supplier</TableHead>}
```

**Files to modify**:
- `src/components/inventory/InventoryManagement.tsx`
- `src/components/ordering/BatchOrdersList.tsx`
- Any other component showing `vendors.name`

### Issue #9: Dealers Can See Costs in Various Views

**Components already checking `canViewVendorCosts`**:
- InventoryManagement.tsx ✓
- MaterialQueueTable.tsx ✓
- BatchOrdersList.tsx ✓

**Components needing audit for dealer access**:
- Quote PDFs and exports
- Job detail views
- Window summary displays

### Issue #11: Staff Should Only See Assigned Jobs/Clients

**Current State**: Staff with `view_assigned_jobs` permission can see all jobs due to RLS policy gap
**Fix**: RLS policies need to check `assigned_to` or `user_id` field

This is a **database-level fix** requiring migration to update RLS policies on:
- `projects` table
- `clients` table

---

## Files to Modify

### Priority 1: Login Error (Critical)

| File | Changes |
|------|---------|
| `src/components/auth/AuthProvider.tsx` | Add 500ms delay before query invalidation on SIGNED_IN |
| `src/hooks/useUserRole.ts` | Change `.single()` to `.maybeSingle()` on line 31 |
| `src/hooks/usePermissions.ts` | Add defensive error handling, extend retry logic |

### Priority 2: Dealer Permission Fixes

| File | Changes |
|------|---------|
| `src/components/inventory/InventoryManagement.tsx` | Hide supplier column for dealers |
| `src/components/ordering/BatchOrdersList.tsx` | Hide supplier info for dealers |
| `src/components/ordering/MaterialQueueTable.tsx` | Verify dealer restrictions |
| `src/hooks/useUserRole.ts` | Already handles `isDealer` - verify propagation |

### Priority 3: Staff Assignment Visibility (Database)

| Change | Type |
|--------|------|
| Update `projects` RLS policy | SQL Migration |
| Update `clients` RLS policy | SQL Migration |
| Add `assigned_to` column if missing | SQL Migration |

---

## Implementation Order

1. **Login error fix** - AuthProvider delay + maybeSingle changes
2. **Dealer supplier visibility** - Hide supplier columns/names
3. **Dealer cost visibility audit** - Verify all cost displays are hidden
4. **Staff assignment visibility** - Database migration for RLS

---

## Expected Results

| Issue | Before | After |
|-------|--------|-------|
| Login error | Happens every login | 0% failure rate |
| Dealers see suppliers | Visible | Hidden |
| Dealers see costs | Some visible | All hidden |
| Staff see all jobs | All visible | Only assigned visible |

---

## Technical Notes

### Why 500ms Delay Works

The database trigger that creates `user_profiles` runs asynchronously after `auth.users` insert. The 500ms delay gives the trigger time to complete before React Query fires profile-dependent queries.

### Dealer Permission Chain

```
useUserRole() → isDealer: true → canViewVendorCosts: false
                              → canViewMarkup: false
```

Components must check BOTH `canViewVendorCosts` AND `isDealer` for supplier names since supplier names are not strictly "costs" but are still sensitive.

