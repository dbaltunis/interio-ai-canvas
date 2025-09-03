-- Update RLS policies to ensure proper account-level data sharing

-- First, let's update the clients RLS policies to ensure team members can see account owner's data
DROP POLICY IF EXISTS "Users can view account clients" ON public.clients;

CREATE POLICY "Users can view account clients" ON public.clients
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id) 
  AND (
    has_permission('view_clients'::text) OR 
    has_permission('view_all_clients'::text) OR 
    is_admin()
  )
);

-- Update the user_profiles policies to ensure team members can see each other
DROP POLICY IF EXISTS "Users can view team profiles" ON public.user_profiles;

CREATE POLICY "Users can view team profiles" ON public.user_profiles
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);

-- Ensure appointments are visible to team members  
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments;

CREATE POLICY "Users can view appointments" ON public.appointments
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id) OR
  auth.uid() = ANY (team_member_ids) OR 
  auth.uid() IN (
    SELECT appointment_shares.shared_with_user_id
    FROM appointment_shares
    WHERE appointment_shares.appointment_id = appointments.id
  ) OR 
  is_admin()
);

-- Ensure inventory is visible to team members
DROP POLICY IF EXISTS "Users can view inventory" ON public.inventory_items;

CREATE POLICY "Users can view inventory" ON public.inventory_items
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id) 
  AND (
    has_permission('view_inventory'::text) OR 
    has_permission('manage_inventory'::text) OR 
    is_admin()
  )
);

-- Ensure quotes/jobs are visible to team members  
DROP POLICY IF EXISTS "Users can view quotes" ON public.quotes;

CREATE POLICY "Users can view quotes" ON public.quotes
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id) 
  AND (
    has_permission('view_jobs'::text) OR 
    has_permission('view_all_jobs'::text) OR 
    is_admin()
  )
);

-- Ensure projects are visible to team members
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;

CREATE POLICY "Users can view projects" ON public.projects  
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id) 
  AND (
    has_permission('view_jobs'::text) OR 
    has_permission('view_all_jobs'::text) OR 
    has_permission('view_projects'::text) OR
    has_permission('view_all_projects'::text) OR
    is_admin()
  )
);

-- Update integrations to be account-level
DROP POLICY IF EXISTS "Users can view integrations" ON public.integrations;

CREATE POLICY "Users can view integrations" ON public.integrations
FOR SELECT USING (
  get_account_owner(auth.uid()) = account_owner_id OR
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);

-- Update business settings to be viewable by child users  
DROP POLICY IF EXISTS "Child users can view parent business settings" ON public.business_settings;

CREATE POLICY "Account users can view business settings" ON public.business_settings
FOR SELECT USING (
  get_account_owner(auth.uid()) = user_id
);