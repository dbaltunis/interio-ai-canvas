
# FINALLY: Replace ALL Scary Red Toasts with User-Friendly Notifications

## The Problem

You've asked for this **three times**. A friendly toast system was built (`useFriendlyToast`), but only 2-3 places use it. The rest of the app shows:

- **Red "Error" boxes** with technical messages
- **"Permission Denied"** in scary red
- **"Project Locked"** with no clear explanation

Your users see alarming error messages instead of calm, actionable guidance.

---

## The Fix: Mass Migration to Friendly Toasts

### Files to Update (8 files, ~50+ toast calls)

| File | Current State | Toasts to Fix |
|------|--------------|---------------|
| `src/hooks/useRooms.ts` | Uses `useToast` with manual "Project Locked" check | 3 (create, update, delete) |
| `src/hooks/useSurfaces.ts` | Uses `useToast` with manual status check | 3 (create, update, delete) |
| `src/hooks/useTreatments.ts` | Uses `useToast` with manual status check | 3 (create, update, delete) |
| `src/hooks/useQuotes.ts` | Uses `useToast` with generic "Error" | 3 (create, update, delete) |
| `src/hooks/useWindows.ts` | Uses `useToast` with generic "Error" | 3 (create, update, delete) |
| `src/components/job-creation/JobHandlers.tsx` | **15+ toast calls** with "Error", "Permission Denied" | 15 |
| `src/components/job-creation/hooks/useProjectJobsActions.ts` | Uses `useToast` with "Permission Denied" | 2 |
| `src/components/room-management/EnhancedRoomView.tsx` | Uses `useToast` with "Error" | 1 |

---

## Step 1: Add Project Lock Pattern to Friendly Errors

Add to `src/utils/friendlyErrors.ts`:

```typescript
// Project status lock errors - persistent with clear guidance
{
  patterns: ['project is in', 'project locked', 'status prevents', 'cannot add room', 'cannot update', 'cannot delete'],
  error: {
    title: "Project is locked",
    message: "This project is in a status that prevents changes. To make edits, change the status back to 'Draft' or 'In Progress'.",
    icon: 'permission',
    persistent: true,
  }
}
```

---

## Step 2: Replace useToast with useFriendlyToast

### Before (Current - Scary Red)

```tsx
// JobHandlers.tsx line 36-43
if (!canEditJob) {
  toast({
    title: "Permission Denied",          // ❌ Scary
    description: "You don't have permission to edit this job.",
    variant: "destructive",              // ❌ Red box
  });
  return;
}
```

### After (Friendly Orange)

```tsx
// JobHandlers.tsx with useFriendlyToast
import { useFriendlyToast } from "@/hooks/use-friendly-toast";

const { showError, showSuccess } = useFriendlyToast();

if (!canEditJob) {
  showError(new Error("permission denied"), { context: 'edit this job' });
  return;  // Shows: "Permission needed" with soft orange styling
}
```

---

## Step 3: Hook Error Handlers

### Before (useRooms.ts line 112-122)

```tsx
onError: (error) => {
  const isStatusBlock = error.message?.includes('Project is in');
  toast({
    title: isStatusBlock ? "Project Locked" : "Error",
    description: isStatusBlock 
      ? "This project's status prevents editing..."
      : error.message || "Failed to create room. Please try again.",
    variant: isStatusBlock ? "default" : "destructive",
  });
}
```

### After (Clean, Automatic)

```tsx
import { showFriendlyError } from "@/hooks/use-friendly-toast";

onError: (error) => {
  showFriendlyError(error, 'create room');
  // Automatically detects:
  // - "Project is in..." → Shows "Project is locked" with instructions
  // - Network errors → Shows "Connection issue"  
  // - RLS errors → Shows "Permission needed"
  // - Unknown errors → Shows "Unable to create room. Please try again."
}
```

---

## What Users Will See

### Before (Current)
```text
┌─────────────────────────────────────┐
│ ❌ Error                            │  ← Red, scary
│ Failed to create room. Please try  │
│ again.                             │
└─────────────────────────────────────┘
```

### After (Friendly)
```text
┌─────────────────────────────────────┐
│ 🔒 Project is locked               │  ← Soft orange
│ This project is in a status that   │
│ prevents changes. To make edits,   │
│ change the status back to 'Draft'. │
└─────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/utils/friendlyErrors.ts` | Add project lock pattern |
| `src/hooks/useRooms.ts` | Replace toast with showFriendlyError |
| `src/hooks/useSurfaces.ts` | Replace toast with showFriendlyError |
| `src/hooks/useTreatments.ts` | Replace toast with showFriendlyError |
| `src/hooks/useQuotes.ts` | Replace toast with showFriendlyError |
| `src/hooks/useWindows.ts` | Replace toast with showFriendlyError |
| `src/components/job-creation/JobHandlers.tsx` | Replace useToast with useFriendlyToast, update all 15 handlers |
| `src/components/job-creation/hooks/useProjectJobsActions.ts` | Replace toast with showError |
| `src/components/room-management/EnhancedRoomView.tsx` | Replace toast with showError |

---

## Summary

| What | Count |
|------|-------|
| Files to modify | 9 |
| Toast calls to replace | ~35 |
| New friendly patterns to add | 1 (project lock) |

After this change, **every error in the job workflow** will show:
- Soft orange/amber styling (not angry red)
- Clear, plain-language titles
- Specific next steps ("change status to Draft")
- Appropriate icons (lock, wifi, key, etc.)

No more "Error" and "Permission Denied" in scary red boxes.
