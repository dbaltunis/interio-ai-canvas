
# Plan: Fix React Hooks Violation in JobDetailPage.tsx

## Problem Identified

The app is crashing with **React Error #310: "Rendered fewer hooks than expected"**. This is a critical Rules of Hooks violation.

## Root Cause

In `src/components/jobs/JobDetailPage.tsx`, the `useIsUserAssigned` hook (line 246) is being called **after** conditional returns:

```typescript
// Line 221: Early return for loading
if (projectLoading || permissionsLoading || ...) {
  return <JobSkeleton />;  // ❌ Hook below this is skipped!
}

// Line 226: Early return for no permission  
if (!canViewJobsExplicit) {
  return <div>Access Denied</div>;  // ❌ Hook below this is skipped!
}

// Line 246: Hook called AFTER conditional returns - VIOLATION!
const { data: isDirectlyAssigned = false } = useIsUserAssigned(project?.id, user?.id);
```

This causes:
- First render: Loading is true → Returns early → `useIsUserAssigned` NOT called
- Second render: Loading is false → Passes checks → `useIsUserAssigned` IS called

React sees different number of hooks between renders = Error #310.

## Fix

Move the `useIsUserAssigned` hook call to **before any conditional returns**, alongside other hooks at the top of the component:

```
Line 62: import { useIsUserAssigned } from "@/hooks/useProjectAssignments";
...
Line ~183-191: Other hooks (useProject, useClients, etc.)
Line ~192: ADD: const { data: isDirectlyAssigned = false } = useIsUserAssigned(jobId, user?.id);
...
Line 221: Loading check (now safe - hook already called)
Line 226: Permission check (now safe - hook already called)
Line 253: Assignment check (uses isDirectlyAssigned from hook above)
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/JobDetailPage.tsx` | Move `useIsUserAssigned` hook call to line ~192 (before any conditional returns) |

## Technical Details

The hook should be called with `jobId` instead of `project?.id` since `jobId` is always available as a prop, while `project` may not be loaded yet:

```typescript
// Move from line 246 to line ~192 (before the loading check)
const { data: isDirectlyAssigned = false } = useIsUserAssigned(jobId, user?.id);
```

Then remove line 246 entirely and use the moved declaration at line 260 where `isDirectlyAssigned` is used.
