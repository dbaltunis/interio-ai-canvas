-- Add unique constraint on user_id for user_profiles (required for ON CONFLICT)
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Fix handle_new_user function to use correct columns (remove email, full_name)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  parent_id UUID;
  assigned_role TEXT := 'Owner';
  default_perms TEXT[];
  perm TEXT;
  inviter_user_id UUID;
  account_owner_id UUID;
  user_display_name TEXT;
BEGIN
  -- Extract display name from metadata
  user_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'display_name', 
    split_part(NEW.email, '@', 1)
  );

  -- PRIORITY 1: Check if metadata contains invitation_user_id (preferred method)
  IF NEW.raw_user_meta_data ? 'invitation_user_id' THEN
    inviter_user_id := (NEW.raw_user_meta_data->>'invitation_user_id')::UUID;
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'invitation_role', 'Staff');
    
    RAISE LOG 'handle_new_user: Processing invited user % via metadata. Inviter: %, Role: %', NEW.id, inviter_user_id, assigned_role;
    
    -- Get the account owner from the inviter
    SELECT public.get_account_owner(inviter_user_id) INTO account_owner_id;
    
    -- If get_account_owner returns NULL, use inviter as parent
    IF account_owner_id IS NULL THEN
      account_owner_id := inviter_user_id;
      RAISE LOG 'handle_new_user: get_account_owner returned NULL, using inviter % as parent', inviter_user_id;
    END IF;
    
    -- Validate role - never allow Owner role from invitation
    IF assigned_role = 'Owner' OR assigned_role = 'System Owner' THEN
      RAISE LOG 'handle_new_user: WARNING - Invitation attempted to create Owner role, defaulting to Admin';
      assigned_role := 'Admin';
    END IF;
    
    parent_id := account_owner_id;
    
    -- Try to find and mark the invitation as accepted
    UPDATE user_invitations
    SET status = 'accepted', updated_at = now()
    WHERE invited_email = NEW.email
      AND user_id = inviter_user_id
      AND status = 'pending'
      AND expires_at > now();
    
  -- PRIORITY 2: Fall back to checking user_invitations table by email
  ELSE
    SELECT * INTO invitation_record
    FROM user_invitations
    WHERE invited_email = NEW.email
      AND status = 'pending'
      AND expires_at > now()
    LIMIT 1;

    IF FOUND THEN
      parent_id := invitation_record.user_id;
      assigned_role := COALESCE(invitation_record.role, 'Staff');
      
      -- Get the account owner from the inviter
      SELECT public.get_account_owner(parent_id) INTO account_owner_id;
      
      -- If get_account_owner returns NULL, use inviter as parent
      IF account_owner_id IS NULL THEN
        account_owner_id := parent_id;
      END IF;
      
      parent_id := account_owner_id;
      
      -- Mark invitation as accepted
      UPDATE user_invitations
      SET status = 'accepted', updated_at = now()
      WHERE id = invitation_record.id;
    ELSE
      parent_id := NULL;
      assigned_role := 'Owner';
    END IF;
  END IF;

  -- Create user profile (using correct columns - no email/full_name columns)
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    first_name,
    last_name,
    role,
    parent_account_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_display_name,
    split_part(user_display_name, ' ', 1),
    NULLIF(trim(substring(user_display_name from position(' ' in user_display_name))), ''),
    assigned_role,
    parent_id,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    role = EXCLUDED.role,
    parent_account_id = EXCLUDED.parent_account_id,
    is_active = true,
    updated_at = now();

  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Get default permissions for the role and insert them
  default_perms := public.get_default_permissions_for_role(assigned_role);
  
  IF default_perms IS NOT NULL THEN
    FOREACH perm IN ARRAY default_perms LOOP
      INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
      VALUES (NEW.id, perm, COALESCE(parent_id, NEW.id))
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    END LOOP;
  END IF;

  -- Create default business settings for new account owners only
  IF parent_id IS NULL AND assigned_role != 'System Owner' THEN
    INSERT INTO public.business_settings (
      user_id,
      measurement_units,
      tax_rate,
      tax_type,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'mm',
      15,
      'GST',
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;