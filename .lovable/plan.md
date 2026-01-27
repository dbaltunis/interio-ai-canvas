

# Complete Status Locking and Remove Progress Only

## Problem Analysis

### Issue 1: "Progress Only" Status is Unclear
The user wants to remove the "Progress Only" action type from the dropdown since its purpose is unclear and confusing.

### Issue 2: Status Locking Still Not Working
Despite adding status checks to mutation hooks, the locking is not working because:

1. **ProjectStatusProvider is never used**: The context provider was created but never wraps any component
2. **ProjectLockedBanner is never rendered**: The visual indicator component exists but isn't used anywhere
3. **WindowManagementDialog has hardcoded `readOnly={false}`**: Line 728 bypasses status checks in the UI
4. **UI buttons are not disabled**: Components like `StreamlinedJobsInterface`, `RoomCard`, and `RoomsGrid` don't check status before rendering action buttons

## Current Status Flow

```text
Status Actions:
┌─────────────────────────────────────────────────────┐
│ editable       → Full editing allowed               │
│ view_only      → No status change, view only        │
│ locked         → Final state, no changes            │
│ progress_only  → UNCLEAR - REMOVE THIS              │
│ completed      → Final + sets completion date       │
│ requires_reason→ Needs note when setting            │
└─────────────────────────────────────────────────────┘

Current Enforcement:
┌─────────────────────────────────────────────────────┐
│ useRooms.ts        ✅ Has checkProjectStatusAsync   │
│ useSurfaces.ts     ✅ Has checkProjectStatusAsync   │
│ useTreatments.ts   ✅ Has checkProjectStatusAsync   │
│ ProjectStatusProvider ❌ Created but never used     │
│ ProjectLockedBanner   ❌ Created but never rendered │
│ WindowManagementDialog❌ readOnly={false} hardcoded │
│ UI Action Buttons     ❌ Not disabled when locked   │
└─────────────────────────────────────────────────────┘
```

## Solution

### Part 1: Remove "Progress Only" from Action Behaviors

**File: `src/components/settings/StatusSlotManager.tsx`**
- Remove `progress_only` from the Select options (line 262)
- Update DEFAULT_STATUS_TEMPLATES to use `editable` instead of `progress_only`

**File: `src/lib/statusActions.ts`**
- Remove `PROGRESS_ONLY` from `STATUS_ACTIONS` constant
- Update documentation

**File: `src/contexts/ProjectStatusContext.tsx`**
- Remove `progress_only` from canEdit logic - only `editable` should allow editing
- Update `checkProjectStatusAsync` similarly

**File: `src/hooks/useStatusPermissions.ts`**
- Remove `progress_only` from canEdit logic

**File: `src/components/settings/SeedJobStatuses.tsx`**
- Update DEFAULT_STATUSES to use `editable` instead of `progress_only`

### Part 2: Wire Up ProjectStatusProvider

**File: `src/components/job-creation/ProjectTabContent.tsx`** (or main project page wrapper)
- Wrap content with `ProjectStatusProvider`

```typescript
import { ProjectStatusProvider } from "@/contexts/ProjectStatusContext";

// In render:
<ProjectStatusProvider projectId={project?.id}>
  {/* existing content */}
</ProjectStatusProvider>
```

### Part 3: Add Visual Locked Banner

**File: Main project layout component**
- Import and render `ProjectLockedBanner` at the top of project pages

```typescript
import { ProjectLockedBanner } from "@/components/projects/ProjectLockedBanner";

// In render, after header:
<ProjectLockedBanner className="mb-4" />
```

### Part 4: Fix WindowManagementDialog readOnly

**File: `src/components/job-creation/WindowManagementDialog.tsx`**
- Import `useStatusPermissions` hook
- Replace `readOnly={false}` with dynamic status check

```typescript
import { useStatusPermissions } from "@/hooks/useStatusPermissions";

// Inside component:
const { data: project } = useQuery({...}); // Already fetching surface
const statusPermissions = useStatusPermissions(surface?.project?.status_id);
const isReadOnly = !statusPermissions.data?.canEdit || statusPermissions.data?.isLocked || statusPermissions.data?.isViewOnly;

// In MeasurementBridge:
<MeasurementBridge
  readOnly={isReadOnly}
  ...
/>
```

### Part 5: Disable UI Action Buttons When Locked

**File: `src/components/job-creation/RoomsGrid.tsx`**
**File: `src/components/job-creation/StreamlinedJobsInterface.tsx`**
**File: `src/components/job-creation/RoomCard.tsx`**
**File: `src/components/job-creation/SurfaceCreationButtons.tsx`**

For each component that has "Add Room", "Add Window", or action buttons:
- Import `useStatusPermissions`
- Check status before rendering/enabling buttons
- Show visual indicator (lock icon, disabled state)

```typescript
const statusPermissions = useStatusPermissions(project?.status_id);
const canModify = statusPermissions.data?.canEdit && !statusPermissions.data?.isLocked;

// In buttons:
<Button 
  onClick={handleAddRoom} 
  disabled={!canModify}
  title={!canModify ? "Project is locked" : undefined}
>
  {!canModify && <Lock className="h-4 w-4 mr-2" />}
  Add Room
</Button>
```

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/statusActions.ts` | Remove PROGRESS_ONLY |
| `src/contexts/ProjectStatusContext.tsx` | Remove progress_only from canEdit logic |
| `src/hooks/useStatusPermissions.ts` | Remove progress_only from canEdit logic |
| `src/components/settings/StatusSlotManager.tsx` | Remove progress_only option, update templates |
| `src/components/settings/SeedJobStatuses.tsx` | Update default statuses |
| `src/components/job-creation/WindowManagementDialog.tsx` | Dynamic readOnly based on status |
| `src/components/job-creation/ProjectTabContent.tsx` | Wrap with ProjectStatusProvider, add banner |
| `src/components/job-creation/RoomsGrid.tsx` | Disable buttons when locked |
| `src/components/job-creation/StreamlinedJobsInterface.tsx` | Disable buttons when locked |
| `src/components/job-creation/RoomCard.tsx` | Disable actions when locked |
| `src/pages/Documentation.tsx` | Update references to progress_only |

## Migration for Existing Data

For accounts that already have statuses with `progress_only` action:
- They will continue to work (treated as editable for backwards compatibility)
- Users can manually update them to `editable` in settings

## Expected Behavior After Fix

| Status Action | Can Edit | Status Change | Visual |
|---------------|----------|---------------|--------|
| editable | Yes | Yes | Normal |
| view_only | No | No | Yellow banner |
| locked | No | No | Red banner + Lock icons |
| completed | No | No | Red banner + Lock icons |
| requires_reason | Yes (with note) | Yes | Normal |

### User Experience Flow

1. **Admin sets status to "Completed" or "Locked"**
2. **Visual feedback**: Red banner appears at top of project page
3. **Buttons disabled**: Add Room, Add Window buttons show lock icon and are disabled
4. **Dialog read-only**: WindowManagementDialog opens in read-only mode
5. **Mutation blocked**: If somehow triggered, mutation hooks throw error with toast

