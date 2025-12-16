-- Fix handle_new_user to support both metadata-based invitations and table-based lookups
-- This ensures compatibility with the invitation flow that passes invitation_user_id in metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  parent_id UUID;
  assigned_role TEXT := 'Owner';
  default_perms TEXT[];
  perm TEXT;
  inviter_user_id UUID;
  account_owner_id UUID;
BEGIN
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

  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    role,
    parent_account_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    parent_id,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    parent_account_id = EXCLUDED.parent_account_id,
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
      'metric',
      10.0,
      'GST',
      now(),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default number sequences
    INSERT INTO public.number_sequences (user_id, entity_type, prefix, next_number, padding, active)
    VALUES 
      (NEW.id, 'job', 'JOB-', 1, 4, true),
      (NEW.id, 'draft', 'DRF-', 1, 4, true),
      (NEW.id, 'quote', 'QTE-', 1, 4, true),
      (NEW.id, 'order', 'ORD-', 1, 4, true),
      (NEW.id, 'invoice', 'INV-', 1, 4, true)
    ON CONFLICT (user_id, entity_type) DO NOTHING;

    -- Seed default templates and options
    PERFORM public.seed_account_options(NEW.id);
  END IF;

  -- Create notification settings
  INSERT INTO public.user_notification_settings (
    user_id,
    email_notifications_enabled,
    sms_notifications_enabled,
    email_service_provider,
    sms_service_provider,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    true,
    false,
    'resend',
    'twilio',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Exception for user %: %', NEW.id, SQLERRM;
    -- Still return NEW to allow auth user creation, but log the error
    RETURN NEW;
END;
$$;

