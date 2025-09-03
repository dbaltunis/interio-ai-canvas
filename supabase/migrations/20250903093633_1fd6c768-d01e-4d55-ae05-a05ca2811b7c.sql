-- Update RLS policies for existing tables only

-- Update clients RLS policy
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

-- Update user_profiles policy  
DROP POLICY IF EXISTS "Users can view team profiles" ON public.user_profiles;

CREATE POLICY "Users can view team profiles" ON public.user_profiles
FOR SELECT USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);

-- Update appointments policy
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

-- Update quotes policy
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

-- Update projects policy
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

-- Update business settings policy
DROP POLICY IF EXISTS "Account users can view business settings" ON public.business_settings;

CREATE POLICY "Account users can view business settings" ON public.business_settings
FOR SELECT USING (
  get_account_owner(auth.uid()) = user_id
);