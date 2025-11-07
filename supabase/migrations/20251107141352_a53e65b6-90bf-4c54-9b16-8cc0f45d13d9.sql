-- ====================================================================
-- CRITICAL FIX: User Invitation, Roles, and Data Inheritance
-- ====================================================================
-- This migration fixes:
-- 1. accept_user_invitation to properly insert into user_roles table
-- 2. Existing broken users (roles, parent_account_id)
-- 3. Job status inheritance for team members
-- 4. Database validation to prevent future issues
-- ====================================================================

-- ============================================================
-- PART 1: Fix accept_user_invitation function
-- ============================================================
CREATE OR REPLACE FUNCTION public.accept_user_invitation(invitation_token_param text, user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invitation_record record;
    inviter_id uuid;
    account_owner_id uuid;
    perm text;
    result jsonb;
    perms_to_seed text[];
    permissions_inserted int := 0;
    profile_created boolean := false;
BEGIN
    RAISE LOG 'accept_user_invitation: Starting acceptance for token % and user %', invitation_token_param, user_id_param;
    
    -- Fetch invitation (pending & not expired)
    SELECT * INTO invitation_record
    FROM public.user_invitations 
    WHERE invitation_token = invitation_token_param::uuid
      AND status = 'pending'
      AND expires_at > now();

    IF NOT FOUND THEN
        RAISE LOG 'accept_user_invitation: No pending invitation found for token %', invitation_token_param;
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;

    RAISE LOG 'accept_user_invitation: Found invitation for % with role %', invitation_record.invited_email, invitation_record.role;

    -- Resolve inviter id and account owner
    SELECT id INTO inviter_id FROM auth.users WHERE email = invitation_record.invited_by_email LIMIT 1;
    IF inviter_id IS NULL THEN
        inviter_id := invitation_record.user_id;
    END IF;
    
    SELECT public.get_account_owner(inviter_id) INTO account_owner_id;
    IF account_owner_id IS NULL THEN
        account_owner_id := inviter_id;
    END IF;

    RAISE LOG 'accept_user_invitation: Inviter %, Account owner %', inviter_id, account_owner_id;

    -- CRITICAL: Create or update user profile with proper parent_account_id
    INSERT INTO public.user_profiles (
        user_id,
        display_name,
        role,
        is_active,
        parent_account_id,
        created_at,
        updated_at
    ) VALUES (
        user_id_param,
        COALESCE(invitation_record.invited_name, invitation_record.invited_email),
        invitation_record.role,
        true,
        account_owner_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        parent_account_id = EXCLUDED.parent_account_id,
        display_name = COALESCE(public.user_profiles.display_name, EXCLUDED.display_name),
        updated_at = NOW();

    profile_created := true;
    RAISE LOG 'accept_user_invitation: Profile created/updated for user % with role % and parent %', 
              user_id_param, invitation_record.role, account_owner_id;

    -- CRITICAL FIX: Insert into user_roles table (this was missing!)
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at
    ) VALUES (
        user_id_param,
        invitation_record.role,
        NOW()
    )
    ON CONFLICT (user_id, role) DO UPDATE SET
        created_at = NOW();
    
    RAISE LOG 'accept_user_invitation: Role % inserted into user_roles for user %', invitation_record.role, user_id_param;

    -- Clear existing permissions first
    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
    RAISE LOG 'accept_user_invitation: Cleared existing permissions for user %', user_id_param;

    -- Seed role-based permissions
    perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
    IF perms_to_seed IS NOT NULL THEN
        FOREACH perm IN ARRAY perms_to_seed LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (user_id_param, perm, inviter_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
            permissions_inserted := permissions_inserted + 1;
        END LOOP;
        RAISE LOG 'accept_user_invitation: Seeded % permissions for user %', permissions_inserted, user_id_param;
    END IF;

    -- Mark invitation accepted
    UPDATE public.user_invitations
      SET status = 'accepted', updated_at = NOW()
      WHERE invitation_token = invitation_token_param::uuid;

    RAISE LOG 'accept_user_invitation: Invitation accepted successfully';

    RETURN jsonb_build_object(
      'success', true,
      'role', invitation_record.role,
      'permissions_inserted_count', permissions_inserted,
      'parent_account_id', account_owner_id,
      'inviter_id', inviter_id,
      'profile_created', profile_created
    );
END;
$$;

-- ============================================================
-- PART 2: Fix existing broken users
-- ============================================================

-- Function to fix a single user's data
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
    
    -- Fix user_roles
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (target_user_id, invitation_record.role, NOW());
    
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

-- Fix all users with NULL parent_account_id who have accepted invitations
DO $$
DECLARE
    broken_user record;
    fix_result jsonb;
BEGIN
    FOR broken_user IN 
        SELECT DISTINCT up.user_id, au.email
        FROM public.user_profiles up
        JOIN auth.users au ON au.id = up.user_id
        WHERE up.parent_account_id IS NULL
          AND up.role != 'Owner'
          AND EXISTS (
            SELECT 1 FROM public.user_invitations ui 
            WHERE ui.invited_email = au.email 
            AND ui.status = 'accepted'
          )
    LOOP
        RAISE LOG 'Fixing broken user: % (%)', broken_user.email, broken_user.user_id;
        
        SELECT public.fix_broken_user_data(broken_user.user_id) INTO fix_result;
        
        RAISE LOG 'Fix result: %', fix_result;
    END LOOP;
END $$;

-- ============================================================
-- PART 3: Copy job statuses to team members
-- ============================================================

CREATE OR REPLACE FUNCTION public.copy_job_statuses_to_team_member(
    team_member_id uuid,
    owner_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    status_record record;
    statuses_copied int := 0;
BEGIN
    RAISE LOG 'copy_job_statuses_to_team_member: Copying statuses from % to %', owner_id, team_member_id;
    
    -- Delete existing statuses for team member
    DELETE FROM public.job_statuses WHERE user_id = team_member_id;
    
    -- Copy all statuses from owner to team member
    FOR status_record IN 
        SELECT * FROM public.job_statuses 
        WHERE user_id = owner_id 
        AND is_active = true
        ORDER BY slot_number
    LOOP
        INSERT INTO public.job_statuses (
            user_id,
            name,
            color,
            action,
            slot_number,
            is_active,
            created_at
        ) VALUES (
            team_member_id,
            status_record.name,
            status_record.color,
            status_record.action,
            status_record.slot_number,
            true,
            NOW()
        );
        
        statuses_copied := statuses_copied + 1;
    END LOOP;
    
    RAISE LOG 'copy_job_statuses_to_team_member: Copied % statuses', statuses_copied;
    
    RETURN jsonb_build_object(
        'success', true,
        'team_member_id', team_member_id,
        'owner_id', owner_id,
        'statuses_copied', statuses_copied
    );
END;
$$;

-- Copy job statuses to all team members who don't have proper hierarchy
DO $$
DECLARE
    team_member record;
    copy_result jsonb;
BEGIN
    FOR team_member IN 
        SELECT up.user_id, up.parent_account_id
        FROM public.user_profiles up
        WHERE up.parent_account_id IS NOT NULL
          AND up.user_id != up.parent_account_id
          AND EXISTS (
            SELECT 1 FROM public.job_statuses js
            WHERE js.user_id = up.user_id
            AND js.slot_number IS NULL
          )
    LOOP
        RAISE LOG 'Copying job statuses to team member: %', team_member.user_id;
        
        SELECT public.copy_job_statuses_to_team_member(
            team_member.user_id, 
            team_member.parent_account_id
        ) INTO copy_result;
        
        RAISE LOG 'Copy result: %', copy_result;
    END LOOP;
END $$;

-- ============================================================
-- PART 4: Add database validation
-- ============================================================

-- Function to validate parent_account_id is never NULL for non-owners
CREATE OR REPLACE FUNCTION public.validate_parent_account_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only validate for non-Owner users
    IF NEW.role != 'Owner' AND NEW.parent_account_id IS NULL THEN
        RAISE EXCEPTION 'parent_account_id cannot be NULL for non-Owner users (role: %)', NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to validate parent_account_id on insert/update
DROP TRIGGER IF EXISTS validate_parent_account_id_trigger ON public.user_profiles;
CREATE TRIGGER validate_parent_account_id_trigger
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_parent_account_id();

-- ============================================================
-- PART 5: Audit and verification functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_user_data()
RETURNS TABLE (
    user_id uuid,
    email text,
    profile_role text,
    has_user_role boolean,
    parent_account_id uuid,
    permission_count bigint,
    status_count bigint,
    has_slot_numbers boolean,
    issues text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        au.email,
        up.role,
        EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.user_id) as has_user_role,
        up.parent_account_id,
        (SELECT COUNT(*) FROM public.user_permissions WHERE user_id = up.user_id) as permission_count,
        (SELECT COUNT(*) FROM public.job_statuses WHERE user_id = up.user_id AND is_active = true) as status_count,
        NOT EXISTS(SELECT 1 FROM public.job_statuses WHERE user_id = up.user_id AND slot_number IS NULL) as has_slot_numbers,
        ARRAY_REMOVE(ARRAY[
            CASE WHEN up.role != 'Owner' AND up.parent_account_id IS NULL THEN 'NULL parent_account_id' END,
            CASE WHEN NOT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.user_id) THEN 'Missing user_roles entry' END,
            CASE WHEN EXISTS(SELECT 1 FROM public.job_statuses WHERE user_id = up.user_id AND slot_number IS NULL) THEN 'Job statuses missing slot_number' END,
            CASE WHEN (SELECT COUNT(*) FROM public.user_permissions WHERE user_id = up.user_id) = 0 THEN 'No permissions' END
        ], NULL) as issues
    FROM public.user_profiles up
    JOIN auth.users au ON au.id = up.user_id
    ORDER BY up.created_at DESC;
END;
$$;