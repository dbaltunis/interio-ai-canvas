-- Enable Row Level Security on key tables that exist in the database

-- Enable RLS on clients table  
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients based on user permissions
CREATE POLICY "Users can view clients based on permissions" 
ON public.clients 
FOR SELECT 
USING (
  public.has_permission('view_all_clients') OR 
  (public.has_permission('view_own_clients') AND user_id = auth.uid())
);

CREATE POLICY "Users can insert clients based on permissions" 
ON public.clients 
FOR INSERT 
WITH CHECK (public.has_permission('create_clients'));

CREATE POLICY "Users can update clients based on permissions" 
ON public.clients 
FOR UPDATE 
USING (
  public.has_permission('edit_all_clients') OR 
  (public.has_permission('edit_own_clients') AND user_id = auth.uid())
);

CREATE POLICY "Users can delete clients based on permissions" 
ON public.clients 
FOR DELETE 
USING (public.has_permission('delete_clients'));

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view projects based on permissions" 
ON public.projects 
FOR SELECT 
USING (
  public.has_permission('view_all_projects') OR 
  (public.has_permission('view_own_projects') AND user_id = auth.uid())
);

CREATE POLICY "Users can insert projects based on permissions" 
ON public.projects 
FOR INSERT 
WITH CHECK (public.has_permission('create_projects'));

CREATE POLICY "Users can update projects based on permissions" 
ON public.projects 
FOR UPDATE 
USING (
  public.has_permission('edit_all_projects') OR 
  (public.has_permission('edit_own_projects') AND user_id = auth.uid())
);

CREATE POLICY "Users can delete projects based on permissions" 
ON public.projects 
FOR DELETE 
USING (public.has_permission('delete_projects'));

-- Update existing RLS policy on user_invitations to use permission system
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.user_invitations;

CREATE POLICY "Users with permission can manage invitations" 
ON public.user_invitations 
FOR ALL 
USING (public.has_permission('manage_users'));

-- Update existing policies on user_permissions
DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.user_permissions;

CREATE POLICY "Users with permission can manage all permissions" 
ON public.user_permissions 
FOR ALL 
USING (public.has_permission('manage_users'));

-- Apply permission-based policies to enhanced_inventory_items
DROP POLICY IF EXISTS "Users can view inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can create inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items" ON public.enhanced_inventory_items;

CREATE POLICY "Users can view inventory based on permissions" 
ON public.enhanced_inventory_items 
FOR SELECT 
USING (public.has_permission('view_inventory') OR (user_id = auth.uid()));

CREATE POLICY "Users can manage inventory based on permissions" 
ON public.enhanced_inventory_items 
FOR ALL 
USING (public.has_permission('manage_inventory') OR (user_id = auth.uid()));

-- Add permission checks for other existing tables
CREATE POLICY "Users can view quotes based on permissions" 
ON public.quotes 
FOR SELECT 
USING (
  public.has_permission('view_all_quotes') OR 
  (public.has_permission('view_own_quotes') AND user_id = auth.uid()) OR
  user_id = auth.uid()
);

CREATE POLICY "Users can manage quotes based on permissions" 
ON public.quotes 
FOR ALL 
USING (
  public.has_permission('manage_quotes') OR 
  user_id = auth.uid()
);