
# Fix Status Filtering Bug

## Problem

When you select a status like "Lead" from the filter, the jobs table shows "Your first project awaits!" (empty state) even though there are jobs with that status.

## Root Cause

There's a case-sensitivity mismatch:

1. **Filter sends lowercase**: The dropdown uses `status.name.toLowerCase()` as the value, so selecting "Lead" sends `"lead"`

2. **Data has original case**: The database stores status as `"Lead"` (with capital L)

3. **Comparison is case-sensitive**: The code does `project.status === statusFilter` which means `"Lead" === "lead"` returns `false`

## Solution

Make the status comparison case-insensitive in `JobsTableView.tsx`:

```typescript
// Before (line 358):
return group.project?.status === statusFilter;

// After:
return group.project?.status?.toLowerCase() === statusFilter.toLowerCase();
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/JobsTableView.tsx` | Fix line 358 to use case-insensitive comparison |

## Technical Details

The fix is on line 358 in the filter callback:

```typescript
.filter(group => {
  if (!group) return false;
  if (!group.isMatch && searchTerm) return false;
  
  // Handle archived filter - check if status name contains "completed"
  if (statusFilter === 'archived') {
    if (!group.project?.status_id) return false;
    const status = jobStatuses.find(s => s.id === group.project.status_id);
    return status?.name?.toLowerCase().includes('completed') || false;
  }
  
  if (statusFilter === 'all') return true;
  
  // FIX: Case-insensitive comparison
  return group.project?.status?.toLowerCase() === statusFilter.toLowerCase();
})
```

This ensures "Lead", "lead", or "LEAD" all match correctly.
