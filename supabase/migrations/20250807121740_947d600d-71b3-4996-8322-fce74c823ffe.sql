-- Fix infinite recursion in user_permissions policies
-- First, create a security definer function to safely check permissions
CREATE OR REPLACE FUNCTION public.current_user_has_permission(permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = auth.uid() 
    AND user_permissions.permission_name = $1
  );
$$;

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage permissions with restrictions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users with permission can manage all permissions" ON public.user_permissions;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions" 
ON public.user_permissions 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can manage all permissions" 
ON public.user_permissions 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Ensure the has_permission function doesn't cause recursion
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- First check for admin role
  SELECT CASE 
    WHEN public.is_admin() THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() 
      AND user_permissions.permission_name = $1
    )
  END;
$$;