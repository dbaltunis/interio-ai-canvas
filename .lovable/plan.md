

# Plan: Fix Team Assignment Cache Invalidation + Document for Future Prevention

## Problem Summary

When an admin removes a staff member from a project via "Limit Access":
1. ✅ Database correctly updates `is_active = false` in `project_assignments`
2. ✅ RLS correctly filters projects for assigned staff
3. ❌ Staff member's browser cache still shows the old assignment data
4. ❌ Project stays visible because cached `my-project-assignments` is stale

This is why you see the team count decrease (admin's view updates) but the staff member still sees the job.

---

## Solution: 4 File Changes

### 1. Add Cache Invalidation to `useAssignUserToProject`

**File:** `src/hooks/useProjectAssignments.ts` (lines 244-253)

Add two new invalidation calls so that when a team member is assigned, all visibility queries refresh:

```typescript
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ["project-assignments", data.project_id] });
  queryClient.invalidateQueries({ queryKey: ["projects-with-assignments"] });
  queryClient.invalidateQueries({ queryKey: ["project-activity-log", data.project_id] });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  // NEW: Invalidate assignment-based visibility queries
  queryClient.invalidateQueries({ queryKey: ["my-project-assignments"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  toast({ title: "Success", description: "Team member assigned to project" });
},
```

### 2. Add Cache Invalidation to `useRemoveUserFromProject`

**File:** `src/hooks/useProjectAssignments.ts` (lines 331-339)

Add the same invalidations for removal:

```typescript
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ["project-assignments", data.projectId] });
  queryClient.invalidateQueries({ queryKey: ["projects-with-assignments"] });
  queryClient.invalidateQueries({ queryKey: ["project-activity-log", data.projectId] });
  // NEW: Invalidate assignment-based visibility queries
  queryClient.invalidateQueries({ queryKey: ["my-project-assignments"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  toast({ title: "Success", description: "Team member removed from project" });
},
```

### 3. Enable Auto-Refresh for Assignment Data

**File:** `src/hooks/useMyProjectAssignments.ts` (lines 29-32)

Enable automatic refresh when user returns to the app tab:

```typescript
return data?.map(a => a.project_id) || [];
},
enabled: !!user,
staleTime: 30 * 1000,
// NEW: Auto-refresh to keep visibility in sync
refetchOnWindowFocus: true,
refetchOnMount: true,
```

### 4. Enable Auto-Refresh for Projects List

**File:** `src/hooks/useProjects.ts` (line 39)

Change `refetchOnWindowFocus: false` to `true`:

```typescript
enabled: enabled && !!effectiveOwnerId,
staleTime: 2 * 60 * 1000,
gcTime: 5 * 60 * 1000,
refetchOnWindowFocus: true,  // CHANGED from false
retry: 1,
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useProjectAssignments.ts` | Add cache invalidations in both `useAssignUserToProject` and `useRemoveUserFromProject` |
| `src/hooks/useMyProjectAssignments.ts` | Add `refetchOnWindowFocus: true` and `refetchOnMount: true` |
| `src/hooks/useProjects.ts` | Change `refetchOnWindowFocus` from `false` to `true` |

---

## Technical Details: How This Fixes the Issue

### Current Flow (Broken)
```text
Admin removes Daniel from Project
  → Admin's cache updates (team count -1)
  → Daniel's cache is STALE (still shows access)
  → Daniel sees project in list
  → Daniel clicks → sees content
  → Only page refresh removes it
```

### Fixed Flow
```text
Admin removes Daniel from Project
  → Admin's cache updates (team count -1)
  → Daniel switches to tab or navigates
  → refetchOnWindowFocus triggers my-project-assignments refetch
  → Fresh data shows is_active=false
  → Project filtered from view
```

---

## Documentation (Memory Update)

After implementation, the existing memory `architecture/team-assignment-job-visibility-logic` will be updated to include:

```text
Common bug patterns to avoid:
- Missing cache invalidation for ["my-project-assignments"] when assignments change
- refetchOnWindowFocus: false on visibility-critical queries
- Race conditions with loading states causing empty arrays
- Child components re-fetching data that parent already provides filtered
```

---

## Testing Checklist

1. **Remove Assignment Test**
   - Log in as Admin in one browser
   - Log in as Staff (Daniel) in another browser
   - Admin: Remove Daniel via "Limit Access"
   - Verify: Admin sees team count decrease
   - Daniel: Switch tabs or refresh
   - Verify: Project disappears from Daniel's Jobs list

2. **Add Assignment Test**
   - Admin: Add Daniel to a project via "Invite Team"
   - Daniel: Switch tabs or refresh
   - Verify: Project appears in Daniel's Jobs list

3. **No Regression**
   - Owner still sees all projects
   - Admin still sees all projects

