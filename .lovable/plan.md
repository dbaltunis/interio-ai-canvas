
# Fix Job Delegation and Status Locking

## Problem Summary

### Issue 1: Job Delegation Not Working
The Project Team UI exists (`ProjectTeam.tsx`) but uses **hardcoded mock data**. There's no database table to store user-to-project assignments, so when you "assign" team members, it's lost on page refresh.

### Issue 2: Status Locking Not Enforced
The status system has actions like `locked`, `completed`, and `view_only` defined, but they're not enforced:

| Component | Current Behavior | Expected |
|-----------|-----------------|----------|
| ProjectOverview.tsx | Partially checks status | OK |
| WindowManagementDialog.tsx | `readOnly={false}` hardcoded | Should respect status |
| useCreateRoom | No check | Should prevent creation when locked |
| useUpdateRoom | No check | Should prevent updates when locked |
| useDeleteRoom | No check | Should prevent deletion when locked |
| useSurfaces (CRUD) | No check | Should respect status |
| useTreatments (CRUD) | No check | Should respect status |
| DynamicWindowWorksheet | Has `readOnly` prop but never receives true | Should receive lock state |

---

## Solution Part 1: Project Assignments Database

### New Table: `project_assignments`

```sql
CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(project_id, user_id)
);

-- RLS policies
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Users can see assignments for projects they own or are assigned to
CREATE POLICY "project_assignments_select" ON public.project_assignments
FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
  OR user_id = auth.uid()
);

-- Only project owners can manage assignments
CREATE POLICY "project_assignments_insert" ON public.project_assignments
FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);

CREATE POLICY "project_assignments_update" ON public.project_assignments
FOR UPDATE USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);

CREATE POLICY "project_assignments_delete" ON public.project_assignments
FOR DELETE USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);
```

### New Hook: `useProjectAssignments.ts`

```typescript
// Provides: 
// - useProjectAssignments(projectId) - list assigned users
// - useAssignUserToProject() - mutation to add user
// - useRemoveUserFromProject() - mutation to remove
// - useIsUserAssigned(projectId, userId) - check if user has access
```

### Update `ProjectTeam.tsx`

Replace mock data with real database queries using the new hook. Persist assignments to `project_assignments` table.

---

## Solution Part 2: Status Lock Enforcement

### Step 1: Create Shared Context/Provider

**New file:** `src/contexts/ProjectStatusContext.tsx`

```typescript
interface ProjectStatusContextValue {
  projectId: string | null;
  statusId: string | null;
  canEdit: boolean;
  isLocked: boolean;
  isViewOnly: boolean;
  statusAction: string;
  checkAndWarn: (action: string) => boolean; // Shows toast if locked
}
```

### Step 2: Wrap Project Pages with Context

The context provider fetches status permissions once and shares them to all child components. This prevents multiple queries and ensures consistency.

### Step 3: Update WindowManagementDialog

```typescript
// BEFORE
readOnly={false}

// AFTER  
const { canEdit, isLocked, checkAndWarn } = useProjectStatus();
// ...
readOnly={!canEdit || isLocked}
```

### Step 4: Update All Mutation Hooks

Create a helper that wraps mutations with status checks:

```typescript
// src/hooks/useStatusProtectedMutation.ts
export const useStatusProtectedMutation = <TData, TVariables>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  getProjectId: (vars: TVariables) => string
) => {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const projectId = getProjectId(variables);
      const status = await checkProjectStatus(projectId);
      
      if (status.isLocked || !status.canEdit) {
        throw new Error(`Cannot modify: Project is ${status.statusAction}`);
      }
      
      return mutationFn(variables);
    }
  });
};
```

### Step 5: Update Individual Hooks

| Hook | Change |
|------|--------|
| `useCreateRoom` | Add project status check before insert |
| `useUpdateRoom` | Add project status check before update |
| `useDeleteRoom` | Add project status check before delete |
| `useCreateSurface` | Add project status check |
| `useUpdateSurface` | Add project status check |
| `useDeleteSurface` | Add project status check |
| `useCreateTreatment` | Add project status check |
| `useUpdateTreatment` | Add project status check |
| `useDeleteTreatment` | Add project status check |

### Step 6: Visual Indicators

Update worksheet components to show locked state:

```typescript
// Show banner when project is locked
{isLocked && (
  <Alert variant="warning" className="mb-4">
    <Lock className="h-4 w-4" />
    <AlertTitle>Project Locked</AlertTitle>
    <AlertDescription>
      This project is in "{statusName}" status and cannot be edited.
    </AlertDescription>
  </Alert>
)}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useProjectAssignments.ts` | CRUD for project_assignments table |
| `src/contexts/ProjectStatusContext.tsx` | Shared status state for project pages |
| `src/hooks/useStatusProtectedMutation.ts` | Helper for status-checked mutations |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/projects/ProjectTeam.tsx` | Replace mock data with database queries |
| `src/components/job-creation/WindowManagementDialog.tsx` | Pass status-based readOnly prop |
| `src/hooks/useRooms.ts` | Add status checks to mutations |
| `src/hooks/useSurfaces.ts` | Add status checks to mutations |
| `src/hooks/useTreatments.ts` | Add status checks to mutations |
| `src/components/measurements/DynamicWindowWorksheet.tsx` | Add locked banner UI |
| `src/components/job-creation/JobCreationWizard.tsx` | Wrap with status context |

---

## Expected Behavior After Fix

### Job Delegation
1. Admin opens project → Team tab
2. Clicks "Add Member" → selects user from dropdown
3. Assignment persists to `project_assignments` table
4. Assigned users can see the project in their list
5. Removing assignment revokes access

### Status Locking
1. Admin sets project status to "Completed" (action: `completed`)
2. All edit buttons become disabled/hidden
3. Worksheet opens in read-only mode with lock banner
4. Attempting to save shows toast: "Project is locked in Completed status"
5. Room/Surface/Treatment creation blocked with error message

---

## Visual Mockup: Locked Project

```text
┌─────────────────────────────────────────────────────────────┐
│ 🔒 PROJECT LOCKED                                           │
│ This project is in "Completed" status and cannot be edited. │
│ Contact an admin if you need to make changes.               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Window: Master Bedroom - Bay Window                         │
│ Status: Completed ✓                                         │
├─────────────────────────────────────────────────────────────┤
│ [Window Type]  [Treatment]  [Library]  [Measurements]       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Curtains - ADARA Sheer                                  │ │
│ │ Width: 2400mm  Height: 2100mm                           │ │
│ │ Total: $1,245.00                                        │ │
│ │                                                         │ │
│ │ [View Details]  [Save] ← disabled/hidden                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **Database**: Create `project_assignments` table with RLS
2. **Hook**: `useProjectAssignments.ts` for CRUD operations
3. **Component**: Update `ProjectTeam.tsx` to use real data
4. **Context**: Create `ProjectStatusContext.tsx`
5. **Helper**: Create `useStatusProtectedMutation.ts`
6. **Mutations**: Update room/surface/treatment hooks with status checks
7. **UI**: Update `WindowManagementDialog` and worksheet components
8. **Testing**: Verify lock behavior across all project statuses
