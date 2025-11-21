-- Fix the INSERT policy to use the correct admin function
DROP POLICY IF EXISTS "Admins can send invitations" ON public.user_invitations;

-- Create corrected INSERT policy using is_admin() without parameters
-- This checks user_profiles table which has the actual roles
CREATE POLICY "Admins can send invitations"
ON public.user_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()  -- No parameters - checks user_profiles table
);