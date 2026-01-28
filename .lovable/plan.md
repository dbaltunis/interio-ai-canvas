

# Simplified Status System with History Logging

## Problem Summary

From your screenshot, I can see the issue clearly: the project shows "Rejected" status with `action: locked`, and the "Project Locked" banner displays correctly, BUT the "Save & Close" button is still active. This happens because:

1. **Button doesn't check readOnly**: The Save & Close button in `DynamicWindowWorksheet.tsx` only checks if it's saving or if measurements are empty - it ignores the `readOnly` prop entirely
2. **Multiple confusing action types**: Currently there are 6 action types (`editable`, `view_only`, `locked`, `completed`, `requires_reason`, `progress_only`) which is unnecessarily complex
3. **No audit trail**: Status changes aren't recorded anywhere - no history of who changed what and when

## Proposed Simplified Status System

Based on your feedback, here's the simplified model:

| Action | Behavior | Use Case |
|--------|----------|----------|
| **editable** | Full editing allowed | Only for very early stages like "Lead" or "Draft" |
| **locked** | No editing, no status change | Most statuses: Quote Sent, Approved, Planning, In Progress, Materials Ordered, Manufacturing, Quality Check, Completed |
| **requires_reason** | Prompts for reason before setting | "Rejected", "Cancelled", "On Hold" |

**Key principle**: By default, most statuses should LOCK the project. If the client needs changes, they move the status BACK to an editable status (like Draft) first, make changes, then progress forward again.

## Solution Part 1: Fix UI Locking

### Fix Save & Close Button in DynamicWindowWorksheet

The button at line 3374-3435 needs to check `readOnly`:

```typescript
// Current (broken)
<Button onClick={...} disabled={
  isSaving || (!measurements.rail_width || !measurements.drop)
}>
  Save & Close
</Button>

// Fixed
<Button onClick={...} disabled={
  readOnly || isSaving || (!measurements.rail_width || !measurements.drop)
}>
  {readOnly ? (
    <>
      <Lock className="h-4 w-4 mr-2" />
      <span>View Only</span>
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      <span>Save & Close</span>
    </>
  )}
</Button>
```

### Fix UnsavedChangesDialog

When `readOnly=true`, clicking close should NOT show the "Unsaved Changes" dialog - it should close directly since no changes were possible anyway.

## Solution Part 2: Simplify Action Types

### Remove Deprecated Actions

1. Remove `view_only` - merge into `locked`
2. Remove `completed` - merge into `locked` (completion date can be set separately)
3. Remove `progress_only` - was already unclear

### Update StatusSlotManager.tsx

```typescript
// New simplified options
<Select value={editForm.action}>
  <SelectItem value="editable">Editable (allow changes)</SelectItem>
  <SelectItem value="locked">Locked (no changes allowed)</SelectItem>
  <SelectItem value="requires_reason">Requires Reason (must document why)</SelectItem>
</Select>
```

### Update Database Migration

```sql
-- Update any existing view_only, completed, progress_only to locked
UPDATE job_statuses 
SET action = 'locked' 
WHERE action IN ('view_only', 'completed', 'progress_only');
```

## Solution Part 3: Status Change History Logging

### New Table: `status_change_history`

```sql
CREATE TABLE public.status_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  previous_status_id UUID REFERENCES public.job_statuses(id),
  new_status_id UUID REFERENCES public.job_statuses(id),
  previous_status_name TEXT,
  new_status_name TEXT,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT, -- Required for 'requires_reason' actions
  notes TEXT,
  user_name TEXT, -- Denormalized for easy display
  user_email TEXT
);

-- Index for fast lookups
CREATE INDEX idx_status_history_project ON status_change_history(project_id);
CREATE INDEX idx_status_history_time ON status_change_history(changed_at DESC);

-- RLS: Users can view history for projects they have access to
ALTER TABLE status_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_history_select" ON status_change_history
FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);

-- Only system can insert (via status change mutations)
CREATE POLICY "status_history_insert" ON status_change_history
FOR INSERT WITH CHECK (
  changed_by = auth.uid()
);
```

### Requires Reason Dialog

When user selects a status with `action: requires_reason`:

```typescript
// Show dialog before allowing status change
<Dialog open={showReasonDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Reason Required</DialogTitle>
      <DialogDescription>
        Please provide a reason for changing status to "{statusName}"
      </DialogDescription>
    </DialogHeader>
    <Textarea
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      placeholder="Enter reason (required)..."
      rows={3}
    />
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowReasonDialog(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleConfirmStatusChange}
        disabled={!reason.trim()}
      >
        Confirm Change
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Log Every Status Change

Update `useUpdateProject` to log changes:

```typescript
// When status changes
const logStatusChange = async (
  projectId: string,
  previousStatusId: string | null,
  newStatusId: string,
  reason?: string
) => {
  const { data: user } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, email')
    .eq('id', user.user?.id)
    .single();

  await supabase.from('status_change_history').insert({
    project_id: projectId,
    previous_status_id: previousStatusId,
    new_status_id: newStatusId,
    changed_by: user.user?.id,
    reason,
    user_name: profile?.full_name,
    user_email: profile?.email
  });
};
```

## Implementation Files

### Files to Modify

| File | Change |
|------|--------|
| `src/components/measurements/DynamicWindowWorksheet.tsx` | Disable Save button when `readOnly=true` |
| `src/components/job-creation/WindowManagementDialog.tsx` | Skip unsaved dialog when locked |
| `src/lib/statusActions.ts` | Remove deprecated action types |
| `src/components/settings/StatusSlotManager.tsx` | Simplify action dropdown |
| `src/hooks/useStatusPermissions.ts` | Treat all non-editable as locked |
| `src/contexts/ProjectStatusContext.tsx` | Simplify permission logic |
| `src/components/jobs/JobStatusDropdown.tsx` | Add reason dialog for requires_reason |
| `src/hooks/useProjects.ts` | Add status history logging |

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useStatusHistory.ts` | Hook to fetch/display status history |
| `src/components/projects/StatusHistoryDialog.tsx` | UI to view status change audit log |
| `src/components/projects/StatusReasonDialog.tsx` | Dialog for entering reason when required |

## Expected Behavior After Fix

### Locked Project
1. User opens a window in a "Rejected" project
2. Banner shows: "Project Locked - This project cannot be edited"
3. Save & Close button shows: 🔒 "View Only" (disabled)
4. No "Unsaved Changes" dialog appears on close
5. All input fields are disabled/readonly

### Status Change with Reason
1. Admin changes status to "Rejected"
2. Dialog appears: "Reason Required - Please explain why this project is being rejected"
3. Admin enters: "Client requested cancellation - budget constraints"
4. Status changes AND history record created
5. Analytics dashboard can show all rejections with reasons

### Status History View
1. Admin clicks "View History" on project
2. Shows timeline:
   - Jan 28, 9:30 AM - John changed status from "In Progress" to "Rejected"
   - Reason: "Client requested cancellation"
   - Jan 25, 2:00 PM - Jane changed status from "Planning" to "In Progress"
   - Jan 20, 10:00 AM - John created project with status "Lead"

## Future Steps (Not in This Plan)

As you mentioned, after this we'll tackle:
1. **Job Delegation**: Give access to specific users for specific jobs
2. **Workflow Automation**: Trigger actions (emails, notifications) on status change

