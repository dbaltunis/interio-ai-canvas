

# Fix Plan: Greg's Login Issue - Edge Function & Trigger Bug

## Executive Summary

Greg (greg@cccone.com.au) cannot login because the `create-invited-user` edge function fails with a **database trigger error**. The root cause is a broken trigger that references non-existent columns in `auth.users`.

---

## Root Cause Analysis

### Issue #1: Broken Database Trigger

**Error from logs:**
```
record "new" has no field "parent_account_id"
```

**Location:** Trigger `on_auth_user_created_shopify_statuses` on `auth.users` table

**Problem:** The trigger function `create_default_shopify_statuses()` tries to access:
- `NEW.role` - Exists in `auth.users` but contains "authenticated", not "Owner/Manager"
- `NEW.parent_account_id` - **DOES NOT EXIST** in `auth.users` table

This crashes user creation for ALL invited users.

### Issue #2: Missing Edge Function Configuration

The `create-invited-user` edge function exists in code but is **NOT listed in `supabase/config.toml`**. While it appears to be deployed, proper configuration should be added.

---

## Fix #1: Correct the Database Trigger (SQL Migration)

The trigger should only run on the `user_profiles` table (where `role` and `parent_account_id` exist), not on `auth.users`.

### Option A: Drop and recreate trigger on correct table

```sql
-- Drop the broken trigger from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_shopify_statuses ON auth.users;

-- Recreate trigger on user_profiles table instead
CREATE TRIGGER on_user_profile_created_shopify_statuses
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shopify_statuses();
```

### Option B: Fix the function to not depend on non-existent columns

If we need to keep it on `auth.users`, update the function to not reference `parent_account_id`:

```sql
CREATE OR REPLACE FUNCTION public.create_default_shopify_statuses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_role text;
  profile_parent uuid;
BEGIN
  -- Get role and parent from user_profiles (not NEW which is auth.users)
  SELECT role, parent_account_id 
  INTO profile_role, profile_parent
  FROM user_profiles 
  WHERE user_id = NEW.id;
  
  -- Only create for account owners (not team members)
  IF profile_role IN ('Owner', 'System Owner') 
     AND (profile_parent IS NULL OR profile_role = 'System Owner') THEN
    
    -- Check if statuses already exist
    IF NOT EXISTS (SELECT 1 FROM shopify_sync_statuses WHERE user_id = NEW.id) THEN
      INSERT INTO shopify_sync_statuses (user_id, job_status, quote_status, is_active, created_at, updated_at)
      VALUES 
        (NEW.id, 'quote-pending', 'pending', true, NOW(), NOW()),
        (NEW.id, 'quote-draft', 'draft', true, NOW(), NOW()),
        (NEW.id, 'quote-sent', 'accepted', true, NOW(), NOW()),
        (NEW.id, 'order-confirmed', 'accepted', true, NOW(), NOW()),
        (NEW.id, 'completed', 'accepted', true, NOW(), NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
```

**Recommendation:** Option A is cleaner - move the trigger to user_profiles where the data actually exists.

---

## Fix #2: Add Edge Function Configuration

Add the missing entry to `supabase/config.toml`:

```toml
[functions.create-invited-user]
verify_jwt = false  # Must be false - called before user is authenticated
```

---

## Fix #3: Verify Invitation Flow

Once the trigger is fixed:
1. Greg's invitation is still **pending** and **valid** (expires 2026-02-08)
2. The invitation link should work immediately after the fix
3. No need to resend the invitation

---

## Affected Files

| File | Change |
|------|--------|
| `supabase/config.toml` | Add `create-invited-user` function entry |
| SQL Migration (via Supabase dashboard) | Fix `create_default_shopify_statuses` trigger |

---

## Manager Permissions Verification

Greg's invitation includes these Manager permissions (all correctly configured):
- `view_all_jobs`, `create_jobs`, `edit_all_jobs`
- `view_all_clients`, `create_clients`, `edit_all_clients`
- `view_all_calendar`, `view_inventory`, `manage_inventory`
- `view_templates`, `view_window_treatments`
- `view_team_members`, `view_team_performance`
- `send_emails`, `view_emails`, `view_workroom`

These match the Manager role in `src/constants/permissions.ts`. Permissions are NOT the issue.

---

## Implementation Steps

### Step 1: Fix the broken trigger (SQL - run in Supabase Dashboard)

```sql
-- Option A: Move trigger to user_profiles table
DROP TRIGGER IF EXISTS on_auth_user_created_shopify_statuses ON auth.users;

-- The function needs to reference user_profiles table data, not NEW from auth.users
CREATE OR REPLACE FUNCTION public.create_default_shopify_statuses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create for account owners (not team members)
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    
    -- Check if statuses already exist
    IF NOT EXISTS (SELECT 1 FROM shopify_sync_statuses WHERE user_id = NEW.user_id) THEN
      INSERT INTO shopify_sync_statuses (user_id, job_status, quote_status, is_active, created_at, updated_at)
      VALUES 
        (NEW.user_id, 'quote-pending', 'pending', true, NOW(), NOW()),
        (NEW.user_id, 'quote-draft', 'draft', true, NOW(), NOW()),
        (NEW.user_id, 'quote-sent', 'accepted', true, NOW(), NOW()),
        (NEW.user_id, 'order-confirmed', 'accepted', true, NOW(), NOW()),
        (NEW.user_id, 'completed', 'accepted', true, NOW(), NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on user_profiles instead
CREATE TRIGGER on_user_profile_created_shopify_statuses
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shopify_statuses();
```

### Step 2: Update config.toml

Add missing edge function configuration.

### Step 3: Test

Have Greg click the invitation link again - it should work immediately.

---

## Testing Checklist

| Test | Expected Result |
|------|-----------------|
| Greg accepts invitation | No "Edge Function returned non-2xx" error |
| Greg signs in | Redirects to dashboard |
| Greg views projects | Can see Daniel's CCCO projects |
| Greg creates job | Job created successfully |
| New user signup (any) | Works without trigger error |

