-- Fix the accept_user_invitation function with correct column references and better error handling
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
    permissions_inserted int := 0;
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

    -- Handle permissions seeding with proper column reference
    if invitation_record.permissions is not null and jsonb_typeof(invitation_record.permissions) = 'object' then
      -- Use explicit permissions from invitation (as object)
      for perm in select key from jsonb_each(invitation_record.permissions) where value::boolean = true
      loop
        insert into public.user_permissions (user_id, permission_name, granted_by)
        values (user_id_param, perm, inviter_id)
        on conflict do nothing;
        permissions_inserted := permissions_inserted + 1;
      end loop;
    elsif invitation_record.permissions is not null and jsonb_typeof(invitation_record.permissions) = 'array' then
      -- Use explicit permissions from invitation (as array)
      for perm in select jsonb_array_elements_text(invitation_record.permissions)
      loop
        insert into public.user_permissions (user_id, permission_name, granted_by)
        values (user_id_param, perm, inviter_id)
        on conflict do nothing;
        permissions_inserted := permissions_inserted + 1;
      end loop;
    else
      -- Seed defaults based on role when invitation had no explicit permissions
      perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
      if perms_to_seed is not null then
        foreach perm in array perms_to_seed loop
          insert into public.user_permissions (user_id, permission_name, granted_by)
          values (user_id_param, perm, inviter_id)
          on conflict do nothing;
          permissions_inserted := permissions_inserted + 1;
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
      'permissions_inserted_count', permissions_inserted,
      'parent_account_id', account_owner_id,
      'inviter_id', inviter_id
    );
end;
$function$;