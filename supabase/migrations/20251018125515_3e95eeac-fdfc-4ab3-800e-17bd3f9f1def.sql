-- ============================================================================
-- PHASE 1 & 2: Database Schema Fixes & Permission System Repair (FIXED)
-- ============================================================================

-- 1. Fix clients.created_by foreign key constraint (make nullable)
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_created_by_fkey;
ALTER TABLE public.clients ALTER COLUMN created_by DROP NOT NULL;

-- 2. Fix existing broken parent_account_id relationships FIRST
UPDATE public.user_profiles
SET parent_account_id = NULL
WHERE parent_account_id = user_id;

-- 3. NOW add CHECK constraint to prevent future self-referential parent_account_id
ALTER TABLE public.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_parent_account_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_parent_account_check
  CHECK (parent_account_id IS NULL OR parent_account_id != user_id);

-- 4. For invited users (non-Owner roles), find their correct parent from invitations
UPDATE public.user_profiles up
SET parent_account_id = ui.user_id
FROM public.user_invitations ui
WHERE up.role != 'Owner'
  AND up.parent_account_id IS NULL
  AND ui.invited_email = get_user_email(up.user_id)
  AND ui.status = 'accepted'
  AND ui.user_id IS NOT NULL;

-- 5. Update accept_user_invitation function to correctly set parent_account_id
CREATE OR REPLACE FUNCTION public.accept_user_invitation(
  invitation_token_param text,
  accepting_user_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record record;
  inviter_account_owner uuid;
  result jsonb;
BEGIN
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE invitation_token = invitation_token_param::uuid
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  SELECT COALESCE(parent_account_id, user_id) INTO inviter_account_owner
  FROM public.user_profiles
  WHERE user_id = invitation_record.user_id;

  UPDATE public.user_profiles
  SET 
    role = invitation_record.role,
    parent_account_id = inviter_account_owner,
    updated_at = now()
  WHERE user_id = accepting_user_id_param;

  PERFORM public.fix_user_permissions_for_role(accepting_user_id_param);

  UPDATE public.user_invitations
  SET status = 'accepted', updated_at = now()
  WHERE invitation_token = invitation_token_param::uuid;

  result := jsonb_build_object(
    'success', true,
    'role', invitation_record.role,
    'parent_account_id', inviter_account_owner
  );

  RETURN result;
END;
$$;

-- 6. Update fix_user_permissions_for_role to validate parent account structure
CREATE OR REPLACE FUNCTION public.fix_user_permissions_for_role(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    expected_perms text[];
    existing_perms text[];
    missing_perms text[];
    perm_to_add text;
    permissions_added int := 0;
    inviter_id uuid;
    seed_error text := NULL;
    parent_id uuid;
BEGIN
    SELECT up.role, up.parent_account_id INTO user_role, parent_id
    FROM public.user_profiles up
    WHERE up.user_id = target_user_id;
    
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;

    IF parent_id IS NOT NULL AND parent_id = target_user_id THEN
        UPDATE public.user_profiles
        SET parent_account_id = NULL
        WHERE user_id = target_user_id;
        parent_id := NULL;
    END IF;

    inviter_id := COALESCE(parent_id, target_user_id);
    expected_perms := public.get_default_permissions_for_role(user_role);
    
    SELECT array_agg(uper.permission_name) INTO existing_perms
    FROM public.user_permissions uper
    WHERE uper.user_id = target_user_id;
    
    existing_perms := COALESCE(existing_perms, ARRAY[]::text[]);
    
    SELECT array_agg(expected_perm) INTO missing_perms
    FROM unnest(expected_perms) AS expected_perm
    WHERE expected_perm != ALL(existing_perms);
    
    missing_perms := COALESCE(missing_perms, ARRAY[]::text[]);
    
    BEGIN
        FOREACH perm_to_add IN ARRAY missing_perms LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (target_user_id, perm_to_add, inviter_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
            permissions_added := permissions_added + 1;
        END LOOP;
        
        INSERT INTO public.permission_seed_log (
            user_id, role, permissions_added, success, triggered_by
        ) VALUES (
            target_user_id, user_role, missing_perms, true, 'manual_repair'
        );
        
    EXCEPTION WHEN OTHERS THEN
        seed_error := SQLERRM;
        INSERT INTO public.permission_seed_log (
            user_id, role, permissions_added, success, error_message, triggered_by
        ) VALUES (
            target_user_id, user_role, missing_perms, false, seed_error, 'manual_repair'
        );
    END;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_role', user_role,
        'parent_account_id', parent_id,
        'expected_permissions', expected_perms,
        'existing_permissions', existing_perms,
        'missing_permissions', missing_perms,
        'permissions_added', permissions_added,
        'seed_error', seed_error
    );
END;
$$;

-- 7. Fix currency inheritance in profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_currency text;
  parent_account uuid;
BEGIN
  parent_account := (NEW.raw_user_meta_data->>'parent_account_id')::uuid;
  
  IF parent_account IS NOT NULL THEN
    SELECT acs.currency INTO parent_currency
    FROM public.account_settings acs
    WHERE acs.account_owner_id = parent_account;
  END IF;

  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    is_active,
    parent_account_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    true,
    parent_account,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    display_name = COALESCE(public.user_profiles.display_name, excluded.display_name),
    is_active = true,
    updated_at = now();

  INSERT INTO public.account_settings (
    account_owner_id,
    currency,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(parent_currency, 'USD'),
    now(),
    now()
  )
  ON CONFLICT (account_owner_id) DO UPDATE
  SET updated_at = now();

  RETURN NEW;
END;
$$;

-- 8. Update clients RLS policies to properly use account hierarchy
DROP POLICY IF EXISTS "Users can view account clients" ON public.clients;

CREATE POLICY "Users can view account clients"
ON public.clients
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (
    has_permission('view_clients') 
    OR has_permission('view_all_clients') 
    OR is_admin()
  )
);

DROP POLICY IF EXISTS "Users can update clients based on permissions" ON public.clients;

CREATE POLICY "Users can update clients based on permissions"
ON public.clients
FOR UPDATE
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (
    has_permission('edit_all_clients')
    OR (has_permission('edit_own_clients') AND user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete clients based on permissions" ON public.clients;

CREATE POLICY "Users can delete clients based on permissions"
ON public.clients
FOR DELETE
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND has_permission('delete_clients')
);

-- 9. Fix get_team_presence to properly show all account members
CREATE OR REPLACE FUNCTION public.get_team_presence(search_param text DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  role text,
  last_seen timestamp with time zone,
  is_online boolean,
  status text,
  status_message text,
  avatar_url text,
  theme_preference text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH account_owner AS (
    SELECT get_account_owner(auth.uid()) as owner_id
  )
  SELECT 
    up.user_id,
    COALESCE(up.display_name, 'User') AS display_name,
    COALESCE(up.role, 'User') AS role,
    up.last_seen,
    COALESCE(up.is_online, false) AS is_online,
    CASE
      WHEN COALESCE(up.is_online, false) = true THEN 'online'
      WHEN up.last_seen IS NULL THEN 'never_logged_in'
      WHEN up.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
      ELSE 'away'
    END AS status,
    up.status_message,
    up.avatar_url,
    COALESCE(up.theme_preference, 'light') AS theme_preference
  FROM public.user_profiles up, account_owner ao
  WHERE
    get_account_owner(up.user_id) = ao.owner_id
    AND (search_param IS NULL OR up.display_name ILIKE '%' || search_param || '%');
$$;

-- 10. Run permission sync for all existing users
DO $$
DECLARE
  user_record record;
BEGIN
  FOR user_record IN 
    SELECT user_id FROM public.user_profiles WHERE role IS NOT NULL
  LOOP
    PERFORM public.fix_user_permissions_for_role(user_record.user_id);
  END LOOP;
END $$;