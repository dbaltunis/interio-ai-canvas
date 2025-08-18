-- Fix the accept_user_invitation function to properly set parent_account_id
CREATE OR REPLACE FUNCTION public.accept_user_invitation(invitation_token_param text, user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    invitation_record record;
    inviter_id uuid;
    account_owner_id uuid;
    perm text;
    result jsonb;
    perms_to_seed text[] := ARRAY[]::text[];
begin
    -- Fetch invitation (pending & not expired)
    select * into invitation_record
    from public.user_invitations 
    where invitation_token = invitation_token_param::uuid
      and status = 'pending'
      and expires_at > now();

    if not found then
      return '{"success": false, "error": "Invalid or expired invitation"}'::jsonb;
    end if;

    -- Resolve inviter id (by email) and their account owner
    select id into inviter_id from auth.users where email = invitation_record.invited_by_email limit 1;
    if inviter_id is null then
      inviter_id := invitation_record.user_id; -- fallback to invitation creator
    end if;
    
    -- Get the account owner from the inviter
    select public.get_account_owner(inviter_id) into account_owner_id;
    
    -- If inviter is the account owner, use their ID directly
    if account_owner_id is null then
      account_owner_id := inviter_id;
    end if;

    -- Upsert user profile, linking to inviter's account owner
    insert into public.user_profiles (
        user_id,
        display_name,
        role,
        permissions,
        is_active,
        parent_account_id
    ) values (
        user_id_param,
        coalesce(invitation_record.invited_name, invitation_record.invited_email),
        invitation_record.role,
        coalesce(invitation_record.permissions, '{}'::jsonb),
        true,
        account_owner_id
    )
    on conflict (user_id) do update set
        role = invitation_record.role,
        permissions = coalesce(invitation_record.permissions, '{}'::jsonb),
        is_active = true,
        parent_account_id = account_owner_id, -- Always update parent_account_id
        display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
        updated_at = now();

    -- Clear existing permissions first to ensure clean state
    delete from public.user_permissions where user_id = user_id_param;

    -- Handle permissions seeding
    if invitation_record.permissions is not null and jsonb_typeof(invitation_record.permissions) = 'object' then
      -- Use explicit permissions from invitation (as object)
      for perm in select key from jsonb_each(invitation_record.permissions) where value::boolean = true
      loop
        insert into public.user_permissions (user_id, permission_name, created_by)
        values (user_id_param, perm, inviter_id)
        on conflict do nothing;
      end loop;
    elsif invitation_record.permissions is not null and jsonb_typeof(invitation_record.permissions) = 'array' then
      -- Use explicit permissions from invitation (as array)
      for perm in select jsonb_array_elements_text(invitation_record.permissions)
      loop
        insert into public.user_permissions (user_id, permission_name, created_by)
        values (user_id_param, perm, inviter_id)
        on conflict do nothing;
      end loop;
    else
      -- Seed defaults based on role when invitation had no explicit permissions
      perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
      if perms_to_seed is not null then
        foreach perm in array perms_to_seed loop
          insert into public.user_permissions (user_id, permission_name, created_by)
          values (user_id_param, perm, inviter_id)
          on conflict do nothing;
        end loop;
      end if;
    end if;

    -- Mark invitation accepted
    update public.user_invitations
      set status = 'accepted', updated_at = now()
      where invitation_token = invitation_token_param::uuid;

    return jsonb_build_object(
      'success', true,
      'role', invitation_record.role,
      'permissions_seeded', coalesce(invitation_record.permissions, to_jsonb(perms_to_seed)),
      'parent_account_id', account_owner_id
    );
end;
$function$;

-- Fix existing users with null parent_account_id
-- Set parent_account_id for users who accepted invitations but don't have it set
UPDATE public.user_profiles 
SET parent_account_id = (
  SELECT user_id FROM public.user_invitations 
  WHERE invited_email = (
    SELECT email FROM auth.users WHERE id = user_profiles.user_id
  ) 
  AND status = 'accepted' 
  LIMIT 1
),
updated_at = now()
WHERE parent_account_id IS NULL 
AND user_id IN (
  SELECT u.id FROM auth.users u
  JOIN public.user_invitations ui ON ui.invited_email = u.email
  WHERE ui.status = 'accepted'
);

-- Create a function to get user permissions including role-based permissions
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(user_id_param uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role text;
  explicit_perms text[];
  role_perms text[];
  all_perms text[];
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM user_profiles WHERE user_id = user_id_param;
  
  -- Get explicit permissions
  SELECT array_agg(permission_name) INTO explicit_perms 
  FROM user_permissions WHERE user_id = user_id_param;
  
  -- Get role-based permissions
  SELECT get_default_permissions_for_role(user_role) INTO role_perms;
  
  -- Combine and deduplicate
  all_perms := COALESCE(explicit_perms, ARRAY[]::text[]) || COALESCE(role_perms, ARRAY[]::text[]);
  
  -- Remove duplicates
  SELECT array_agg(DISTINCT unnest) INTO all_perms FROM unnest(all_perms);
  
  RETURN COALESCE(all_perms, ARRAY[]::text[]);
END;
$function$;

-- Update has_permission function to work better with organization accounts
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Check if user is admin first
  SELECT CASE 
    WHEN public.is_admin() THEN true
    WHEN auth.uid() IS NULL THEN false
    ELSE (
      permission_name = ANY(public.get_user_effective_permissions(auth.uid()))
    )
  END;
$function$;