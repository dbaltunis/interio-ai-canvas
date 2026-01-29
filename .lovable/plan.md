

# Enhanced Team UX and Activity Tracking Fixes

## Summary

This plan addresses the following issues:
1. **Add "Invite Team Member" to the Actions dropdown menu** - Make team assignment accessible from the focus group
2. **Handle long names and multiple team members in Team column** - Prevent layout issues
3. **Activity tracking records not showing** - Integrate activity logging with existing operations
4. **Complete remaining activity log integrations** - Status changes, quotes, notes, etc.

---

## Issue 1: Add "Invite Team Member" to Actions Dropdown

### Current State
The "Invite Team Member" action is only accessible by clicking directly on the Team column avatars, which is not discoverable or user-friendly.

### Solution
Add a new "Invite Team Member" menu item in the Actions dropdown (the three-dot menu shown in the screenshot).

**File: `src/components/jobs/JobsTableView.tsx`**

**Location:** Lines 988-1029 (inside the DropdownMenuContent for actions)

Add between "Write Note" and "Duplicate Job":

```typescript
import { UserPlus } from "lucide-react"; // Add to imports

// In the dropdown menu, after "Write Note":
<DropdownMenuItem 
  onClick={() => {
    setSelectedProjectForTeam({
      id: project.id,
      name: project.name || `Job #${project.job_number}`,
      ownerId: project.user_id,
    });
    setTeamAssignDialogOpen(true);
  }}
>
  <UserPlus className="mr-2 h-4 w-4" />
  Invite Team Member
</DropdownMenuItem>
<DropdownMenuSeparator />
```

---

## Issue 2: Handle Long Names and Multiple Team Members

### Current State
- Owner name can overflow if too long (max-w-[60px] is set but may still cause issues)
- Multiple team avatars can take too much horizontal space

### Solution
Enhance `TeamAvatarStack.tsx` with better space management:

**File: `src/components/jobs/TeamAvatarStack.tsx`**

**Changes:**

1. **Reduce maxVisible from 3 to 2** when there's a long owner name
2. **Shorten the owner name display** to first name only with max 50px width
3. **Add a compact mode** for narrow columns
4. **Improve overflow indicator** styling

```typescript
// Update the ownerFirstName to be shorter
const ownerFirstName = owner.name.split(' ')[0].slice(0, 6) + 
  (owner.name.split(' ')[0].length > 6 ? '.' : '');

// Reduce visible count for tighter layouts
const effectiveMaxVisible = ownerFirstName.length > 5 ? Math.min(maxVisible, 2) : maxVisible;
const visibleMembers = assignedMembers.slice(0, effectiveMaxVisible);
const remainingCount = Math.max(0, assignedMembers.length - effectiveMaxVisible);

// Tighter spacing for stacked avatars
<div className="flex -space-x-2.5"> // Slightly more overlap
```

**Specific Changes:**
- Truncate owner first name to 6 characters with ellipsis
- Reduce max-width for name to 50px
- Make avatar sizes slightly smaller (h-6 w-6 for owner when team exists)
- Increase avatar overlap from -2 to -2.5 for tighter stacking
- Add responsive maxVisible: 2 on smaller screens

---

## Issue 3: Activity Tracking Not Showing Records

### Root Cause Analysis

The `ProjectActivityTab` is properly integrated into the job detail page (under the "More" dropdown with "Workroom"). However, activity records are only being logged when:
1. Team members are assigned/removed via `useProjectAssignments.ts`

**Missing integrations:**
- Status changes
- Note creation
- Quote creation
- Email sending
- Client linking
- Project creation
- Project duplication

### Solution: Add Activity Logging to Key Operations

**File 1: `src/hooks/useLogStatusChange.ts`**

Add activity logging when status changes:

```typescript
import { logProjectActivity } from './useProjectActivityLog';

// After successful status change:
await logProjectActivity({
  projectId,
  activityType: 'status_changed',
  title: `Status changed from "${previousStatusName}" to "${newStatusName}"`,
  description: reason || notes || null,
  metadata: {
    previous_status_id: previousStatusId,
    new_status_id: newStatusId,
    previous_status_name: previousStatusName,
    new_status_name: newStatusName,
    reason,
    notes
  }
});
```

**File 2: `src/hooks/useProjectNotes.ts`** (or similar)

Add logging when notes are created:

```typescript
await logProjectActivity({
  projectId,
  activityType: 'note_added',
  title: 'Added a note',
  description: noteContent.substring(0, 100) + (noteContent.length > 100 ? '...' : ''),
  metadata: { note_id: newNote.id }
});
```

**File 3: `src/hooks/useQuotes.ts`**

Add logging when quotes are created:

```typescript
await logProjectActivity({
  projectId: quote.project_id,
  activityType: 'quote_created',
  title: `Quote v${quote.version_number || 1} created`,
  metadata: { quote_id: quote.id }
});
```

**File 4: `src/hooks/useProjects.ts` (createProject mutation)**

Add logging when projects are created:

```typescript
await logProjectActivity({
  projectId: newProject.id,
  activityType: 'project_created',
  title: 'Project created',
  metadata: { job_number: newProject.job_number }
});
```

**File 5: `src/components/jobs/JobDetailPage.tsx` (duplicateJob function)**

Add logging when projects are duplicated:

```typescript
await logProjectActivity({
  projectId: newProject.id,
  activityType: 'project_duplicated',
  title: `Duplicated from Job #${originalJobNumber}`,
  description: `Source job: ${sourceJobId}`,
  metadata: { source_project_id: jobId, source_job_number: originalJobNumber }
});
```

---

## Issue 4: Activity Tab Icon

The Activity tab currently uses `PixelClipboardIcon` which is the same as Project tab, making it confusing.

**File: `src/components/jobs/JobDetailPage.tsx`**

**Change:**
```typescript
import { Activity } from "lucide-react";

// In allTabs array:
{ id: "activity", label: "Activity", mobileLabel: "Activity", icon: Activity, disabled: false },
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/components/jobs/JobsTableView.tsx` | Add "Invite Team Member" to actions dropdown |
| `src/components/jobs/TeamAvatarStack.tsx` | Better space management for long names |
| `src/components/jobs/JobDetailPage.tsx` | Fix Activity tab icon, add logging to duplicate |
| `src/hooks/useLogStatusChange.ts` | Add activity logging for status changes |
| `src/hooks/useProjectNotes.ts` | Add activity logging for notes |
| `src/hooks/useQuotes.ts` | Add activity logging for quote creation |
| `src/hooks/useProjects.ts` | Add activity logging for project creation |

---

## Technical Notes

### Activity Log Integration Points

The existing `useProjectAssignments.ts` shows the pattern for logging:

```typescript
// Log activity
await supabase
  .from("project_activity_log")
  .insert({
    project_id: projectId,
    user_id: currentUser.id,
    activity_type: 'team_assigned',
    title: `${assignedName} was assigned to this project`,
    description: notes || null,
    metadata: { assigned_user_id: userId, role }
  });
```

The same pattern should be applied to other operations.

### Display Improvements

For the Team column width issue:
- Total Team column width should stay under ~150px
- Owner avatar: 24px (when team exists)
- Owner name: max 50px
- Team avatars (max 2): 24px each with -10px overlap = ~38px
- Overflow indicator: 24px
- Gaps: ~8px
- **Total: ~144px**

---

## Expected Results

After implementation:
1. Users can click "Invite Team Member" directly from the job's three-dot menu
2. Long names and multiple team members won't break the table layout
3. The Activity tab will show all project activities including:
   - Status changes (e.g., "Status changed from Draft to Quote Sent")
   - Team assignments (e.g., "Sarah was assigned to this project")
   - Notes added
   - Quotes created
   - Project duplications
4. Activity tab has a unique icon for better discoverability

