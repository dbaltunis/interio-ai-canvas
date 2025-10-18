-- Fix link_user_to_account to prevent self-referential parent_account_id
-- and ensure accept_user_invitation properly assigns roles

-- Drop and recreate link_user_to_account function
DROP FUNCTION IF EXISTS link_user_to_account(uuid, uuid);

CREATE OR REPLACE FUNCTION link_user_to_account(
  child_user_id uuid,
  parent_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_existing_parent uuid;
BEGIN
  -- Get existing parent_account_id
  SELECT parent_account_id INTO v_existing_parent
  FROM user_profiles
  WHERE user_id = child_user_id;

  -- If user already has a parent, don't change it
  IF v_existing_parent IS NOT NULL THEN
    RAISE NOTICE 'User % already has parent_account_id: %', child_user_id, v_existing_parent;
    RETURN jsonb_build_object('success', true, 'parent_account_id', v_existing_parent, 'action', 'no_change');
  END IF;

  -- Determine the parent ID to use
  IF parent_user_id IS NOT NULL THEN
    -- CRITICAL: Prevent self-referencing
    IF parent_user_id = child_user_id THEN
      RAISE EXCEPTION 'Cannot set parent_account_id to self (user_id = %)', child_user_id;
    END IF;
    v_parent_id := parent_user_id;
  ELSE
    -- If no parent provided, this user is the owner (parent_account_id should be NULL)
    v_parent_id := NULL;
  END IF;

  -- Update the user profile with the parent account ID
  UPDATE user_profiles
  SET parent_account_id = v_parent_id,
      updated_at = now()
  WHERE user_id = child_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'parent_account_id', v_parent_id,
    'action', 'updated'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error linking user to account: %', SQLERRM;
END;
$$;

-- Drop and recreate accept_user_invitation to properly handle role assignment
DROP FUNCTION IF EXISTS accept_user_invitation(text, uuid);

CREATE OR REPLACE FUNCTION accept_user_invitation(
  invitation_token_param text,
  accepting_user_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
  v_owner_id uuid;
  v_role text;
BEGIN
  -- Get the invitation details
  SELECT * INTO v_invitation
  FROM user_invitations
  WHERE invitation_token = invitation_token_param
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Get the owner ID (parent account) from the inviter
  SELECT COALESCE(parent_account_id, user_id) INTO v_owner_id
  FROM user_profiles
  WHERE user_id = v_invitation.invited_by;

  IF v_owner_id IS NULL THEN
    -- Fallback: inviter is the owner
    v_owner_id := v_invitation.invited_by;
  END IF;

  -- CRITICAL: Ensure we don't set self-referential parent_account_id
  IF v_owner_id = accepting_user_id_param THEN
    RAISE EXCEPTION 'Cannot set parent_account_id to self (owner_id = accepting_user_id = %)', accepting_user_id_param;
  END IF;

  -- Get the role from the invitation
  v_role := v_invitation.role;
  
  -- Ensure role is not NULL, default to 'Staff' if missing
  IF v_role IS NULL OR v_role = '' THEN
    v_role := 'Staff';
  END IF;

  RAISE NOTICE 'Setting user % to role % with parent %', accepting_user_id_param, v_role, v_owner_id;

  -- Update user profile with role and parent account
  UPDATE user_profiles
  SET 
    role = v_role,
    parent_account_id = v_owner_id,
    updated_at = now()
  WHERE user_id = accepting_user_id_param;

  -- Seed role-based permissions
  PERFORM fix_user_permissions_for_role(accepting_user_id_param);

  -- Mark invitation as accepted
  UPDATE user_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = accepting_user_id_param,
    updated_at = now()
  WHERE invitation_token = invitation_token_param;

  RETURN jsonb_build_object(
    'success', true,
    'role', v_role,
    'parent_account_id', v_owner_id,
    'user_id', accepting_user_id_param
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error accepting invitation: %', SQLERRM;
END;
$$;