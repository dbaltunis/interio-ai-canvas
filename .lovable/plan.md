

## Fix Team Assignment Notes + Team Hub Notifications

The current implementation has a **critical bug**: Supabase client doesn't throw exceptions - it returns `{ data, error }`. The try-catch blocks are useless and silently swallow all failures.

---

### Root Cause

```tsx
// ❌ BUG: This NEVER catches anything - Supabase returns { error }, doesn't throw
try {
  await supabase.from("project_notes").insert({...});
} catch (noteErr) {
  console.warn("Failed..."); // Never runs!
}
```

The insert silently fails and nothing is logged.

---

### The Fix

**File: `src/hooks/useProjectAssignments.ts`** (Lines 205-232)

Replace the broken try-catch with proper error checking:

```tsx
// Create a visible project note about the assignment
const { error: noteError } = await supabase
  .from("project_notes")
  .insert({
    project_id: projectId,
    user_id: effectiveOwnerId,
    content: `${assignedUserProfile?.display_name || 'Team member'} was assigned to this project by ${currentUserProfile?.display_name || 'Admin'}`,
    type: 'system_assignment'
  });

if (noteError) {
  console.warn("Failed to create assignment note:", noteError);
  // Don't throw - assignment already succeeded
}

// Send Team Hub direct message for better visibility
const { error: dmError } = await supabase
  .from("direct_messages")
  .insert({
    sender_id: user.id,
    recipient_id: userId,
    content: `You've been assigned to the project "${projectName || 'Untitled Project'}"! 🎉\n\nClick here to view: ${window.location.origin}/?jobId=${projectId}`
  });

if (dmError) {
  console.warn("Failed to send team hub message:", dmError);
  // Don't throw - assignment already succeeded
}
```

---

### What This Fixes

| Issue | Before | After |
|-------|--------|-------|
| Assignment note not created | Silent failure (try-catch doesn't work) | Proper error check + logging |
| Team Hub notification missing | Silent failure | Proper error check + logging |
| No visibility of failures | Nothing in console | Warnings logged for debugging |

---

### Expected Results

1. **Assignment note appears in Project Notes**: "John Smith was assigned to this project by Admin"
2. **Team Hub message sent**: Assigned user gets a notification with job link
3. **Errors are logged**: If something fails, we see it in console for debugging

---

### Single File Change

| File | Change |
|------|--------|
| `src/hooks/useProjectAssignments.ts` | Replace try-catch with proper `{ error }` destructuring and logging |

