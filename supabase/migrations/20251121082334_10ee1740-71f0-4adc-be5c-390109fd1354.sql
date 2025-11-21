-- Disable RLS temporarily to drop all policies
ALTER TABLE public.user_invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (query showed 10 policies total)
DROP POLICY IF EXISTS "Admins can send invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can accept their invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can delete their invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can delete their own invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their account" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their email" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can view sent invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Users with permission can manage invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "read user_invitations" ON public.user_invitations;

-- Re-enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Ensure security definer functions exist and have proper grants
GRANT EXECUTE ON FUNCTION public.user_owns_email(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.user_invitations TO authenticated;

-- Create 4 clean, non-conflicting policies

-- 1. INSERT: Only admins/owners can create invitations
CREATE POLICY "Admins can send invitations"
ON public.user_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

-- 2. SELECT: Users can view invitations they created (or their team created)
CREATE POLICY "Users can view sent invitations"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR user_id IN (
    SELECT user_id 
    FROM public.user_profiles 
    WHERE parent_account_id = (
      SELECT COALESCE(parent_account_id, user_id) 
      FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- 3. SELECT: Users can view invitations sent to their email
CREATE POLICY "Users can view invitations for their email"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  public.user_owns_email(auth.uid(), invited_email)
);

-- 4. UPDATE: Users can accept/reject invitations sent to their email
CREATE POLICY "Users can accept their invitations"
ON public.user_invitations
FOR UPDATE
TO authenticated
USING (
  public.user_owns_email(auth.uid(), invited_email)
  AND status = 'pending'
)
WITH CHECK (
  public.user_owns_email(auth.uid(), invited_email)
  AND status IN ('accepted', 'rejected')
);