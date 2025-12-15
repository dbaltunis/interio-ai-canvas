-- =====================================================
-- FIX 1: Update user_roles unique constraint
-- Change from UNIQUE(user_id) to UNIQUE(user_id, role)
-- This fixes: "no unique or exclusion constraint matching the ON CONFLICT specification"
-- =====================================================

-- Drop the old constraint (only allows one role per user)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;

-- Add correct constraint matching ON CONFLICT (user_id, role) in trigger
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- =====================================================
-- FIX 2: Add DELETE policy for user_invitations
-- This allows users to cancel/delete invitations they created
-- =====================================================

-- Drop any existing delete policy first
DROP POLICY IF EXISTS "Users can delete their own invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "account_delete" ON public.user_invitations;

-- Create DELETE policy
CREATE POLICY "Users can delete their own invitations"
ON public.user_invitations
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_same_account(user_id)
);

-- =====================================================
-- FIX 3: Consolidate redundant SELECT policies
-- Remove duplicates to prevent permissive stacking issues
-- =====================================================

-- Drop redundant policies
DROP POLICY IF EXISTS "Users can view sent invitations" ON public.user_invitations;

-- Keep clean policies:
-- 1. "account_select" - for account members viewing their invitations
-- 2. "Users can view invitations for their email" - for invited users to see their pending invites