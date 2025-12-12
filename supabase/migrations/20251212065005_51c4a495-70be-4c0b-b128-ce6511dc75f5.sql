
-- Fix: Seed window_types for new account owners in handle_new_user trigger
-- This migration updates handle_new_user to automatically create default window types

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
BEGIN
  -- Check for pending invitation
  SELECT * INTO invitation_record
  FROM user_invitations
  WHERE invited_email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;

  IF FOUND THEN
    parent_id := invitation_record.invited_by;
    assigned_role := invitation_record.role;
    
    -- Mark invitation as accepted
    UPDATE user_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = invitation_record.id;
  ELSE
    parent_id := NULL;
    assigned_role := 'Owner';
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    role,
    parent_account_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    assigned_role,
    parent_id,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(user_profiles.display_name, EXCLUDED.display_name),
    role = COALESCE(user_profiles.role, EXCLUDED.role),
    is_active = true,
    updated_at = now();

  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Grant permissions based on role
  PERFORM public.fix_user_permissions_for_role(NEW.id);

  -- For account owners (no parent), create default business settings, number sequences, and window types
  IF parent_id IS NULL THEN
    -- Create business settings with PROPER DEFAULTS
    -- CRITICAL: measurement_units MUST use MM as internal standard
    INSERT INTO public.business_settings (
      user_id, 
      measurement_units,
      tax_rate,
      tax_type,
      pricing_settings,
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id, 
      '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}',
      0,  -- Default to 0, user configures their rate
      'none',  -- Default to none, user selects vat/gst/sales_tax
      '{"tax_inclusive": false, "default_markup_percentage": 50}',
      now(), 
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default number sequences for new account owners
    INSERT INTO public.number_sequences (user_id, entity_type, prefix, next_number, padding, active, created_at, updated_at)
    VALUES 
      (NEW.id, 'draft', 'DRAFT-', 1, 3, true, now(), now()),
      (NEW.id, 'quote', 'QUOTE-', 1, 3, true, now(), now()),
      (NEW.id, 'order', 'ORDER-', 1, 3, true, now(), now()),
      (NEW.id, 'invoice', 'INV-', 1, 3, true, now(), now()),
      (NEW.id, 'job', 'JOB-', 1, 3, true, now(), now())
    ON CONFLICT DO NOTHING;

    -- NEW: Seed default window types for the new account owner
    PERFORM public.seed_default_window_types(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Also seed window_types for existing accounts that don't have them
DO $$
DECLARE
  account_record RECORD;
  existing_count INTEGER;
BEGIN
  -- Find all account owners (users with parent_account_id IS NULL or = user_id)
  FOR account_record IN 
    SELECT DISTINCT user_id 
    FROM user_profiles 
    WHERE parent_account_id IS NULL 
       OR parent_account_id = user_id
  LOOP
    -- Check if this account already has window_types
    SELECT COUNT(*) INTO existing_count 
    FROM window_types 
    WHERE org_id = account_record.user_id;
    
    -- If no window_types exist, seed them
    IF existing_count = 0 THEN
      PERFORM public.seed_default_window_types(account_record.user_id);
      RAISE NOTICE 'Seeded window_types for account: %', account_record.user_id;
    END IF;
  END LOOP;
END;
$$;
