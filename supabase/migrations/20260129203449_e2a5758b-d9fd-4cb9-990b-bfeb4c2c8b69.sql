-- Fix 1: Update notification trigger to use correct column name and add error handling
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
    
    -- Create notification for owner (use correct column name: 'name' not 'project_name')
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

-- Fix 2: Drop duplicate/conflicting INSERT policies on notifications
DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
DROP POLICY IF EXISTS "account_insert" ON notifications;

-- Fix 3: Create a single unified INSERT policy that allows both user inserts and service role (triggers)
CREATE POLICY "Allow notification inserts"
ON notifications FOR INSERT
WITH CHECK (
  -- Allow postgres/service role (used by SECURITY DEFINER triggers)
  current_user = 'postgres' OR 
  -- Allow users to create their own notifications
  auth.uid() = user_id
);