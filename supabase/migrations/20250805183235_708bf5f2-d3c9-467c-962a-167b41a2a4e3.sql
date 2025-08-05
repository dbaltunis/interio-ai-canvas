-- Enable Row Level Security on key tables to enforce permissions at database level

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

-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments/calendar
CREATE POLICY "Users can view appointments based on permissions" 
ON public.appointments 
FOR SELECT 
USING (
  public.has_permission('view_calendar') OR 
  (public.has_permission('view_own_appointments') AND user_id = auth.uid())
);

CREATE POLICY "Users can insert appointments based on permissions" 
ON public.appointments 
FOR INSERT 
WITH CHECK (public.has_permission('create_appointments'));

CREATE POLICY "Users can update appointments based on permissions" 
ON public.appointments 
FOR UPDATE 
USING (
  public.has_permission('manage_calendar') OR 
  (public.has_permission('edit_own_appointments') AND user_id = auth.uid())
);

CREATE POLICY "Users can delete appointments based on permissions" 
ON public.appointments 
FOR DELETE 
USING (public.has_permission('delete_appointments'));

-- Enable RLS on inventory tables
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory based on permissions" 
ON public.inventory_items 
FOR SELECT 
USING (public.has_permission('view_inventory'));

CREATE POLICY "Users can manage inventory based on permissions" 
ON public.inventory_items 
FOR ALL 
USING (public.has_permission('manage_inventory'));

-- Enable RLS on fabric_inventory table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fabric_inventory') THEN
    EXECUTE 'ALTER TABLE public.fabric_inventory ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Users can view fabric inventory based on permissions" 
    ON public.fabric_inventory 
    FOR SELECT 
    USING (public.has_permission(''view_inventory''))';
    
    EXECUTE 'CREATE POLICY "Users can manage fabric inventory based on permissions" 
    ON public.fabric_inventory 
    FOR ALL 
    USING (public.has_permission(''manage_inventory''))';
  END IF;
END $$;

-- Enable RLS on hardware_inventory table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hardware_inventory') THEN
    EXECUTE 'ALTER TABLE public.hardware_inventory ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Users can view hardware inventory based on permissions" 
    ON public.hardware_inventory 
    FOR SELECT 
    USING (public.has_permission(''view_inventory''))';
    
    EXECUTE 'CREATE POLICY "Users can manage hardware inventory based on permissions" 
    ON public.hardware_inventory 
    FOR ALL 
    USING (public.has_permission(''manage_inventory''))';
  END IF;
END $$;

-- Enable RLS on user_profiles to protect user data
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.has_permission('manage_users'));

CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (public.has_permission('manage_users'));

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations" 
ON public.user_invitations 
FOR ALL 
USING (public.has_permission('manage_users'));

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all permissions" 
ON public.user_permissions 
FOR ALL 
USING (public.has_permission('manage_users'));