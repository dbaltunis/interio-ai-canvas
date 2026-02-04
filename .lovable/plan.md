
# Deep Investigation Results: Team Assignment Notifications

## Summary of Issues Found

I've conducted a thorough investigation of the recent changes and the entire team assignment flow. Here's what I found:

---

## 1. CRITICAL BUG: `projectName` Not Being Passed

**Location**: `src/components/jobs/ProjectTeamAssignDialog.tsx`, line 156

**Problem**: When the dialog calls `assignUser.mutateAsync`, it does NOT pass the `projectName`:

```tsx
// Current (BROKEN):
assignUser.mutateAsync({ projectId, userId: memberId, role: "member" })

// Should be:
assignUser.mutateAsync({ projectId, userId: memberId, role: "member", projectName })
```

**Impact**: 
- Team Hub message shows "Untitled Project" instead of actual project name
- This makes notifications useless and confusing

**Evidence**: The `projectName` prop IS available in the component (line 35), but is never used in the save function.

---

## 2. RLS Policies Verified OK

The RLS migration we applied is working:

| Table | Policy | Status |
|-------|--------|--------|
| `project_activity_log` | INSERT allows `user_id = auth.uid() OR user_id = get_effective_account_owner(auth.uid())` | OK |
| `project_notes` | INSERT requires `user_id = get_effective_account_owner(auth.uid())` | OK |
| `direct_messages` | INSERT requires `sender_id = auth.uid()` | OK |

---

## 3. Code Error Handling Verified OK

The Supabase error handling fix in `useProjectAssignments.ts` (lines 206-232) is correct:

```tsx
// Notes insertion with proper error check
const { error: noteError } = await supabase.from("project_notes").insert({...});
if (noteError) {
  console.warn("Failed to create assignment note:", noteError);
}

// DM insertion with proper error check  
const { error: dmError } = await supabase.from("direct_messages").insert({...});
if (dmError) {
  console.warn("Failed to send team hub message:", dmError);
}
```

---

## 4. Database Evidence: No Notifications Created Yet

| Query | Result |
|-------|--------|
| `project_notes WHERE type = 'system_assignment'` | **0 rows** |
| `direct_messages WHERE content LIKE '%assigned%'` | **0 rows** |
| Last assignment date | Feb 1, 2026 (BEFORE today's fixes) |

**Conclusion**: No new assignments have been made since the fixes were deployed today, so the notifications haven't been triggered yet.

---

## 5. Security Scan Findings (Unrelated to Assignment)

The security scan found several warnings that should be addressed separately:

| Issue | Severity | Tables |
|-------|----------|--------|
| "RLS Policy Always True" (INSERT/UPDATE with `WITH CHECK (true)`) | WARN | `appointments_booked`, `client_inquiries`, `store_inquiries`, `pipeline_analytics`, `work_order_shares` |
| "Function Search Path Mutable" | WARN | 15 functions without `SET search_path` |
| Tables with `anon` SELECT policies | ERROR | `clients`, `projects`, `rooms`, `workshop_items` (needed for share links - likely intentional) |

These are separate from the assignment issue but represent security hygiene items.

---

## 6. Root Cause Summary

| Issue | Root Cause | Status |
|-------|------------|--------|
| Assignment notes not created | Code fix applied, needs testing with new assignment | Ready to test |
| Team Hub DMs not sent | Code fix applied, needs testing with new assignment | Ready to test |
| Project name shows "Untitled" | **BUG: `projectName` not passed to mutation** | Needs fix |
| Activity log not recorded | RLS policy fixed, code working | Ready to test |

---

## Required Fix

**File**: `src/components/jobs/ProjectTeamAssignDialog.tsx`

**Line 156**: Add `projectName` to the mutation call:

```tsx
// FROM:
assignUser.mutateAsync({ projectId, userId: memberId, role: "member" })

// TO:
assignUser.mutateAsync({ projectId, userId: memberId, role: "member", projectName })
```

This is a 1-line fix that will ensure the Team Hub notification shows the correct project name.

---

## Testing After Fix

Once fixed, perform a new team assignment and verify:

1. **Project Notes**: Check that a `system_assignment` note appears
2. **Team Hub**: Check that the assigned user receives a DM with the project name and link
3. **Activity Log**: Check for `team_assigned` entry in the project activity
4. **Email**: Assignment email should be sent (existing functionality)

---

## Technical Details

### Files Changed in This Session
1. `src/hooks/useProjectAssignments.ts` - Fixed Supabase error handling (try-catch → error object)
2. `supabase/migrations/20260204144338_...sql` - Fixed `project_activity_log` INSERT RLS policy

### File That Still Needs Fix
1. `src/components/jobs/ProjectTeamAssignDialog.tsx` - Pass `projectName` to mutation

