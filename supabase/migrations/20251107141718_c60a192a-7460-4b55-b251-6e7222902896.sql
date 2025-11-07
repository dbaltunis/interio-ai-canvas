-- Fix the fix_broken_user_data function with proper type casting
CREATE OR REPLACE FUNCTION public.fix_broken_user_data(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invitation_record record;
    account_owner_id uuid;
    perms_to_seed text[];
    perm text;
    permissions_inserted int := 0;
    result jsonb;
BEGIN
    RAISE LOG 'fix_broken_user_data: Fixing user %', target_user_id;
    
    -- Find the user's invitation to get correct role and inviter
    SELECT * INTO invitation_record
    FROM public.user_invitations
    WHERE invited_email = (SELECT email FROM auth.users WHERE id = target_user_id)
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No invitation found for user');
    END IF;
    
    -- Get account owner from inviter
    SELECT public.get_account_owner(invitation_record.user_id) INTO account_owner_id;
    IF account_owner_id IS NULL THEN
        account_owner_id := invitation_record.user_id;
    END IF;
    
    RAISE LOG 'fix_broken_user_data: User % should have role % and parent %', 
              target_user_id, invitation_record.role, account_owner_id;
    
    -- Fix user_profiles
    UPDATE public.user_profiles
    SET 
        role = invitation_record.role,
        parent_account_id = account_owner_id,
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- Fix user_roles with proper type casting
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (target_user_id, invitation_record.role::app_role, NOW());
    
    -- Resync permissions
    DELETE FROM public.user_permissions WHERE user_id = target_user_id;
    
    perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
    IF perms_to_seed IS NOT NULL THEN
        FOREACH perm IN ARRAY perms_to_seed LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (target_user_id, perm, invitation_record.user_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
            permissions_inserted := permissions_inserted + 1;
        END LOOP;
    END IF;
    
    RAISE LOG 'fix_broken_user_data: Fixed user % - role: %, parent: %, permissions: %', 
              target_user_id, invitation_record.role, account_owner_id, permissions_inserted;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', target_user_id,
        'corrected_role', invitation_record.role,
        'parent_account_id', account_owner_id,
        'permissions_resynced', permissions_inserted
    );
END;
$$;

-- Now fix all broken users with proper WHERE clause
DO $$
DECLARE
    broken_user record;
    fix_result jsonb;
BEGIN
    -- Fix users who should be Admin but are showing as Owner
    FOR broken_user IN 
        SELECT up.user_id, au.email
        FROM public.user_profiles up
        JOIN auth.users au ON au.id = up.user_id
        WHERE EXISTS (
            SELECT 1 FROM public.user_invitations ui 
            WHERE ui.invited_email = au.email 
            AND ui.status = 'accepted'
            AND ui.role != up.role
        )
    LOOP
        RAISE LOG 'Fixing broken user: % (%)', broken_user.email, broken_user.user_id;
        
        SELECT public.fix_broken_user_data(broken_user.user_id) INTO fix_result;
        
        RAISE LOG 'Fix result: %', fix_result;
    END LOOP;
END $$;