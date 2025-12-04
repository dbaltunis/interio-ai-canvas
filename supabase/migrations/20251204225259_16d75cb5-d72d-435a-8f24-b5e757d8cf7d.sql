-- Remove automatic seeding from handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _invited_by uuid;
  _account_owner_id uuid;
BEGIN
  -- Get role from invitation if exists
  SELECT role, invited_by INTO _role, _invited_by
  FROM public.user_invitations
  WHERE email = NEW.email
  AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to Owner if no invitation
  IF _role IS NULL THEN
    _role := 'Owner';
  END IF;

  -- Determine account owner
  IF _invited_by IS NOT NULL THEN
    _account_owner_id := public.get_effective_account_owner(_invited_by);
  ELSE
    _account_owner_id := NEW.id;
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, email, role, account_owner_id)
  VALUES (NEW.id, NEW.email, _role, _account_owner_id);

  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  -- For new Owners (not invited team members), create default settings only
  -- NOTE: Removed seed_account_options() - users now create options manually
  IF _invited_by IS NULL AND _role = 'Owner' THEN
    -- Create default business settings
    INSERT INTO public.business_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create default account settings
    INSERT INTO public.account_settings (account_owner_id)
    VALUES (NEW.id)
    ON CONFLICT (account_owner_id) DO NOTHING;
  END IF;

  -- Update invitation status if applicable
  IF _invited_by IS NOT NULL THEN
    UPDATE public.user_invitations
    SET status = 'accepted'
    WHERE email = NEW.email
    AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$;