-- Fix: Allow user creation with invitation metadata
-- The issue: validate_user_profile_parent trigger blocks new user creation
-- Solution: Modify trigger to allow NULL parent_account_id during initial creation if user metadata contains invitation info

-- Drop the overly strict validation trigger
DROP TRIGGER IF EXISTS validate_user_profile_parent_trigger ON public.user_profiles;
DROP FUNCTION IF EXISTS public.validate_user_profile_parent();

-- Create a smarter validation trigger that allows initial creation
CREATE OR REPLACE FUNCTION public.validate_user_profile_parent()
RETURNS TRIGGER AS $$
BEGIN
  -- Owner users can have NULL parent_account_id
  IF NEW.role = 'Owner' THEN
    RETURN NEW;
  END IF;
  
  -- For INSERT operations, allow NULL temporarily if this is initial user creation
  -- The accept_user_invitation function will set it properly
  IF TG_OP = 'INSERT' AND NEW.parent_account_id IS NULL THEN
    -- Allow it for now, but log a warning
    RAISE LOG 'User profile created with NULL parent_account_id for non-owner: %. Will be set by accept_user_invitation.', NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- For UPDATE operations, enforce the constraint
  IF TG_OP = 'UPDATE' THEN
    -- Non-owner users MUST have a parent_account_id after initial creation
    IF NEW.parent_account_id IS NULL THEN
      RAISE EXCEPTION 'Non-owner users must have a valid parent_account_id. User role: %', NEW.role;
    END IF;
    
    -- Non-owner users cannot be their own parent
    IF NEW.parent_account_id = NEW.user_id THEN
      RAISE EXCEPTION 'Users cannot be their own parent. User: %, Parent: %', NEW.user_id, NEW.parent_account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER validate_user_profile_parent_trigger
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_user_profile_parent();

-- Update handle_new_user to set parent_account_id from invitation metadata if present
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_user_id UUID;
BEGIN
  -- Check if user was invited (metadata contains invitation_user_id)
  IF NEW.raw_user_meta_data ? 'invitation_user_id' THEN
    inviter_user_id := (NEW.raw_user_meta_data->>'invitation_user_id')::UUID;
    
    -- Get the account owner from the inviter
    SELECT get_account_owner(inviter_user_id) INTO inviter_user_id;
    
    RAISE LOG 'handle_new_user: Creating profile for invited user % with parent %', NEW.id, inviter_user_id;
    
    -- Insert user profile with parent_account_id set
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
      'User' -- Default role, will be updated by accept_user_invitation
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