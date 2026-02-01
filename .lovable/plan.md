

# Plan: Fix Team Assignment Visibility Bug

## Problem Summary

Team members assigned to projects via the "Invite team" workflow are **not seeing the jobs** in their Jobs list, even though:
- The assignment is correctly saved to `project_assignments` table
- RLS policy correctly includes `user_is_assigned_to_project(id)` check
- User has `view_assigned_jobs` permission

## Root Cause

**Frontend filtering ignores `project_assignments` table entirely.** 

Both `JobsPage.tsx` and `JobDetailPage.tsx` have a filtering mechanism that removes projects from view unless:
1. User created the project (`project.user_id === user.id`), OR
2. User is assigned to the client (`client.assigned_to === user.id`)

The team assignment system uses `project_assignments` table, but this table is **never checked** in the frontend filtering logic.

## Technical Details

### Current (Broken) Logic in JobsPage.tsx

```typescript
// Lines 229-244 - WRONG
const assignedProjects = allProjects.filter((project) => {
  const isCreatedByUser = project.user_id === user.id;
  const isClientAssignedToUser = project.client_id && assignedClientIds.has(project.client_id);
  return isCreatedByUser || isClientAssignedToUser; // ❌ Missing project_assignments check!
});
```

### Same Issue in JobDetailPage.tsx

```typescript
// Lines 248-255 - WRONG
const isCreatedByUser = project.user_id === user.id;
const isClientAssignedToUser = client?.assigned_to === user.id;
const isAssigned = isCreatedByUser || isClientAssignedToUser; // ❌ Missing project_assignments check!
```

## Solution

### Step 1: Add hook to fetch user's project assignments

Create a new hook that fetches all projects the current user is assigned to:

```typescript
// src/hooks/useMyProjectAssignments.ts
export const useMyProjectAssignments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-project-assignments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("project_assignments")
        .select("project_id")
        .eq("user_id", user.id)
        .eq("is_active", true);
      
      if (error) throw error;
      return data?.map(a => a.project_id) || [];
    },
    enabled: !!user,
  });
};
```

### Step 2: Update JobsPage.tsx filtering

Modify the filtering logic to include project assignments:

```typescript
// Add import
import { useMyProjectAssignments } from "@/hooks/useMyProjectAssignments";

// Fetch assigned project IDs
const { data: myAssignedProjectIds = [] } = useMyProjectAssignments();
const assignedProjectIdSet = new Set(myAssignedProjectIds);

// Update filtering logic (lines 229-244)
const assignedProjects = allProjects.filter((project) => {
  const isCreatedByUser = project.user_id === user.id;
  const isClientAssignedToUser = project.client_id && assignedClientIds.has(project.client_id);
  const isDirectlyAssigned = assignedProjectIdSet.has(project.id); // ✅ NEW CHECK
  return isCreatedByUser || isClientAssignedToUser || isDirectlyAssigned;
});
```

### Step 3: Update JobDetailPage.tsx access check

Modify the access check to include project assignments:

```typescript
// Add import
import { useIsUserAssigned } from "@/hooks/useProjectAssignments";

// Check if user is directly assigned to this project
const { data: isDirectlyAssigned = false } = useIsUserAssigned(project?.id, user?.id);

// Update access check (lines 248-255)
const isCreatedByUser = project.user_id === user.id;
const isClientAssignedToUser = client?.assigned_to === user.id;
const isAssigned = isCreatedByUser || isClientAssignedToUser || isDirectlyAssigned; // ✅ NEW CHECK
```

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useMyProjectAssignments.ts` | NEW FILE - Hook to get current user's project assignments |
| `src/components/jobs/JobsPage.tsx` | Add project_assignments check to filtering logic |
| `src/components/jobs/JobDetailPage.tsx` | Add project_assignments check to access validation |

## Testing Checklist

1. **Assignment Flow**
   - As Owner, go to Jobs > select a job > Actions > Invite Team
   - Assign a Staff user to the project
   - Verify notification appears for Staff user

2. **Staff Visibility**
   - Log in as Staff user with `view_assigned_jobs` permission
   - Verify assigned project appears in Jobs list
   - Click on the project - verify it opens (not "Access Denied")

3. **Edge Cases**
   - Staff should NOT see projects they're not assigned to
   - Removing assignment should hide project from Staff
   - Re-assigning should restore visibility

