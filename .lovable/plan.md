

# Fix Unfriendly Technical Error Notifications

## Problem Identified

The screenshot shows a raw database error: **"duplicate key value violates unique constraint 'unique_user_slot'"** - this is technical jargon that means nothing to end users.

**Root Causes:**

1. **`useJobStatuses.ts`** directly displays `error.message` from database errors
2. **`StatusSlotManager.tsx`** catches errors but only logs them - never shows user feedback
3. **`friendlyErrors.ts`** has a generic "duplicate" pattern but no specific pattern for status slots

---

## Solution Overview

Migrate error handling to use the existing `useFriendlyToast` system with enhanced error patterns for status management.

---

## Implementation Plan

### Step 1: Add Specific Error Pattern for Status Slots

**File:** `src/utils/friendlyErrors.ts`

Add a new pattern before the generic "duplicate" pattern to catch the `unique_user_slot` constraint:

```typescript
// Add BEFORE the generic "duplicate/conflict" pattern (around line 103)
{
  patterns: ['unique_user_slot'],
  error: {
    title: "Slot already in use",
    message: "This slot number is already assigned to another status. Please edit the existing status or choose a different slot.",
    icon: 'validation',
    persistent: true,
  }
},
```

### Step 2: Update useJobStatuses Hook to Use Friendly Errors

**File:** `src/hooks/useJobStatuses.ts`

Replace `useToast` with `useFriendlyToast` for better error handling:

| Line | Change |
|------|--------|
| 3 | Replace `useToast` import with `useFriendlyToast` |
| 39 | Use `showError` and `showSuccess` from `useFriendlyToast()` |
| 60-70 | Replace toast calls with `showSuccess()` and `showError()` |
| 93-103 | Replace toast calls with `showSuccess()` and `showError()` |
| 126-136 | Replace toast calls with `showSuccess()` and `showError()` |

**Key Changes:**
- Success: `showSuccess("Status saved", "Job status updated successfully")`
- Error: `showError(error, { context: 'update job status' })` - auto-parses technical errors

### Step 3: Fix StatusSlotManager Silent Errors

**File:** `src/components/settings/StatusSlotManager.tsx`

Currently, errors are caught but only logged with `console.error` - users see nothing.

| Line | Current | Fix |
|------|---------|-----|
| 19 | `import { useToast }` | `import { useFriendlyToast }` |
| 51 | `const { toast } = useToast()` | `const { showSuccess, showError } = useFriendlyToast()` |
| 108-114 | Success toast, silent error | Add `showError(error, { context: 'save status' })` in catch block |
| 127-133 | Success toast, silent error | Add `showError(error, { context: 'set default status' })` in catch block |
| 155-161 | Success toast, silent error | Add `showError(error, { context: 'apply template' })` in catch block |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/friendlyErrors.ts` | Add specific `unique_user_slot` pattern |
| `src/hooks/useJobStatuses.ts` | Migrate to `useFriendlyToast` |
| `src/components/settings/StatusSlotManager.tsx` | Add error notifications, use `useFriendlyToast` |

---

## Expected Results

### Before
```
Error
duplicate key value violates unique constraint "unique_user_slot"
```

### After
```
Slot already in use
This slot number is already assigned to another status. 
Please edit the existing status or choose a different slot.
```

The friendly error system will:
- Show amber/warning styling instead of harsh red
- Use clear, actionable language
- Persist until user dismisses (so they have time to read)
- Apply consistent styling across all status operations

---

## Technical Notes

- The `useFriendlyToast` hook is already implemented at `src/hooks/use-friendly-toast.ts`
- Error pattern matching is case-insensitive and scans the full error message
- Specific patterns (like `unique_user_slot`) should be placed BEFORE generic ones (like `duplicate`) in the array to ensure they match first

