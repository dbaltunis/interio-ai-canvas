-- CRITICAL FIX: Update is_admin() function to include System Owner role
-- This will allow System Owners to see all bug reports

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Admin', 'Owner', 'Manager', 'System Owner')
  );
$$;