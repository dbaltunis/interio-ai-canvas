
# Fix: Staff Users Can't Edit Jobs (Permission Check Bug)

## Problem Found

The "Permission needed" message is appearing because there's a **bug in the job edit permission check**. Here's what's happening:

### Root Cause
The `useJobEditPermissions.ts` hook checks permissions **only from the database**, ignoring the role-based default permissions defined in `constants/permissions.ts`.

- The Staff role has `edit_assigned_jobs` in its default permissions (this is correct)
- But `useCanEditJob` fetches from the `user_permissions` table directly, which may be empty for Staff users
- Since there are no explicit DB records, the hook returns `canEditJob: false`

### Why It Broke
This likely worked before because either:
1. Staff users had explicit permission records in the database
2. Or the permission check was using a different approach that included role-based defaults

## Technical Details

**Current broken logic in `useJobEditPermissions.ts`:**
```text
1. Fetch user_permissions table for user → returns []
2. Check if user is Owner → No (Staff)
3. hasAnyExplicitPermissions = 0 > 0 = false
4. canEditAssignedJobs = isOwner && !hasAnyExplicitPermissions = false
5. Result: canEditJob = false ❌
```

**Correct logic should be:**
```text
1. Get role-based permissions (Staff has edit_assigned_jobs)
2. Add any custom database permissions on top
3. Check if edit_assigned_jobs exists in merged set → YES
4. Result: canEditJob = true ✅
```

## Solution

Refactor `useJobEditPermissions.ts` to use the unified permission system instead of querying the database directly:

### Step 1: Update the Hook to Use Unified Permissions
Replace direct database queries with the `useHasPermission` hook that already handles role+custom permission merging correctly.

### Step 2: Simplify the Logic
The hook will check:
- `useHasPermission('edit_all_jobs')` → can edit any job
- `useHasPermission('edit_assigned_jobs')` → can edit assigned jobs only

### Step 3: Keep Assignment Check Logic
When only `edit_assigned_jobs` is granted, verify the user is assigned to the specific project/client.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useJobEditPermissions.ts` | Refactor to use `useHasPermission` instead of direct DB query |

## Expected Outcome

After this fix:
- Staff users will be able to add rooms, windows, and treatments to jobs assigned to them
- The role-based default permissions will be respected
- Custom permission overrides will still work for accounts that need them

## No Database Changes Required

This is purely a frontend logic fix - the permission constants are already correct.
