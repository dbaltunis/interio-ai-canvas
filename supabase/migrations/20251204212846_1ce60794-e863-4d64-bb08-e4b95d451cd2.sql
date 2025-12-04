-- Drop and recreate seed_account_options with correct return type
DROP FUNCTION IF EXISTS public.seed_account_options(uuid);

CREATE OR REPLACE FUNCTION public.seed_account_options(target_account_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if account already has treatment options
  IF EXISTS (SELECT 1 FROM treatment_options WHERE account_id = target_account_id LIMIT 1) THEN
    RETURN; -- Already seeded
  END IF;

  -- Insert basic treatment options for all new accounts
  INSERT INTO treatment_options (account_id, treatment_category, key, label, type, sort_order, is_required, show_in_quote)
  VALUES
    (target_account_id, 'all', 'control_type', 'Control Type', 'select', 1, false, true),
    (target_account_id, 'all', 'control_side', 'Control Side', 'select', 2, false, true),
    (target_account_id, 'all', 'mount_type', 'Mount Type', 'select', 3, false, true),
    (target_account_id, 'roller', 'roll_direction', 'Roll Direction', 'select', 4, false, true),
    (target_account_id, 'roller', 'headrail', 'Headrail Selection', 'select', 5, false, true),
    (target_account_id, 'roller', 'bottom_bar', 'Bottom Bar', 'select', 6, false, true),
    (target_account_id, 'curtain', 'heading_type', 'Heading Type', 'select', 1, false, true),
    (target_account_id, 'curtain', 'lining', 'Lining', 'select', 2, false, true),
    (target_account_id, 'curtain', 'track_type', 'Track Type', 'select', 3, false, true),
    (target_account_id, 'venetian', 'slat_size', 'Slat Size', 'select', 1, false, true),
    (target_account_id, 'venetian', 'tilt_control', 'Tilt Control', 'select', 2, false, true),
    (target_account_id, 'vertical', 'vane_width', 'Vane Width', 'select', 1, false, true),
    (target_account_id, 'vertical', 'draw_type', 'Draw Type', 'select', 2, false, true),
    (target_account_id, 'cellular', 'cell_size', 'Cell Size', 'select', 1, false, true),
    (target_account_id, 'cellular', 'opacity', 'Opacity', 'select', 2, false, true),
    (target_account_id, 'roman', 'fold_style', 'Fold Style', 'select', 1, false, true),
    (target_account_id, 'roman', 'lining', 'Lining', 'select', 2, false, true),
    (target_account_id, 'shutter', 'blade_size', 'Blade Size', 'select', 1, false, true),
    (target_account_id, 'shutter', 'frame_style', 'Frame Style', 'select', 2, false, true);
END;
$$;

-- Update handle_new_user
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

  -- For new Owners (not invited team members), seed account defaults
  IF _invited_by IS NULL AND _role = 'Owner' THEN
    -- Seed treatment options for this new account
    PERFORM public.seed_account_options(NEW.id);
    
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

-- More RLS policy fixes
DROP POLICY IF EXISTS "Users can view templates in their account" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can update templates in their account" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can delete templates in their account" ON public.quote_templates;

CREATE POLICY "Users can view templates in their account"
ON public.quote_templates FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create templates"
ON public.quote_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update templates in their account"
ON public.quote_templates FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete templates in their account"
ON public.quote_templates FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- collections policies
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can create collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;

CREATE POLICY "Account members can view collections"
ON public.collections FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can create collections"
ON public.collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account members can update collections"
ON public.collections FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can delete collections"
ON public.collections FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- rooms policies
DROP POLICY IF EXISTS "Users can view their own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can update their own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can delete their own rooms" ON public.rooms;

CREATE POLICY "Account members can view rooms"
ON public.rooms FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can create rooms"
ON public.rooms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account members can update rooms"
ON public.rooms FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can delete rooms"
ON public.rooms FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- pricing_grids policies
DROP POLICY IF EXISTS "Users can view their own pricing grids" ON public.pricing_grids;
DROP POLICY IF EXISTS "Users can create pricing grids" ON public.pricing_grids;
DROP POLICY IF EXISTS "Users can update their own pricing grids" ON public.pricing_grids;
DROP POLICY IF EXISTS "Users can delete their own pricing grids" ON public.pricing_grids;

CREATE POLICY "Account members can view pricing grids"
ON public.pricing_grids FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can create pricing grids"
ON public.pricing_grids FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account members can update pricing grids"
ON public.pricing_grids FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can delete pricing grids"
ON public.pricing_grids FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());