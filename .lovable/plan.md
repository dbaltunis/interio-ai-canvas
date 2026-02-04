

## Comprehensive Notes & Notifications Fix Plan

Three major issues need to be addressed to get notes, team visibility, and notifications working properly:

---

### Issues Found

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| 1. Ugly technical error toasts | Notes/assignment code uses `useToast` instead of `useFriendlyToast` | User sees raw "row-level security policy" errors |
| 2. RLS violation on notes INSERT | `useProjectNotes.ts` uses `effectiveOwnerId` but RLS requires `auth.uid() = user_id` | Notes fail to save for team members |
| 3. Notes edit not saving | Update works but UI shows old `useToast` error handling | Minor issue - edit actually works |
| 4. Team assignment note fails silently | RLS policy blocks insert when user_id is set to current user but project belongs to account owner | Assignment note not created |
| 5. Wrong column name | `useClientProjectNotes.ts` uses `note_type` but column is `type` | Notes fail from client profile |

---

### Fix 1: Update RLS Policy for Multi-Tenant Notes

The current INSERT policy is too restrictive:
```sql
-- Current (broken for team members):
auth.uid() = user_id

-- Fixed (allows team members to create notes for their account):
user_id = public.get_effective_account_owner(auth.uid())
```

This allows team members to create notes under the account owner's ID, which is the correct multi-tenant pattern used throughout the app.

**SQL Migration:**
```sql
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can create their own project notes" ON public.project_notes;
DROP POLICY IF EXISTS "account_insert" ON public.project_notes;

-- Create unified insert policy for multi-tenant support
CREATE POLICY "project_notes_insert" ON public.project_notes
FOR INSERT TO authenticated
WITH CHECK (
  user_id = public.get_effective_account_owner(auth.uid())
);
```

---

### Fix 2: Apply Friendly Toast System to Notes Components

Replace raw `useToast` with `useFriendlyToast` in error handlers:

**ProjectNotesCard.tsx:**
```tsx
// Before
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast();
toast({ title: "Error", description: e?.message || "Unable to add note", variant: "destructive" });

// After
import { useFriendlyToast } from "@/hooks/use-friendly-toast";
const { showError, showSuccess } = useFriendlyToast();
showError(e, { context: 'save note' });
```

**JobNotesDialog.tsx:**
Same pattern - replace destructive toasts with friendly error handling.

**useProjectAssignments.ts:**
Replace the `onError` handler with friendly errors:
```tsx
onError: (error: any) => {
  if (error.message === "ALREADY_ASSIGNED" || error.code === "23505") {
    showInfo("Already Assigned", "This team member is already assigned to this project");
  } else {
    showError(error, { context: 'assign team member' });
  }
}
```

---

### Fix 3: Fix Column Name in useClientProjectNotes

```tsx
// Line 71 - Change:
note_type: "general",

// To:
type: "general",
```

---

### Fix 4: Make Assignment Side-Effects Resilient

The team assignment flow should not fail completely if a secondary operation fails (like sending the DM or creating the note). Wrap non-critical operations in try-catch:

```tsx
// After main assignment succeeds, wrap side effects:
try {
  await supabase.from("project_notes").insert({...});
} catch (noteErr) {
  console.warn("Failed to create assignment note:", noteErr);
  // Don't throw - assignment already succeeded
}

try {
  await supabase.from("direct_messages").insert({...});
} catch (dmErr) {
  console.warn("Failed to send team hub message:", dmErr);
  // Don't throw - assignment already succeeded
}
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useProjectNotes.ts` | Keep using `effectiveOwnerId` for multi-tenant support (RLS will be fixed) |
| `src/hooks/useClientProjectNotes.ts` | Fix `note_type` → `type` typo |
| `src/components/jobs/ProjectNotesCard.tsx` | Switch to `useFriendlyToast` |
| `src/components/jobs/JobNotesDialog.tsx` | Switch to `useFriendlyToast` |
| `src/hooks/useProjectAssignments.ts` | Switch to `useFriendlyToast`, wrap side-effects in try-catch |
| **Database Migration** | Fix INSERT RLS policy for `project_notes` table |

---

### Expected Results

1. **Friendly Errors**: Users see helpful messages like "Permission needed - Ask your account administrator" instead of raw RLS errors
2. **Notes Save Properly**: Team members can create/edit notes without RLS violations
3. **Team Assignment Notes Work**: When a team member is assigned, a visible note appears in Project Notes
4. **Team Hub Messages Work**: Assigned users receive a direct message with the job link
5. **No Silent Failures**: If secondary operations fail, the primary action (assignment) still succeeds

---

### Technical Summary

The root issue is a mismatch between:
- Multi-tenant data model (notes owned by account owner, not individual user)
- RLS policies (requiring `user_id = auth.uid()`)
- Error handling (raw technical errors instead of friendly messages)

This fix aligns all three layers to work together properly.

