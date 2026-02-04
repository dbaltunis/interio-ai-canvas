

## Test and Fix Remaining Issues

The code fix for assignment notes and Team Hub messages is now deployed, but:

1. **No new assignment has been tested yet** - The database shows no `system_assignment` notes or recent Team Hub messages
2. **RLS blocking `project_activity_log`** - The console shows an RLS error that will block activity logging

---

### Step 1: Fix `project_activity_log` RLS Policy

The INSERT policy requires `auth.uid() = user_id`, but this is correct and should work. However, let me check if the current user is an Admin (team member) vs Account Owner - this could cause issues.

**SQL Migration needed:**
```sql
-- Drop restrictive policy
DROP POLICY IF EXISTS "Insert project activities" ON public.project_activity_log;

-- Create multi-tenant aware policy
CREATE POLICY "project_activity_log_insert" ON public.project_activity_log
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR 
  user_id = public.get_effective_account_owner(auth.uid())
);
```

This allows team members to log activities under their own ID (for attribution) while still respecting the multi-tenant model.

---

### Step 2: Test Assignment Flow

After the RLS fix, test by:
1. Open a job
2. Click "Invite team" or "Limit Access"
3. Assign a team member
4. Verify:
   - ✅ Assignment succeeds
   - ✅ Note appears in Project Notes: "X was assigned by Y"
   - ✅ Team Hub message appears for assigned user with job link
   - ✅ Activity log shows "team_assigned" entry

---

### Files to Modify

| File | Change |
|------|--------|
| **Database Migration** | Fix `project_activity_log` INSERT RLS policy |

---

### Expected Results After Fix

When you assign a team member:

| Feature | Result |
|---------|--------|
| Assignment note | "John Smith was assigned to this project by Daniel (Admin)" appears in Project Notes |
| Team Hub message | John Smith sees: "You've been assigned to the project 'Project Name'! 🎉 Click here to view: [link]" |
| Activity log | Entry with `activity_type: team_assigned` and attribution |
| Email notification | Sent via edge function (already working) |

