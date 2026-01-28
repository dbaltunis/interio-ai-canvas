
# Fix Status Locking UX and Add Reason KPI Dashboard

## Problem Summary

Based on my investigation, I've identified three issues with the current status system:

### Issue 1: Unfriendly Error Messages When Locked
When a project is locked and user tries to add a window, they see a hard red "destructive" toast saying:
```
Error: Cannot add window: Project is in "Rejected" status
```

This is technically correct but the UX is poor because:
- It looks like something is broken (red = error)
- The message appears AFTER the user clicks, wasting their action
- The UI buttons should be disabled BEFORE user tries to click

**Root cause**: The mutation hooks (`useRooms.ts`, `useSurfaces.ts`) throw errors that get displayed as red toasts, but the UI buttons in `StreamlinedJobsInterface.tsx` are only partially checking status (they show lock icons but don't fully prevent all actions).

### Issue 2: Reason Dialog Not Appearing
The reason dialog should appear when changing to "Rejected" or "Cancelled" status, but it's NOT appearing.

**Root cause from database**: The statuses are misconfigured:
```sql
-- Current configuration (WRONG)
Rejected (Project): action = 'locked' ❌
Cancelled (Project): action = 'locked' ❌  
On Hold: action = 'editable' ❌

-- Should be:
Rejected (Project): action = 'requires_reason' ✓
Cancelled (Project): action = 'requires_reason' ✓
On Hold: action = 'requires_reason' ✓
```

The code in `JobStatusDropdown.tsx` is correct - it checks for `action === 'requires_reason'`, but the database has the wrong action type stored.

### Issue 3: Reason Not Displayed as KPI
Currently, there is no dashboard widget showing:
- Projects that were rejected/cancelled
- The reasons given for each
- Analytics on rejection reasons

## Solution

### Part 1: Better UX for Locked Projects

**1.1 Disable buttons BEFORE user clicks (not after)**

In `StreamlinedJobsInterface.tsx`, the buttons already show lock icons when `isStatusLocked=true`, but they can still be clicked. We need to fully disable them:

```typescript
// Current (partially working)
<Button onClick={handleAddRoom} disabled={isStatusLocked}>
  {isStatusLocked ? <Lock /> : <Plus />}
  Add Room
</Button>

// Enhanced (show tooltip explaining WHY disabled)
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span> {/* Wrapper needed for disabled button tooltip */}
        <Button onClick={handleAddRoom} disabled={isStatusLocked}>
          {isStatusLocked ? <Lock /> : <Plus />}
          Add Room
        </Button>
      </span>
    </TooltipTrigger>
    {isStatusLocked && (
      <TooltipContent>
        <p>Project is locked because status is "{statusPermissions?.statusName}"</p>
        <p className="text-xs text-muted-foreground">Change status to edit</p>
      </TooltipContent>
    )}
  </Tooltip>
</TooltipProvider>
```

**1.2 Show a friendly amber warning instead of red error**

Update mutation error handling to show amber "info" toast for status-related blocks:

```typescript
// In useRooms.ts, useSurfaces.ts
onError: (error) => {
  const isStatusBlock = error.message?.includes('Project is in');
  toast({
    title: isStatusBlock ? "Project Locked" : "Error",
    description: isStatusBlock 
      ? "This project's status prevents editing. Change the status to make modifications."
      : error.message,
    variant: isStatusBlock ? "default" : "destructive", // Amber not red
  });
}
```

### Part 2: Fix Status Configuration

**2.1 Update database statuses to use `requires_reason`**

Run SQL to fix the misconfigured statuses:

```sql
-- Fix Rejected statuses to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'Rejected' AND category = 'Project';

-- Fix Cancelled statuses to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'Cancelled' AND category = 'Project';

-- Fix On Hold to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'On Hold';
```

After this fix, when user selects "Rejected" from the dropdown:
1. `JobStatusDropdown.tsx` sees `action === 'requires_reason'`
2. Opens `StatusReasonDialog` popup
3. User must enter reason before status changes
4. Reason is logged to `status_change_history` table

### Part 3: Add Reason KPI Dashboard Widget

**3.1 Create new widget: `StatusReasonsWidget.tsx`**

A dashboard widget showing:
- Recent rejections/cancellations with reasons
- Pie chart of rejection reasons (if there are patterns)
- Timeline of status changes

```typescript
// src/components/dashboard/StatusReasonsWidget.tsx
export const StatusReasonsWidget = () => {
  const { data: recentChanges } = useQuery({
    queryKey: ['recent-status-changes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('status_change_history')
        .select(`
          id,
          new_status_name,
          reason,
          user_name,
          changed_at,
          project:projects(name)
        `)
        .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
        .order('changed_at', { ascending: false })
        .limit(10);
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Recent Rejections & Cancellations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentChanges?.map(change => (
          <div key={change.id} className="flex justify-between items-start py-2 border-b">
            <div>
              <p className="font-medium">{change.project?.name}</p>
              <Badge variant="outline">{change.new_status_name}</Badge>
              {change.reason && (
                <p className="text-sm text-muted-foreground mt-1">
                  "{change.reason}"
                </p>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{change.user_name}</p>
              <p>{formatDate(change.changed_at)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
```

**3.2 Add widget to dashboard widget list**

Register the new widget in the widget registry so admins can enable it.

**3.3 Add permission check**

Only show to users with `view_analytics` or `view_primary_kpis` permission.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useRooms.ts` | Change error toast from red to amber for status blocks |
| `src/hooks/useSurfaces.ts` | Change error toast from red to amber for status blocks |
| `src/hooks/useTreatments.ts` | Change error toast from red to amber for status blocks |
| `src/components/job-creation/StreamlinedJobsInterface.tsx` | Add tooltips to locked buttons explaining why |
| `src/components/job-creation/RoomsGrid.tsx` | Add tooltips to locked buttons |
| Database migration | Update Rejected/Cancelled/On Hold to `requires_reason` |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/StatusReasonsWidget.tsx` | Dashboard KPI widget for rejection reasons |
| `src/hooks/useStatusReasonsKPI.ts` | Hook to fetch status change analytics |

## Expected Behavior After Fix

### Locked Project UX
1. User sees project in "Rejected" status
2. Red banner at top: "Project Locked"
3. All action buttons show lock icon and are disabled
4. Hovering shows tooltip: "Project is locked. Change status to edit."
5. NO red error toasts anymore

### Reason Dialog Flow
1. User clicks status dropdown → selects "Rejected"
2. Dialog appears: "Please provide a reason for rejecting this project"
3. User types: "Client budget constraints"
4. Clicks "Confirm"
5. Status changes AND reason is saved
6. Toast: "Status changed to Rejected with reason recorded"

### Dashboard KPI
1. Admin opens Dashboard
2. Sees "Recent Rejections & Cancellations" widget
3. Shows list:
   - "Smith Kitchen Renovation" → Rejected
     "Client budget constraints" - by John, Jan 28
   - "Johnson Living Room" → Cancelled
     "Project scope changed" - by Jane, Jan 27
