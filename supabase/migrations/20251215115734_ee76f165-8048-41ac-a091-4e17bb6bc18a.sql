-- Fix handle_new_user trigger function: user_profiles column names
-- Prevent regression: assert expected columns exist before updating function
DO $$
BEGIN
  -- user_profiles must have these columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profiles' AND column_name='display_name'
  ) THEN
    RAISE EXCEPTION 'Migration aborted: public.user_profiles.display_name column not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profiles' AND column_name='first_name'
  ) THEN
    RAISE EXCEPTION 'Migration aborted: public.user_profiles.first_name column not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profiles' AND column_name='last_name'
  ) THEN
    RAISE EXCEPTION 'Migration aborted: public.user_profiles.last_name column not found';
  END IF;
END;
$$;

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
BEGIN
  -- Check for pending invitation
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE invited_email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;

  IF FOUND THEN
    -- Invited user: link to inviter's account
    parent_id := invitation_record.user_id;
    assigned_role := COALESCE(invitation_record.role, 'Staff');

    UPDATE public.user_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = invitation_record.id;
  ELSE
    -- New account owner
    parent_id := NULL;
    assigned_role := 'Owner';
  END IF;

  -- Create / update user profile (NOTE: user_profiles has no email/full_name columns)
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
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(NEW.email, '@', 1)
    ),
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
    assigned_role,
    parent_id,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(public.user_profiles.display_name, EXCLUDED.display_name),
    first_name = COALESCE(public.user_profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.user_profiles.last_name, EXCLUDED.last_name),
    role = EXCLUDED.role,
    parent_account_id = EXCLUDED.parent_account_id,
    is_active = true,
    updated_at = now();

  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Assign default permissions for the role
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
END;
$$;