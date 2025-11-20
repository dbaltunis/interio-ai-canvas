-- Fix bug_reports RLS to allow System Owners and Admins to see ALL bugs
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins and owners can view all bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;

-- Create a security definer function to check if user is admin/owner
CREATE OR REPLACE FUNCTION public.is_bug_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_role IN ('System Owner', 'Owner', 'Admin', 'Manager');
END;
$$;

-- Create new comprehensive policy for viewing bug reports
-- Admins/Owners see ALL bugs, regular users see only their own
CREATE POLICY "Bug reports access policy" 
ON public.bug_reports 
FOR SELECT 
TO authenticated
USING (
  is_bug_admin() = true OR auth.uid() = user_id
);

-- Keep existing policies for INSERT and UPDATE
-- (They should still work correctly)