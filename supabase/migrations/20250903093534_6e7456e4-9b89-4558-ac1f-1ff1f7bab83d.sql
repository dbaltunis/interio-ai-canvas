-- Update RLS policies to ensure proper account-level data sharing (excluding non-existent tables)

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

-- Ensure quotes/jobs are visible to team members (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes' AND table_schema = 'public') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view quotes" ON public.quotes';
        EXECUTE 'CREATE POLICY "Users can view quotes" ON public.quotes
                FOR SELECT USING (
                  get_account_owner(auth.uid()) = get_account_owner(user_id) 
                  AND (
                    has_permission(''view_jobs''::text) OR 
                    has_permission(''view_all_jobs''::text) OR 
                    is_admin()
                  )
                )';
    END IF;
END $$;

-- Ensure projects are visible to team members (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view projects" ON public.projects';
        EXECUTE 'CREATE POLICY "Users can view projects" ON public.projects  
                FOR SELECT USING (
                  get_account_owner(auth.uid()) = get_account_owner(user_id) 
                  AND (
                    has_permission(''view_jobs''::text) OR 
                    has_permission(''view_all_jobs''::text) OR 
                    has_permission(''view_projects''::text) OR
                    has_permission(''view_all_projects''::text) OR
                    is_admin()
                  )
                )';
    END IF;
END $$;

-- Update integrations to be account-level
DROP POLICY IF EXISTS "Users can view integrations" ON public.integrations;

CREATE POLICY "Users can view integrations" ON public.integrations
FOR SELECT USING (
  get_account_owner(auth.uid()) = account_owner_id OR
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);

-- Update business settings to be viewable by child users  
DROP POLICY IF EXISTS "Account users can view business settings" ON public.business_settings;

CREATE POLICY "Account users can view business settings" ON public.business_settings
FOR SELECT USING (
  get_account_owner(auth.uid()) = user_id
);