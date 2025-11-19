-- Update handle_new_user to auto-seed window types for new Owners
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_user_id UUID;
  invitation_role TEXT;
  seed_result INTEGER;
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
      invitation_role
    );
    
    -- Team members inherit window types from parent, don't seed
    
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
      NULL
    );
    
    -- Seed default window types for new account owners
    BEGIN
      SELECT seed_default_window_types(NEW.id) INTO seed_result;
      RAISE LOG 'handle_new_user: Seeded % window types for new owner %', seed_result, NEW.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Failed to seed window types for %: %', NEW.id, SQLERRM;
      -- Don't fail the whole signup if seeding fails
    END;
    
  END IF;
  
  RETURN NEW;
END;
$$;