
# Plan: Fix Team Assignment Job Visibility for Staff Members

## Problem Summary

Staff members assigned to jobs via the "Invite team" workflow cannot see their assigned jobs in the Jobs list, despite:
- Correct database assignment in `project_assignments` table
- Correct RLS policies that include `user_is_assigned_to_project()` check
- `view_assigned_jobs` permission properly granted

## Root Cause Analysis

After comprehensive investigation, I identified **TWO issues**:

### Issue 1: Redundant Project Fetching in JobsTableView

In `src/components/jobs/JobsTableView.tsx` (line 83), the component fetches its own projects:
```typescript
const { data: allProjects = [] } = useProjects();
```

This creates a redundant query and potential data inconsistency with the filtered data passed from parent (`JobsPage`).

### Issue 2: Missing `isSystemOwner` Check in shouldFilterByAssignment

In `src/components/jobs/JobsPage.tsx` (line 147):
```typescript
const shouldFilterByAssignment = (!isOwner || hasAnyExplicitPermissions) && !hasViewAllJobsPermission && hasViewAssignedJobsPermission;
```

This is missing the `!userRoleData?.isSystemOwner` check that exists in `JobDetailPage.tsx` (line 147), leading to inconsistent behavior between the list and detail views.

### Issue 3: Race Condition with Dealer Loading State

When `isDealerLoading` is true, `allProjects` returns an empty array even if projects are already loaded, causing temporary visibility issues.

---

## Solution

### Fix 1: Add Missing `isSystemOwner` Check

Update `JobsPage.tsx` line 147 to match `JobDetailPage.tsx`:

**Before:**
```typescript
const shouldFilterByAssignment = (!isOwner || hasAnyExplicitPermissions) && !hasViewAllJobsPermission && hasViewAssignedJobsPermission;
```

**After:**
```typescript
const shouldFilterByAssignment = !userRoleData?.isSystemOwner && (!isOwner || hasAnyExplicitPermissions) && !hasViewAllJobsPermission && hasViewAssignedJobsPermission;
```

### Fix 2: Remove Redundant Project Fetching in JobsTableView

Remove the local `useProjects()` call in `JobsTableView.tsx` since the parent already provides filtered data:

**Before (lines 82-88):**
```typescript
const { data: allQuotes = [], isLoading, refetch } = useQuotes();
const { data: allProjects = [] } = useProjects();

// Use filtered data if provided, otherwise use all data
const quotes = filteredQuotes !== undefined ? filteredQuotes : allQuotes;
const projects = filteredProjects !== undefined ? filteredProjects : allProjects;
```

**After:**
```typescript
// CRITICAL: Parent component handles permission-based filtering
// When filteredProjects/filteredQuotes are undefined, fetch all data
// When defined, use the filtered data to respect permissions
const { data: allQuotes = [], isLoading, refetch } = useQuotes(undefined, {
  enabled: filteredQuotes === undefined
});
const { data: allProjectsData = [] } = useProjects({
  enabled: filteredProjects === undefined
});

// Use filtered data if provided (permission-based), otherwise use fetched data
const quotes = filteredQuotes !== undefined ? filteredQuotes : allQuotes;
const projects = filteredProjects !== undefined ? filteredProjects : allProjectsData;
```

### Fix 3: Handle Race Condition with Dealer Loading

Update the `allProjects` useMemo to not return empty during loading if data is available:

**Before (lines 202-209):**
```typescript
const allProjects = useMemo(() => {
  if (isDealerLoading) return [];
  if (isDealer === true) return dealerProjects;
  return regularProjects;
}, [isDealerLoading, isDealer, dealerProjects, regularProjects]);
```

**After:**
```typescript
const allProjects = useMemo(() => {
  // If still loading dealer status AND we have no projects yet, return empty
  // But if we already have regularProjects data, use it while loading finishes
  if (isDealer === true) return dealerProjects;
  // For non-dealers (including while loading), use regularProjects
  // This prevents flash of empty state when dealer check is slow
  return regularProjects;
}, [isDealer, dealerProjects, regularProjects]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/JobsPage.tsx` | Add `!userRoleData?.isSystemOwner` to `shouldFilterByAssignment` and fix dealer loading race condition |
| `src/components/jobs/JobsTableView.tsx` | Conditionally fetch projects only when filtered data not provided |

---

## Technical Details

### Why the Current Code Fails

1. **JobsPage** fetches projects via `useProjects()` which correctly respects RLS
2. **JobsPage** also fetches `myAssignedProjectIds` via `useMyProjectAssignments()`
3. For staff users with `shouldFilterByAssignment=true`, both are used to filter the list
4. The filtered list is passed to **JobsTableView** as `filteredProjects`
5. **BUT** JobsTableView ALSO fetches its own `useProjects()`, potentially getting different data
6. The conditional `projects = filteredProjects !== undefined ? filteredProjects : allProjects` uses parent data when provided
7. However, the redundant fetch wastes resources and can cause confusion during debugging

### Why RLS Works but Frontend Doesn't Show Data

The RLS correctly returns projects for assigned users. The issue is:
1. The frontend filtering logic runs AFTER RLS
2. If `myAssignedProjectIds` is empty (query not yet complete), `isDirectlyAssigned` is false for all projects
3. Combined with the race condition in dealer loading, this causes an empty list

---

## Documentation Requirement

**CRITICAL**: This is the third time this visibility issue has occurred. After implementing this fix, create a memory architecture document to prevent recurrence:

```
# Memory: architecture/team-assignment-job-visibility-complete

The team assignment visibility system involves THREE layers that MUST all work together:

1. **RLS Layer (Database)**: 
   - `projects_select_policy` includes `user_is_assigned_to_project(id)` check
   - Staff with `view_assigned_jobs` permission can SELECT projects they're assigned to

2. **Hook Layer (Frontend Data)**:
   - `useProjects()` respects RLS and returns correct data
   - `useMyProjectAssignments()` fetches assigned project IDs for frontend filtering

3. **Component Layer (UI Logic)**:
   - `shouldFilterByAssignment` MUST include `!userRoleData?.isSystemOwner` check
   - Filtering uses `myAssignedProjectIdSet.has(project.id)` for `isDirectlyAssigned`
   - Child components should NOT re-fetch data that parent already provides

COMMON BUG PATTERNS TO AVOID:
- Inconsistent `shouldFilterByAssignment` logic between JobsPage and JobDetailPage
- Redundant data fetching in child components overriding parent's filtered data
- Race conditions with loading states causing empty arrays
```

---

## Testing Checklist

After implementation:

1. **Staff Visibility Test**:
   - Log in as a Staff user with `view_assigned_jobs` permission
   - Have an Owner assign the Staff to a project via "Invite team"
   - Verify the project appears in the Staff's Jobs list immediately
   - Click on the project - verify it opens without "Access Denied"

2. **No Regression for Owners**:
   - Log in as Owner - verify they see all projects
   - Verify no duplicate projects appear

3. **No Regression for Admins**:
   - Log in as Admin - verify they see all projects in their account
