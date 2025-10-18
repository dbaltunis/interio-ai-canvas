-- Fix the invitation role assignment issue
-- The problem: handle_new_user creates profile with 'User' role, then accept_user_invitation tries to update it
-- Solution: Pass the invitation role in metadata during signup and use it directly

-- 1. Update handle_new_user to use the invitation role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_user_id UUID;
  invitation_role TEXT;
BEGIN
  -- Check if user was invited (metadata contains invitation_user_id)
  IF NEW.raw_user_meta_data ? 'invitation_user_id' THEN
    inviter_user_id := (NEW.raw_user_meta_data->>'invitation_user_id')::UUID;
    invitation_role := COALESCE(NEW.raw_user_meta_data->>'invitation_role', 'User');
    
    -- Get the account owner from the inviter
    SELECT get_account_owner(inviter_user_id) INTO inviter_user_id;
    
    RAISE LOG 'handle_new_user: Creating profile for invited user % with parent % and role %', NEW.id, inviter_user_id, invitation_role;
    
    -- Insert user profile with the correct role from invitation
    INSERT INTO public.user_profiles (
      user_id, 
      display_name,
      parent_account_id,
      role
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      inviter_user_id,
      invitation_role -- Use the role from invitation metadata
    );
  ELSE
    -- Regular signup (not via invitation) - create as Owner
    RAISE LOG 'handle_new_user: Creating profile for regular signup user %', NEW.id;
    
    INSERT INTO public.user_profiles (
      user_id,
      display_name,
      role,
      parent_account_id
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      'Owner',
      NULL -- Owners have no parent
    );
  END IF;
  
  RETURN NEW;
END;
$$;