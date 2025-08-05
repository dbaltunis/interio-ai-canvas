-- Create user_permissions table for custom permission overrides
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, permission_name)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_permissions
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions" 
ON public.user_permissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Owner', 'Admin')
  )
);

CREATE POLICY "Admins can manage all permissions" 
ON public.user_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Owner', 'Admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Owner', 'Admin')
  )
);

-- Create permissions table to store all available permissions
CREATE TABLE public.permissions (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Anyone can view permissions
CREATE POLICY "Anyone can view permissions" 
ON public.permissions 
FOR SELECT 
USING (true);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Owner', 'Admin')
  )
);

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
('view_jobs', 'Can see all jobs and quotes', 'jobs'),
('create_jobs', 'Can create new jobs and quotes', 'jobs'),
('delete_jobs', 'Can permanently delete jobs', 'jobs'),
('view_clients', 'Can see client information', 'clients'),
('create_clients', 'Can add new clients', 'clients'),
('delete_clients', 'Can permanently delete clients', 'clients'),
('view_calendar', 'Can see appointments and calendar', 'calendar'),
('create_appointments', 'Can schedule new appointments', 'calendar'),
('delete_appointments', 'Can cancel appointments', 'calendar'),
('view_inventory', 'Can see inventory items', 'inventory'),
('manage_inventory', 'Can add, edit, and remove inventory', 'inventory'),
('view_window_treatments', 'Can see treatment templates', 'treatments'),
('manage_window_treatments', 'Can create and edit treatment templates', 'treatments'),
('view_analytics', 'Can see reports and analytics', 'analytics'),
('view_settings', 'Can access settings pages', 'settings'),
('manage_settings', 'Can modify business settings', 'settings'),
('manage_users', 'Can invite and manage team members', 'admin'),
('view_profile', 'Can access own profile settings', 'profile');