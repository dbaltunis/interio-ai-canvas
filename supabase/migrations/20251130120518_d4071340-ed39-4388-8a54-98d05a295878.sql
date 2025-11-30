-- Phase 2: Auto-seed business_settings with measurement_units for new accounts
-- Update handle_new_user to create business_settings with default measurement_units

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
    
    -- Team members inherit settings from parent, don't seed
    
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
    
    -- Create business_settings with default measurement_units for new Owner accounts
    BEGIN
      INSERT INTO public.business_settings (
        user_id,
        measurement_units,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}'::text,
        now(),
        now()
      );
      RAISE LOG 'handle_new_user: Created business_settings with default measurement_units for %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Failed to create business_settings for %: %', NEW.id, SQLERRM;
      -- Don't fail the whole signup if business_settings creation fails
    END;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix existing account (Angely-Paris / RICHARD CALICE) with missing measurement_units
UPDATE public.business_settings
SET 
  measurement_units = '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}'::text,
  updated_at = now()
WHERE user_id = 'ab6f9fcf-dd1a-4f61-9e69-5a96f47c7ee9'
  AND (measurement_units IS NULL OR measurement_units = '');