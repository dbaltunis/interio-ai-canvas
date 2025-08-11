-- Create link_user_to_account RPC to safely link a user to an account owner and seed default permissions
CREATE OR REPLACE FUNCTION public.link_user_to_account(
  child_user_id uuid,
  parent_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  account_owner_id uuid;
  existing_role text;
  default_perms text[];
  perm text;
BEGIN
  -- Resolve the account owner id: prefer explicit parent_user_id, otherwise current user's account owner
  IF parent_user_id IS NOT NULL THEN
    SELECT public.get_account_owner(parent_user_id) INTO account_owner_id;
  ELSE
    SELECT public.get_account_owner(auth.uid()) INTO account_owner_id;
  END IF;

  -- Upsert minimal profile and link to the account owner
  INSERT INTO public.user_profiles (user_id, display_name, is_active, parent_account_id, created_at, updated_at)
  VALUES (
    child_user_id,
    COALESCE(public.get_user_email(child_user_id), 'New User'),
    true,
    account_owner_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    parent_account_id = COALESCE(public.user_profiles.parent_account_id, EXCLUDED.parent_account_id),
    is_active = true,
    updated_at = NOW();

  -- Determine the user's role, default to 'User' if not set
  SELECT role INTO existing_role FROM public.user_profiles WHERE user_id = child_user_id;
  IF existing_role IS NULL THEN
    UPDATE public.user_profiles SET role = 'User', updated_at = NOW() WHERE user_id = child_user_id;
    existing_role := 'User';
  END IF;

  -- Seed user_permissions if empty for this user
  IF NOT EXISTS (
    SELECT 1 FROM public.user_permissions WHERE user_id = child_user_id
  ) THEN
    SELECT public.get_default_permissions_for_role(existing_role) INTO default_perms;

    IF default_perms IS NOT NULL THEN
      FOREACH perm IN ARRAY default_perms
      LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, created_by)
        VALUES (child_user_id, perm, auth.uid())
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'parent_account_id', account_owner_id, 'role', existing_role);
END;
$function$;