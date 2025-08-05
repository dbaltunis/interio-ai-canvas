
-- Create permissions and roles system
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user permissions junction table
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL REFERENCES public.permissions(name) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, permission_name)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for permissions
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);

-- RLS policies for user_permissions  
CREATE POLICY "Users can view their permissions" ON public.user_permissions 
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage permissions" ON public.user_permissions 
FOR ALL USING (public.is_admin());

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
('view_jobs', 'Can view jobs and quotes', 'jobs'),
('create_jobs', 'Can create and edit jobs', 'jobs'),
('delete_jobs', 'Can delete jobs', 'jobs'),
('view_clients', 'Can view client information', 'crm'),
('create_clients', 'Can create and edit clients', 'crm'),
('delete_clients', 'Can delete clients', 'crm'),
('view_calendar', 'Can view calendar and appointments', 'calendar'),
('create_appointments', 'Can create and edit appointments', 'calendar'),
('delete_appointments', 'Can delete appointments', 'calendar'),
('view_inventory', 'Can view inventory items', 'inventory'),
('manage_inventory', 'Can create, edit, and delete inventory', 'inventory'),
('view_window_treatments', 'Can view window treatment templates', 'treatments'),
('manage_window_treatments', 'Can create and edit window treatment templates', 'treatments'),
('view_settings', 'Can view business settings', 'settings'),
('manage_settings', 'Can edit business settings', 'settings'),
('manage_users', 'Can invite and manage team members', 'admin'),
('view_analytics', 'Can view reports and analytics', 'analytics')
ON CONFLICT (name) DO NOTHING;

-- Create helper function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = $1
  ) OR public.is_admin();
$$;

-- Grant default permissions to existing admin users
INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
SELECT 
  up.user_id,
  p.name,
  up.user_id
FROM public.user_profiles up
CROSS JOIN public.permissions p
WHERE up.role IN ('Admin', 'Owner', 'Manager')
ON CONFLICT (user_id, permission_name) DO NOTHING;
