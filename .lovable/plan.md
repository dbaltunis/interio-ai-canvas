
# Comprehensive Analysis: Team Assignment Permissions Testing & Issues

## Executive Summary

After thorough investigation, I've identified **3 critical issues** that need to be fixed for the team assignment system to work 100%:

---

## Issue 1: CRITICAL - RLS Policy Does NOT Check Project Assignments

### The Problem
When Mike or Ross (Staff role with `view_assigned_jobs` permission) logs in, they **cannot see assigned jobs** because the RLS policy on the `projects` table does not check the `project_assignments` table.

### Current RLS Policy on `projects`:
```sql
SELECT ... WHERE (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  AND (
    get_user_role(auth.uid()) = 'System Owner'
    OR get_user_role(auth.uid()) = 'Owner'
    OR is_admin()
    OR has_permission('view_all_jobs')
    OR has_permission('view_all_projects')
    OR (has_permission('view_own_jobs') AND auth.uid() = user_id)
    -- MISSING: Check project_assignments for view_assigned_jobs!
  )
)
```

### What's Missing:
```sql
OR (has_permission('view_assigned_jobs') AND EXISTS (
  SELECT 1 FROM project_assignments 
  WHERE project_id = projects.id 
  AND user_id = auth.uid() 
  AND is_active = true
))
```

### Same Issue Affects:
| Table | Current RLS | Missing project_assignments Check |
|-------|-------------|-----------------------------------|
| `projects` | Uses `has_permission('view_all_jobs')` only | Yes - CRITICAL |
| `rooms` | Same pattern | Yes |
| `surfaces` | Same pattern | Yes |
| `treatments` | Same pattern | Yes |
| `quotes` | Uses account isolation only | Yes |
| `project_activity_log` | Has correct check via `user_has_project_access()` | No - Already correct |

---

## Issue 2: No Email Notification for Assignments

### Current State
- In-app notification IS created when assigning a user (line 157-167 in `useProjectAssignments.ts`)
- **NO email notification** is sent
- Users may not see the in-app notification if they're not logged in

### What Users See Now
When assigned to a project:
1. **If logged in**: They see an in-app notification via the notifications table
2. **If NOT logged in**: They won't know until they log in and check notifications

### User's Expected Experience
When assigned to a project, users should receive:
1. In-app notification (already working)
2. Email notification with project details and a direct link

---

## Issue 3: NotificationDropdown is Appointment-Only

### Current State
The `NotificationDropdown` component in the header only shows **appointment notifications**, not general notifications including project assignments.

The general `notifications` table exists and is populated correctly, but there's no UI to display them - the header's NotificationDropdown was simplified and only shows appointment-related notifications.

---

## Database Verification

### Mike's Assignments:
| Project | Active |
|---------|--------|
| New Job 1/28/2026 | Yes |

### Ross's Assignments:
| Project | Active |
|---------|--------|
| New Job 1/29/2026 | Yes |

### Their Permissions:
Both Mike and Ross have:
- `view_assigned_jobs` - Can ONLY see jobs they're assigned to
- `create_jobs` - Can create new jobs
- `view_assigned_clients` - Can ONLY see clients linked to assigned jobs
- NO `view_all_jobs` - Cannot see all jobs

---

## What Mike/Ross Would See Today

### When NOT Assigned:
- **Projects tab**: Empty (no jobs visible)
- **Dashboard**: No job-related KPIs
- **Client tab**: Empty (if clients are only linked to unassigned jobs)

### When Assigned (but RLS is broken):
- **Projects tab**: Still empty (RLS doesn't check assignments!)
- This is the BUG - they're assigned but can't see the job

### After RLS Fix:
- **Projects tab**: Only assigned jobs visible
- **Job details**: All rooms, windows, treatments, accessories visible (if RLS is fixed on those tables too)
- **Client info**: Client linked to the job visible

---

## Implementation Plan

### Phase 1: Fix RLS Policies (CRITICAL)

Create a migration to update RLS on affected tables:

```sql
-- 1. Create helper function for assignment check
CREATE OR REPLACE FUNCTION public.user_is_assigned_to_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_assignments 
    WHERE project_id = p_project_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
$$;

-- 2. Update projects SELECT policy
DROP POLICY IF EXISTS "Permission-based project access" ON projects;
CREATE POLICY "Permission-based project access" ON projects FOR SELECT
USING (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  AND (
    get_user_role(auth.uid()) = 'System Owner'
    OR get_user_role(auth.uid()) = 'Owner'
    OR is_admin()
    OR has_permission('view_all_jobs')
    OR has_permission('view_all_projects')
    OR (has_permission('view_own_jobs') AND auth.uid() = user_id)
    OR (has_permission('view_jobs') AND auth.uid() = user_id)
    OR (has_permission('create_jobs') AND auth.uid() = user_id)
    -- NEW: Check project_assignments for view_assigned_jobs
    OR (has_permission('view_assigned_jobs') AND user_is_assigned_to_project(id))
  )
);

-- 3. Similarly update rooms, surfaces, treatments, quotes
```

**Tables to Update:**
- `projects` (SELECT, UPDATE, DELETE)
- `rooms` (SELECT, UPDATE, DELETE)
- `surfaces` (SELECT, UPDATE, DELETE)
- `treatments` (SELECT, UPDATE, DELETE)
- `quotes` (SELECT, UPDATE, DELETE)

### Phase 2: Add Email Notification for Assignments

Create an edge function `send-assignment-notification`:

```typescript
// supabase/functions/send-assignment-notification/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

serve(async (req) => {
  const { assignedUserEmail, assignedUserName, projectName, projectId, assignedBy } = await req.json();
  
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  
  await resend.emails.send({
    from: "InterioApp <notifications@interioapp.com>",
    to: [assignedUserEmail],
    subject: `You've been assigned to "${projectName}"`,
    html: `
      <h1>New Project Assignment</h1>
      <p>Hi ${assignedUserName},</p>
      <p>${assignedBy} has assigned you to the project <strong>${projectName}</strong>.</p>
      <p><a href="https://interioapp-ai.lovable.app/?jobId=${projectId}">View Project</a></p>
    `
  });
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

Update `useProjectAssignments.ts` to call this function after assignment.

### Phase 3: Display General Notifications

Update the header to include a general notifications indicator that shows project assignment notifications alongside appointment notifications.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/XXXXXX_fix_project_assignments_rls.sql` | **CREATE** | Fix RLS policies to check project_assignments |
| `supabase/functions/send-assignment-notification/index.ts` | **CREATE** | Email notification for assignments |
| `src/hooks/useProjectAssignments.ts` | Modify | Call email notification function |
| `src/components/layout/ResponsiveHeader.tsx` | Modify | Show general notifications indicator |

---

## Testing Checklist

After implementation, verify:

1. **Mike (Staff with view_assigned_jobs)**:
   - [ ] Cannot see unassigned jobs
   - [ ] CAN see jobs assigned to him
   - [ ] Can see all rooms in assigned jobs
   - [ ] Can see all windows/surfaces in assigned jobs
   - [ ] Can see all treatments in assigned jobs
   - [ ] Can see client info for assigned jobs
   - [ ] Receives in-app notification when assigned
   - [ ] Receives email notification when assigned

2. **Ross (Staff with view_assigned_jobs)**:
   - Same checklist as Mike

3. **Kuldeep (Admin with view_all_jobs)**:
   - [ ] CAN see all jobs regardless of assignment
   - [ ] Can assign team members via "Manage Access"

4. **Owner**:
   - [ ] CAN see all jobs
   - [ ] Can assign/unassign team members
   - [ ] Sees accurate team access status in job list

---

## Priority

1. **CRITICAL**: Fix RLS policies - Without this, assigned users literally cannot see their jobs
2. **HIGH**: Email notifications - Important for users who aren't constantly logged in
3. **MEDIUM**: General notifications UI - Nice to have for visibility
