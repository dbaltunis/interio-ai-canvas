

# Comprehensive Data Protection Audit: Prevent Future Data Loss

## Summary

I conducted a thorough audit of the entire codebase to identify any patterns that could cause accidental data deletion. The main fix we applied (removing auto-deletion from `handleDiscardChanges`) addressed the critical bug, but I found **one additional vulnerability** that needs to be fixed.

---

## Current Status

### FIXED (Already Applied)
- **`WindowManagementDialog.tsx`** - `handleDiscardChanges` now only clears local drafts, never deletes database data

### SAFE (No Changes Needed)
- **`WindowManagementSection.tsx`** - Line 71 has proper `confirm()` dialog before delete
- **`JobHandlers.tsx`** - Uses explicit `handleDeleteSurface` triggered by user action with confirmation
- **`SimplifiedTreatmentCard.tsx`** - Line 180 has proper `confirm()` dialog before delete
- **`useSurfaces.ts` hook** - Deletion only happens when explicitly called, includes project status check
- **`useTreatments.ts` hook** - Same pattern, safe
- **No `useEffect` auto-cleanup** - Previous dangerous patterns were already removed (confirmed by comment in `RoomsTab.tsx`)

### VULNERABILITY FOUND

**File:** `src/components/job-editor/WindowManager.tsx`, Line 115-124

```typescript
<Button
  size="sm"
  variant="ghost"
  onClick={(e) => {
    e.stopPropagation();
    deleteSurface.mutate(surface.id);  // ⚠️ NO CONFIRMATION!
  }}
>
  <Trash2 className="h-3 w-3" />
</Button>
```

**Risk:** A user can accidentally click the delete button and lose window data instantly without any confirmation dialog.

---

## Solution

### Part 1: Add Confirmation to WindowManager.tsx

Update the delete button handler to require explicit user confirmation:

```typescript
onClick={(e) => {
  e.stopPropagation();
  if (confirm("Delete this window? This action cannot be undone.")) {
    deleteSurface.mutate(surface.id);
  }
}}
```

### Part 2: Update Architecture Memory

Create/update a memory file to document the safety rules for all future development:

**File:** `MEMORY_data_deletion_safety_rules.md`

This will contain:
- List of banned patterns (auto-deletion in useEffect, RLS-dependent deletion decisions, etc.)
- Required patterns (user confirmation for ALL delete operations)
- Specific files/functions that have been audited

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/job-editor/WindowManager.tsx` | Add confirmation dialog before `deleteSurface.mutate()` |
| `MEMORY_data_deletion_safety_rules.md` | Create comprehensive safety documentation |

---

## Audit Summary

| Location | Delete Pattern | Confirmation | Status |
|----------|---------------|--------------|--------|
| `WindowManagementDialog.tsx` | `handleDiscardChanges` | N/A (removed) | ✅ FIXED |
| `WindowManager.tsx` | Button onClick | ❌ MISSING | ⚠️ TO FIX |
| `WindowManagementSection.tsx` | `handleDeleteSurface` | ✅ Has `confirm()` | ✅ SAFE |
| `JobHandlers.tsx` | `handleDeleteSurface` | ✅ User-triggered | ✅ SAFE |
| `SimplifiedTreatmentCard.tsx` | `handleDeleteTreatment` | ✅ Has `confirm()` | ✅ SAFE |
| `JobsTableView.tsx` | Delete project | ✅ Explicit action | ✅ SAFE |
| `JobDetailPage.tsx` | Delete job | ✅ Explicit action | ✅ SAFE |

---

## Safety Rules (To Be Documented)

### BANNED Patterns
1. **Auto-deletion in `useEffect`** - NEVER delete data in lifecycle hooks
2. **Heuristic-based deletion** - NEVER use `length === 0` or `cost === 0` to decide if deletion is safe
3. **RLS-dependent deletion decisions** - NEVER query database to decide if deletion is appropriate
4. **Unconfirmed delete buttons** - EVERY delete action MUST have user confirmation

### REQUIRED Patterns
1. **Explicit user confirmation** - All delete buttons must use `confirm()` or AlertDialog
2. **Status checks** - Verify project isn't locked before allowing deletion
3. **Permission checks** - Verify user has edit permissions
4. **Cascade awareness** - Warn users when deletion affects related data

---

## Protection for All Account Types

After this fix, the following are protected:

| Account Type | Protection Level |
|--------------|-----------------|
| **System Owner** | Full protection - no auto-deletion |
| **Owner** | Full protection - confirmation required |
| **Admin** | Full protection - permission + confirmation |
| **Staff** | Full protection - RLS + confirmation |
| **Dealer** | Full protection - RLS + confirmation |
| **Future roles** | Inherits same safety patterns |

---

## Testing Checklist

1. **WindowManager Delete Button Test**
   - Open a window in the WindowManager
   - Click the delete (trash) icon
   - Verify confirmation dialog appears
   - Click Cancel → Window should remain
   - Click OK → Window should delete

2. **Cross-Account Safety Test**
   - Test delete confirmation appears for all roles
   - Verify staff cannot delete windows they don't have permission to

3. **No Auto-Deletion Test**
   - Open any window dialog
   - Close without saving → Click Discard
   - Verify window data is NOT deleted
   - Refresh and confirm data persists

