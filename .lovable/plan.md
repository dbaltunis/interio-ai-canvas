
# Add Job Name Editing Capability

## Problem Summary

Jobs are created with auto-generated names like "New Job 1/28/2026" which makes them hard to identify. While a `ProjectJobsHeader` component with inline name editing already exists in the codebase, it's not being used. The main `ProjectHeader` component shows the name as static text with no edit option.

## Solution Overview

Integrate inline job name editing into the `ProjectHeader` component, allowing users to click an edit button next to the project name to rename it to something meaningful (e.g., "Johnson Kitchen Renovation" instead of "New Job 1/28/2026").

---

## Implementation Details

### Part 1: Add Inline Name Editing to ProjectHeader

**File:** `src/components/job-creation/ProjectHeader.tsx`

**Changes:**
1. Add state for inline editing (borrowing pattern from existing `ProjectJobsHeader.tsx`)
2. Replace static `<h1>{projectName}</h1>` with editable input toggle
3. Add Edit, Save, Cancel button controls
4. Call `onProjectUpdate` when name is saved
5. Respect `canEditJob` permission check

**UI Before:**
```text
[<-] Back to Jobs  |  New Job 1/28/2026
                      #ORD-0218
```

**UI After:**
```text
[<-] Back to Jobs  |  New Job 1/28/2026  [Edit icon]
                      #ORD-0218

(When editing:)
[<-] Back to Jobs  |  [_____________] [checkmark] [X]
                      #ORD-0218
```

### Part 2: Wire Up the onProjectUpdate Prop

**File:** `src/components/job-editor/JobEditPage.tsx`

Ensure `onProjectUpdate` callback is passed to ProjectHeader and handles the name update properly.

### Part 3: Add Update Handler in JobEditPage

**Changes:**
- Create handler that calls `useUpdateProject` mutation with new name
- Pass handler to `ProjectHeader` component

---

## Technical Implementation

### ProjectHeader.tsx Changes

```typescript
// Add to component state
const [isEditingName, setIsEditingName] = useState(false);
const [editedName, setEditedName] = useState(projectName);

// Add save handler
const handleSaveName = async () => {
  if (!editedName.trim() || editedName === projectName) {
    setIsEditingName(false);
    setEditedName(projectName);
    return;
  }
  
  try {
    await onProjectUpdate?.({ name: editedName.trim() });
    setIsEditingName(false);
    toast({ title: "Success", description: "Project name updated" });
  } catch (error) {
    setEditedName(projectName);
    toast({ title: "Error", description: "Failed to update name", variant: "destructive" });
  }
};
```

```typescript
// Replace static h1 with editable version
{isEditingName ? (
  <div className="flex items-center gap-2">
    <Input
      value={editedName}
      onChange={(e) => setEditedName(e.target.value)}
      className="h-8 w-48"
      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
      autoFocus
    />
    <Button size="icon" variant="ghost" onClick={handleSaveName}>
      <Check className="h-4 w-4" />
    </Button>
    <Button size="icon" variant="ghost" onClick={() => { setIsEditingName(false); setEditedName(projectName); }}>
      <X className="h-4 w-4" />
    </Button>
  </div>
) : (
  <div className="flex items-center gap-2">
    <h1 className="text-xl font-semibold">{projectName}</h1>
    {canEditJob && (
      <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
    )}
  </div>
)}
```

### JobEditPage.tsx Changes

```typescript
// Add project update handler
const updateProject = useUpdateProject();

const handleProjectUpdate = async (updates: Partial<Project>) => {
  if (!job?.project_id) return;
  
  try {
    await updateProject.mutateAsync({
      id: job.project_id,
      ...updates
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    throw error;
  }
};

// Pass to ProjectHeader
<ProjectHeader 
  projectName={job.quote_number || "Job"} 
  ...
  onProjectUpdate={handleProjectUpdate}
/>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/job-creation/ProjectHeader.tsx` | Add inline name editing with Input, Check, X buttons |
| `src/components/job-editor/JobEditPage.tsx` | Add `handleProjectUpdate` function and pass to ProjectHeader |

---

## Expected Behavior

1. **View Mode**: Job name shows with small edit pencil icon next to it (visible only to users with edit permission)
2. **Edit Mode**: Clicking pencil converts name to input field with Save/Cancel buttons
3. **Save**: Updates project name in database, shows success toast
4. **Cancel**: Reverts to original name, closes edit mode
5. **Permissions**: Edit button only visible if `canEditJob` is true
6. **Locked Status**: Edit button hidden when project is in locked status

---

## User Experience Improvement

**Before:** User creates job -> Sees "New Job 1/28/2026" -> Has to search by job number -> Hard to identify in lists

**After:** User creates job -> Clicks edit pencil -> Types "Johnson Kitchen Blinds" -> Save -> Easy to identify in all views including the Rejections widget
