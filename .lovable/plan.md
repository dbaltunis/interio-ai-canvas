
# URGENT FIX: Infinite Recursion in Projects RLS Policy

## Problem
The app shows NO DATA because the RLS policy we created for Issue 2 causes infinite recursion when authenticated users query the `projects` table.

## Root Cause
The "Allow public read access via share link" policy on `projects` queries `work_order_share_links`, but `work_order_share_links` has policies that query back to `projects`, creating a circular dependency.

## Solution
Create a SECURITY DEFINER function to check share link access WITHOUT triggering RLS on related tables. This breaks the recursion chain.

## Implementation

### Step 1: Create Security Definer Function
Create a function that bypasses RLS to check if a project has an active share link:

```sql
CREATE OR REPLACE FUNCTION public.project_has_active_share_link(project_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM work_order_share_links
    WHERE project_id = project_uuid
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;
```

### Step 2: Update Projects Policy
Replace the problematic subquery with the function call:

```sql
DROP POLICY IF EXISTS "Allow public read access via share link" ON projects;
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon, authenticated
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  public.project_has_active_share_link(id)
);
```

### Step 3: Apply Same Fix to Other Tables
Update `workshop_items` and `clients` policies similarly to use security definer functions.

## Files to Create
| File | Purpose |
|------|---------|
| `supabase/migrations/[timestamp]_fix_rls_recursion.sql` | Fix the infinite recursion |

## Expected Result
- App data will load again immediately
- Share links will still work for both logged-in and anonymous users
- No more infinite recursion errors
