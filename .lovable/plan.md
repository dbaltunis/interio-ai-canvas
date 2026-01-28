
# Fix Status Locking UX and Add Reason KPI Dashboard

## Overview

This plan addresses three issues with the current status system:
1. Users see hard red error messages when trying to add items to locked projects
2. The reason dialog doesn't appear for Rejected/Cancelled statuses (database misconfiguration)
3. No dashboard widget showing rejection/cancellation reasons as KPI

## Current State Analysis

**Database Configuration Issue Found:**
The `job_statuses` table has incorrect `action` values:
- Multiple "Rejected" and "Cancelled" statuses are set to `action: locked` 
- Only 2 status entries correctly use `requires_reason`
- "On Hold" is set to `editable` instead of `requires_reason`

**UI Feedback Issue:**
When a locked project blocks an action, the mutation hooks show red "destructive" toasts saying:
```
Error: Cannot add window: Project is in "Rejected" status
```
This looks like a system error rather than a helpful warning.

---

## Solution Implementation

### Part 1: Improve Locked Project UX (User-Friendly Feedback)

**Changes to `RoomsGrid.tsx`:**
- Add tooltips to the "Add Another Room" button when disabled
- Show informative message: "Project is locked. Change status to edit."

**Changes to `StreamlinedJobsInterface.tsx`:**
- Wrap disabled buttons with tooltips explaining why they're disabled
- Include the current status name in the tooltip

**Changes to Mutation Hooks (`useRooms.ts`, `useSurfaces.ts`, `useTreatments.ts`):**
- Change error toast variant from `destructive` (red) to `default` (amber/info)
- Update error title from "Error" to "Project Locked"
- Provide helpful description guiding user to change status first

Example toast change:
```typescript
// Before
toast({
  title: "Error",
  description: error.message,
  variant: "destructive"  // Red
});

// After
const isStatusBlock = error.message?.includes('Project is in');
toast({
  title: isStatusBlock ? "Project Locked" : "Error",
  description: isStatusBlock 
    ? "This project's status prevents editing. Change the status to make modifications."
    : error.message,
  variant: isStatusBlock ? "default" : "destructive"  // Amber for status blocks
});
```

---

### Part 2: Fix Status Configuration (Enable Reason Dialog)

**Database Update Required:**
Run SQL to fix the misconfigured statuses:

```sql
-- Fix Rejected statuses to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'Rejected';

-- Fix Cancelled statuses to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'Cancelled';

-- Fix On Hold to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'On Hold';
```

After this fix:
1. User selects "Rejected" from dropdown
2. `JobStatusDropdown.tsx` detects `action === 'requires_reason'`
3. Opens `StatusReasonDialog` popup (already implemented)
4. User enters reason (mandatory)
5. Status changes and reason is logged to `status_change_history` table

---

### Part 3: Add Status Reasons KPI Dashboard Widget

**New File: `src/hooks/useStatusReasonsKPI.ts`**
Hook to fetch recent rejections/cancellations with reasons:

```typescript
export const useStatusReasonsKPI = (limit: number = 10) => {
  return useQuery({
    queryKey: ['status-reasons-kpi', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('status_change_history')
        .select(`
          id, new_status_name, reason, user_name, changed_at,
          project:projects(id, name)
        `)
        .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
        .not('reason', 'is', null)
        .order('changed_at', { ascending: false })
        .limit(limit);
      return data || [];
    }
  });
};
```

**New File: `src/components/dashboard/StatusReasonsWidget.tsx`**
Dashboard widget showing recent rejections with reasons:

```text
+------------------------------------------+
| ⚠ Recent Rejections & Cancellations     |
+------------------------------------------+
| Smith Kitchen Renovation                  |
| [Rejected] "Client budget constraints"    |
| by John · Jan 28, 9:30 AM                |
+------------------------------------------+
| Johnson Living Room                       |
| [Cancelled] "Project scope changed"       |
| by Jane · Jan 27, 2:00 PM                |
+------------------------------------------+
```

**Update: `src/hooks/useDashboardWidgets.ts`**
Register new widget in DEFAULT_WIDGETS array:

```typescript
{
  id: "status-reasons",
  name: "Rejections & Cancellations",
  description: "Recent project rejections and cancellation reasons",
  enabled: true,
  order: 14,
  category: "analytics",
  size: "medium",
  requiredPermission: "view_primary_kpis"
}
```

**Update: `src/components/dashboard/EnhancedHomeDashboard.tsx`**
Add case for new widget in render switch:

```typescript
case "status-reasons":
  return <StatusReasonsWidget />;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useRooms.ts` | Change status-block error toast from red to amber |
| `src/hooks/useSurfaces.ts` | Change status-block error toast from red to amber |
| `src/hooks/useTreatments.ts` | Change status-block error toast from red to amber |
| `src/components/job-creation/RoomsGrid.tsx` | Add tooltip to disabled button |
| `src/components/job-creation/StreamlinedJobsInterface.tsx` | Add tooltips to locked buttons |
| `src/hooks/useDashboardWidgets.ts` | Add "status-reasons" widget definition |
| `src/components/dashboard/EnhancedHomeDashboard.tsx` | Add StatusReasonsWidget to render switch |

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useStatusReasonsKPI.ts` | Hook to fetch status change reasons |
| `src/components/dashboard/StatusReasonsWidget.tsx` | Dashboard widget for rejection/cancellation KPI |

## Database Changes

| Table | Change |
|-------|--------|
| `job_statuses` | UPDATE action to 'requires_reason' for Rejected, Cancelled, On Hold |

---

## Expected Behavior After Implementation

### Locked Project UX
1. User sees project in "Rejected" status
2. Red banner at top: "Project Locked"
3. Add Room button is disabled with lock icon
4. Hovering shows tooltip: "Project is locked. Change status to edit."
5. If user somehow triggers action, shows amber info toast instead of red error

### Reason Dialog Flow
1. User clicks status dropdown and selects "Rejected"
2. Dialog appears: "Reason Required - Please explain why this project is being rejected"
3. User types: "Client budget constraints"
4. Clicks "Confirm"
5. Status changes AND reason is saved to history
6. Toast: "Status changed to Rejected with reason recorded"

### Dashboard KPI Widget
1. Admin opens Dashboard
2. Sees "Rejections & Cancellations" widget
3. Shows timeline of recent rejections with:
   - Project name
   - Status badge (Rejected/Cancelled/On Hold)
   - Reason in quotes
   - Who made the change and when
