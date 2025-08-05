-- Create function to check if current user is admin/manager
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Admin', 'Owner', 'Manager')
  );
$$;

-- Update clients RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;

CREATE POLICY "Users can create clients" ON public.clients
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view clients" ON public.clients
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update clients" ON public.clients
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete clients" ON public.clients
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Update projects RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

CREATE POLICY "Users can create projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view projects" ON public.projects
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update projects" ON public.projects
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete projects" ON public.projects
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Update quotes RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can create their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;

CREATE POLICY "Users can create quotes" ON public.quotes
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view quotes" ON public.quotes
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update quotes" ON public.quotes
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete quotes" ON public.quotes
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Update enhanced_inventory_items RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can create their own enhanced inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete their own enhanced inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update their own enhanced inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can view their own enhanced inventory items" ON public.enhanced_inventory_items;

CREATE POLICY "Users can create inventory items" ON public.enhanced_inventory_items
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view inventory items" ON public.enhanced_inventory_items
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update inventory items" ON public.enhanced_inventory_items
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete inventory items" ON public.enhanced_inventory_items
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Update email_settings RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can create their own email settings" ON public.email_settings;
DROP POLICY IF EXISTS "Users can update their own email settings" ON public.email_settings;
DROP POLICY IF EXISTS "Users can view their own email settings" ON public.email_settings;

CREATE POLICY "Users can create email settings" ON public.email_settings
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view email settings" ON public.email_settings
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update email settings" ON public.email_settings
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Update the current user to be Admin
UPDATE public.user_profiles 
SET role = 'Admin' 
WHERE user_id = '5b090e31-e15e-4e10-8fca-79456bf4c165';