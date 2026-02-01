

# CRITICAL FIX: "Discard Changes" Deletes Real Data

## Executive Summary

**BUG CONFIRMED**: When a staff member (or even an admin) clicks "Discard" in the unsaved changes dialog, the system incorrectly deletes REAL saved data from the database - not just the unsaved draft changes.

**IMPACT**: This bug has caused data loss on both admin and staff accounts. The total project price decreased because actual pricing data was deleted.

---

## Root Cause Analysis

The bug is in `src/components/job-creation/WindowManagementDialog.tsx`, lines 357-394, in the `handleDiscardChanges` function:

```typescript
const handleDiscardChanges = async () => {
  worksheetRef.current?.clearDraft();
  setShowUnsavedDialog(false);
  
  // BUG #1: This checks the PROP value, not current DB state
  const isNewWindow = existingTreatments.length === 0;  
  
  // BUG #2: This checks for total_cost, but a window can have 0 cost and still be valid
  // BUG #3: For staff members, RLS may block this query entirely, returning null
  const hasSavedData = !!(await supabase
    .from('windows_summary')
    .select('total_cost')
    .eq('window_id', surface?.id)
    .maybeSingle()
    .then(r => r.data?.total_cost));
  
  // BUG #4: This is TRUE even for windows that have been saved previously
  const shouldDeleteGhost = isNewWindow && !hasSavedData;
  
  // BUG #5: DELETES THE ENTIRE SURFACE AND ALL ITS DATA
  if (shouldDeleteGhost && surface?.id) {
    await supabase.from('windows_summary').delete().eq('window_id', surface.id);
    await deleteSurface.mutateAsync(surface.id);  // CRITICAL DATA LOSS
  }
  
  onClose();
};
```

### Why This Happens

| Scenario | `existingTreatments.length` | `hasSavedData` | `shouldDeleteGhost` | Result |
|----------|----------------------------|----------------|---------------------|--------|
| Staff opens existing window | `0` (RLS may block) | `false` (RLS blocks or cost=0) | `true` | **DATA DELETED** |
| Admin opens window with $0 cost | `0` (no legacy treatment) | `false` (cost=0) | `true` | **DATA DELETED** |
| New unsaved window | `0` (correct) | `false` (correct) | `true` | Correct deletion |

### The Fundamental Flaw

The "ghost window" cleanup logic was designed to remove windows that were never saved. But it uses **unreliable heuristics** (treatment count, cost value) that fail when:

1. Staff members have different RLS visibility
2. Windows have $0 cost but valid measurements
3. The `treatments` table has no rows but `windows_summary` has data
4. RLS policies block the verification query

---

## Solution: Remove Dangerous Auto-Deletion

**The safest fix is to NEVER auto-delete data on discard.** Instead:

1. Only clear the local draft (localStorage)
2. Close the dialog without modifying database
3. If ghost cleanup is truly needed, make it a separate user-triggered action with confirmation

### Code Changes

**File: `src/components/job-creation/WindowManagementDialog.tsx`**

Replace the current `handleDiscardChanges` function (lines 357-394):

```typescript
const handleDiscardChanges = async () => {
  // Clear local draft only - NEVER delete database data on discard
  worksheetRef.current?.clearDraft();
  setShowUnsavedDialog(false);
  
  // CRITICAL SAFETY: Do NOT delete any database data here
  // The "discard" action means "discard unsaved local changes" 
  // NOT "delete the entire window from the database"
  console.log('📌 Discarding unsaved changes for window:', surface?.id);
  console.log('📌 No database deletion performed - only local draft cleared');
  
  onClose();
};
```

This change:
- Removes ALL automatic database deletion from the discard flow
- Only clears the local draft (which is the correct behavior for "discard changes")
- Completely eliminates the race condition and RLS visibility issues
- Follows the architecture memory rule: "NEVER implement automatic data deletion"

---

## Data Restoration

Before fixing the code, we need to restore any data that was deleted. Based on my investigation, the project still has 5 surfaces with pricing. However, if data was deleted during the user's recent testing, we should check workshop_items for restoration:

```sql
-- Check for deleted data that can be restored from workshop_items
SELECT wi.window_id, wi.room_id, wi.treatment_type, wi.cost_breakdown
FROM workshop_items wi
WHERE wi.project_id = '113a5360-eb1a-42bc-bff0-909821b9305b'
  AND wi.window_id NOT IN (SELECT id FROM surfaces WHERE project_id = '113a5360-eb1a-42bc-bff0-909821b9305b');
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/job-creation/WindowManagementDialog.tsx` | Remove database deletion from `handleDiscardChanges` (lines 357-394) |

---

## Testing Checklist

1. **Discard Safety Test**
   - Open any existing window with saved pricing
   - Make a small change (or don't)
   - Close dialog → Click "Discard"
   - Verify window and pricing still exist
   - Refresh page → Confirm data persists

2. **Staff Member Test**
   - Log in as staff (Daniel)
   - Open assigned project
   - Click on a window → Discard
   - Verify data is NOT deleted

3. **Admin Cross-Check**
   - After staff discards, check admin view
   - Verify pricing totals unchanged

4. **New Window Behavior**
   - Create a new window
   - Don't save anything
   - Close → Discard
   - The empty window may remain (acceptable) OR can be cleaned up later by explicit delete button

---

## Architecture Memory Update

This fix reinforces the existing memory rule:

```
# Memory: architecture/automatic-data-deletion-safety

CRITICAL RULE: NEVER implement automatic data deletion based on heuristics.

SPECIFIC BAN: The "handleDiscardChanges" pattern must NEVER:
- Check treatment counts to determine if deletion is safe
- Check cost values to determine if data exists
- Use async RLS-dependent queries to make deletion decisions
- Delete surfaces or windows_summary on dialog close

SAFE PATTERN: "Discard" should ONLY:
- Clear local state (React state)
- Clear drafts (localStorage/draftService)
- Close dialogs/modals
```

