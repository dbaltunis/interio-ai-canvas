

# Critical Fix: Staff Cannot See Pricing Data - RLS Policy Bug

## Problem Summary

Staff members (like Daniel) who are assigned to projects via "Invite Team" can see the job in the Jobs list, but **cannot see any pricing data** inside the job. All windows show "No pricing data available."

## Root Cause Analysis

**TWO CRITICAL ISSUES IDENTIFIED:**

### Issue 1: Broken RLS Policy on `windows_summary` Table

The SELECT policy on `windows_summary` contains a critical logic error:

```sql
-- CURRENT (BROKEN):
OR (has_permission('view_assigned_jobs'::text) AND (p.user_id = auth.uid()))
```

This incorrectly requires the user to **OWN** the project (`p.user_id = auth.uid()`), which defeats the entire purpose of the assignment check. Staff members never own projects - they're assigned to them.

**Should be:**
```sql
-- CORRECT:
OR (has_permission('view_assigned_jobs'::text) AND user_is_assigned_to_project(p.id))
```

The same bug exists in the UPDATE policy (missing assignment check entirely).

### Issue 2: Missing Surface from Data Restoration

My earlier restoration script failed to restore one surface:
- **Room 1 Window 1** (ID: `f1487737-0b86-4abf-addf-010b85618a43`) is MISSING
- The `workshop_items` and `windows_summary` records exist but reference a non-existent surface

---

## Solution

### Part 1: Fix `windows_summary` RLS Policies

Drop and recreate the SELECT and UPDATE policies with correct assignment logic:

```sql
-- Fix SELECT policy
DROP POLICY IF EXISTS "Permission-based windows_summary SELECT" ON windows_summary;

CREATE POLICY "Permission-based windows_summary SELECT" ON windows_summary
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
      OR is_admin()
      OR has_permission('view_all_jobs'::text)
      OR p.user_id = auth.uid()
      -- FIXED: Check assignment, not ownership
      OR (has_permission('view_assigned_jobs'::text) AND user_is_assigned_to_project(p.id))
    )
  )
);

-- Fix UPDATE policy
DROP POLICY IF EXISTS "Permission-based windows_summary UPDATE" ON windows_summary;

CREATE POLICY "Permission-based windows_summary UPDATE" ON windows_summary
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
      OR is_admin()
      OR has_permission('edit_all_jobs'::text)
      OR p.user_id = auth.uid()
      -- FIXED: Add assignment check for staff
      OR (has_permission('edit_assigned_jobs'::text) AND user_is_assigned_to_project(p.id))
    )
  )
);
```

### Part 2: Restore Missing Surface

Insert the missing Window 1 in Room 1:

```sql
INSERT INTO surfaces (id, name, project_id, room_id, surface_type, user_id)
VALUES (
  'f1487737-0b86-4abf-addf-010b85618a43',
  'Window 1',
  '113a5360-eb1a-42bc-bff0-909821b9305b',
  '6ba3a29a-e702-4bc0-9a5e-c50a9904733c',
  'window',
  'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
) ON CONFLICT (id) DO NOTHING;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| SQL Migration | Fix windows_summary SELECT and UPDATE policies; restore missing surface |

---

## Technical Root Cause

The original policy was written with incorrect logic:

```text
INTENDED: "Staff with view_assigned_jobs can see windows_summary for projects they're ASSIGNED to"
ACTUAL:   "Staff with view_assigned_jobs can see windows_summary for projects they OWN"

Since staff never OWN projects (they're assigned), this condition ALWAYS fails.
```

---

## Expected Outcome After Fix

| Test Case | Before | After |
|-----------|--------|-------|
| Daniel (Staff) views assigned project | "No pricing data" | Sees all pricing |
| Daniel (Staff) views unassigned project | No access | No access (correct) |
| Owner views own project | Sees pricing | Sees pricing (unchanged) |
| Admin views any project | Sees pricing | Sees pricing (unchanged) |

---

## Testing Checklist

1. **Staff Visibility Test**
   - Log in as Daniel (Staff role)
   - Navigate to assigned project
   - Verify pricing data displays for ALL windows

2. **Window Count Verification**
   - Verify Room 1 shows 3 windows (Window 1, Window 2, Window 4)
   - Verify Room 2 shows 2 windows (Window 1, Window 2)
   - Total: 5 windows with pricing

3. **Security Test**
   - Verify Daniel CANNOT see pricing for projects he's NOT assigned to

