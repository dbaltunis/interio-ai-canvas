-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "System owners can view all profiles" ON public.user_profiles;

-- Create a SECURITY DEFINER function to check System Owner status without recursion
CREATE OR REPLACE FUNCTION public.is_system_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
    AND role = 'System Owner'
  )
$$;

-- Recreate the policy using the function (avoids recursion)
CREATE POLICY "System owners can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_system_owner(auth.uid()));