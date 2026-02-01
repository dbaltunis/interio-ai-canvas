
# Fix: Team Assignment Job Visibility for Staff Members

## Problem Summary

Staff members (like Daniel) who are assigned to projects via "Invite Team" cannot see their assigned jobs in the Jobs list, even though:
- ✅ Database correctly stores `is_active: true` in `project_assignments`
- ✅ RLS policies allow staff to see projects they're assigned to
- ✅ The `useMyProjectAssignments` hook returns correct data

## Root Cause Analysis

The issue is a **frontend race condition** in `JobsPage.tsx`:

```typescript
// Line 214 - Assignment data defaults to empty array
const { data: myAssignedProjectIds = [] } = useMyProjectAssignments();

// Line 217-274 - Filtering happens immediately, even before assignments load
const { filteredProjects, filteredQuotes } = useMemo(() => {
  if (!shouldFilterByAssignment || !user) {
    return { filteredProjects: allProjects, filteredQuotes: allQuotes };
  }
  
  // When myAssignedProjectIdSet is empty (still loading), ALL projects get filtered out!
  const isDirectlyAssigned = myAssignedProjectIdSet.has(project.id); // Always false
  // ...
}, [allProjects, allQuotes, allClients, shouldFilterByAssignment, user, myAssignedProjectIdSet, myAssignedProjectIds.length]);
```

**Timeline of the bug:**
1. User navigates to Jobs page
2. `myAssignedProjectIds = []` (default empty array)
3. `shouldFilterByAssignment = true` (for staff with `view_assigned_jobs`)
4. Filtering runs → `myAssignedProjectIdSet` is empty → ALL projects filtered OUT
5. Even when `myAssignedProjectIds` loads with data, the user already sees "No jobs"
6. The `useMemo` SHOULD recalculate, but there may be a React state update issue

## Solution

### Part 1: Add Loading State Guard to Filtering Logic

Extract `isLoading` from `useMyProjectAssignments` and prevent filtering until data is ready:

**File:** `src/components/jobs/JobsPage.tsx`

```typescript
// BEFORE:
const { data: myAssignedProjectIds = [] } = useMyProjectAssignments();

// AFTER:
const { data: myAssignedProjectIds = [], isLoading: assignmentsLoading } = useMyProjectAssignments();

// In the filtering useMemo:
const { filteredProjects, filteredQuotes } = useMemo(() => {
  // CRITICAL: Wait for assignment data before filtering
  // Return all data while loading to prevent flash of empty state
  if (assignmentsLoading && shouldFilterByAssignment) {
    console.log('[JOBS] Filtering - Waiting for assignment data to load');
    return { filteredProjects: allProjects, filteredQuotes: allQuotes };
  }
  
  // ... rest of filtering logic
}, [..., assignmentsLoading]);
```

### Part 2: Add Loading Indicator for Better UX

Show a loading skeleton while assignments are being fetched for staff members:

```typescript
// Add to loading conditions at line 282
if (quotesLoading || roleLoading || isDealerLoading || permissionsLoading || (shouldFilterByAssignment && assignmentsLoading)) {
  return <JobsPageSkeleton />;
}
```

### Part 3: Add refetchOnWindowFocus to useQuotes (Consistency)

Ensure quotes also refresh when user returns to the tab:

**File:** `src/hooks/useQuotes.ts`

```typescript
// Line 58-60 - Change from false to true
refetchOnWindowFocus: true,  // CHANGED: Keep sync with assignments
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/jobs/JobsPage.tsx` | Extract `isLoading` from `useMyProjectAssignments`; add loading guard to filtering logic; add to loading conditions |
| `src/hooks/useQuotes.ts` | Change `refetchOnWindowFocus` from `false` to `true` |

---

## Technical Details

### Why This Fixes the Issue

**Before Fix:**
```text
Page load → myAssignedProjectIds = [] → Filter runs immediately
  → All projects filtered OUT → Empty UI
  → Data loads (but damage already done)
```

**After Fix:**
```text
Page load → myAssignedProjectIds = [] → assignmentsLoading = true
  → Filter skips filtering, returns ALL projects
  → Data loads → assignmentsLoading = false
  → Filter runs with correct data → Staff sees assigned jobs
```

### Loading State Flow
```text
┌─────────────────────────────────────────────────────────┐
│ Page Load                                               │
├─────────────────────────────────────────────────────────┤
│ 1. assignmentsLoading = true                            │
│ 2. shouldFilterByAssignment = true (for staff)         │
│ 3. Filtering logic: Show loading OR show all projects  │
│ 4. Assignment data loads                                │
│ 5. assignmentsLoading = false                           │
│ 6. Filtering runs correctly with full data              │
│ 7. Staff sees only their assigned jobs                  │
└─────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

1. **Staff Login Test**
   - Log in as Daniel (Staff role)
   - Navigate to Jobs page
   - Verify assigned jobs appear in the list (e.g., "New Job 1/20/2026")

2. **Assignment Update Test**
   - As Admin: Assign Daniel to a new project
   - As Daniel: Switch to Jobs tab or refresh
   - Verify new project appears

3. **Removal Test**
   - As Admin: Remove Daniel from a project via "Limit Access"
   - As Daniel: Switch to Jobs tab or refresh
   - Verify removed project no longer appears

4. **Owner/Admin Test (No Regression)**
   - Log in as Owner/Admin
   - Verify ALL jobs are visible (no filtering applied)
   - Verify no performance regression

5. **Page Refresh Test**
   - As Staff: Hard refresh the Jobs page
   - Verify jobs appear immediately (no empty flash)

