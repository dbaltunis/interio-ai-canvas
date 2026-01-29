
# Investigation & Fix: Project Creation Failure + Document Numbering Testing

## Issue Summary

Your client reported: **"I'm unable to create a new project. When I click Create New Project, it shows 'Failed to create'."**

After thorough investigation of the database logs, RLS policies, triggers, and code, I found **multiple issues** that need to be fixed:

---

## Root Causes Identified

### Issue 1: Database Error - Invalid Column Reference

**Database Error Logged:**
```
column clients_1.first_name does not exist
```

**Location:** `src/hooks/useProjectAssignments.ts` (line 216)

**Current Code (BROKEN):**
```typescript
.select("clients(first_name, last_name, company_name)")
```

**Problem:** The `clients` table uses:
- `name` (single field for full name)
- `company_name` (correct)
- `contact_person` (for contact info)

There is NO `first_name` or `last_name` column in the `clients` table!

This query runs when assigning team members to projects, causing cascading errors.

---

### Issue 2: Notification Trigger Error

**Database Error Logged:**
```
new row violates row-level security policy for table "notifications"
```

**Trigger:** `notify_owner_on_project_creation`

**Current Code (MINOR BUG):**
```sql
COALESCE(NEW.project_name, 'Untitled')
```

**Problem:** The `projects` table uses column `name`, not `project_name`. However, since the function is `SECURITY DEFINER` owned by postgres, this should work but the notification INSERT may still be blocked by RLS for edge cases.

The RLS policy on `notifications` for INSERT is:
```sql
auth.uid() = user_id
```

But the trigger inserts with `user_id = effective_owner_id`, not the current user. Even with `SECURITY DEFINER`, there might be edge cases causing failures.

---

### Issue 3: RLS Policy on notifications Has Duplicate Policies

Current notifications INSERT policies:
1. `Users can create their own notifications` - `auth.uid() = user_id`
2. `account_insert` - `auth.uid() = user_id`

Both are identical but there's no SECURITY DEFINER bypass for triggers. The trigger function is owned by postgres but the INSERT statement may still be checked against RLS.

---

## Fix Plan

### Fix 1: Correct the clients Column Reference

**File:** `src/hooks/useProjectAssignments.ts` (lines 214-223)

**Before:**
```typescript
const { data: projectData } = await supabase
  .from("projects")
  .select("clients(first_name, last_name, company_name)")
  .eq("id", projectId)
  .maybeSingle();

const client = projectData?.clients as { first_name?: string; last_name?: string; company_name?: string } | null;
const clientName = client 
  ? (client.company_name || `${client.first_name || ''} ${client.last_name || ''}`.trim())
  : undefined;
```

**After:**
```typescript
const { data: projectData } = await supabase
  .from("projects")
  .select("clients(name, company_name, contact_person)")
  .eq("id", projectId)
  .maybeSingle();

const client = projectData?.clients as { name?: string; company_name?: string; contact_person?: string } | null;
const clientName = client 
  ? (client.company_name || client.name || 'Unknown Client')
  : undefined;
```

---

### Fix 2: Update the Notification Trigger

**Database Migration:**

```sql
CREATE OR REPLACE FUNCTION public.notify_owner_on_project_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  effective_owner_id UUID;
  creator_name TEXT;
BEGIN
  -- Get the effective account owner
  effective_owner_id := public.get_effective_account_owner(NEW.user_id);
  
  -- Only notify if the creator is not the owner
  IF effective_owner_id IS NOT NULL AND effective_owner_id != NEW.user_id THEN
    -- Get creator's name
    SELECT COALESCE(display_name, first_name, 'Team member') INTO creator_name
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    -- Create notification for owner (use correct column name: 'name')
    BEGIN
      INSERT INTO notifications (user_id, type, title, message, action_url)
      VALUES (
        effective_owner_id,
        'info',
        'New Project Created',
        creator_name || ' created a new project: ' || COALESCE(NEW.name, 'Untitled'),
        '/?jobId=' || NEW.id::TEXT
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the project creation
      RAISE WARNING 'Failed to create notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;
```

Key changes:
1. Changed `NEW.project_name` to `NEW.name` (correct column)
2. Added TRY/CATCH to prevent notification failures from blocking project creation

---

### Fix 3: Add Service Role Bypass for Notifications (Optional but Recommended)

Create an RLS policy that allows SECURITY DEFINER functions to insert notifications:

```sql
-- Allow triggers and backend functions to create notifications for any user
CREATE POLICY "Service role can create notifications"
ON notifications FOR INSERT
WITH CHECK (
  -- Allow postgres/service role (used by SECURITY DEFINER functions)
  current_user = 'postgres' OR 
  auth.uid() = user_id
);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useProjectAssignments.ts` | Fix clients column reference (first_name/last_name → name) |
| `supabase/migrations/[new].sql` | Fix notification trigger + add RLS bypass |

---

## Testing Plan

After these fixes, I recommend testing:

1. **Create a new project as a Staff/Dealer user** - Should succeed without errors
2. **Assign a team member to a project** - Should succeed and send notification
3. **Create a project with a client linked** - Should show correct client name in notifications
4. **Test the document numbering** - Create new jobs and verify sequential numbers (JOB-0085, JOB-0086, etc.)

---

## Summary

| Issue | Root Cause | Impact | Fix |
|-------|-----------|--------|-----|
| Project creation fails | Invalid column `first_name` in clients query | Blocks team assignment flow | Fix column reference |
| Notification RLS error | Trigger uses wrong column + RLS blocks inserts | Warning in logs | Fix trigger + add exception handler |
| Document numbering | Already fixed in previous migration | Numbers now sequential | Verify with testing |
