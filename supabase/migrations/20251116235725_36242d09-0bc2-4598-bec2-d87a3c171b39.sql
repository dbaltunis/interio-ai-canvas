-- CRITICAL SECURITY FIX: Comprehensive RLS Policy Overhaul v2
-- This migration fixes data isolation between accounts

-- Step 1: Create secure helper function
CREATE OR REPLACE FUNCTION public.get_effective_account_owner(user_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT COALESCE(parent_account_id, user_id_param)
    INTO owner_id
    FROM user_profiles
    WHERE user_id = user_id_param;
    
    RETURN owner_id;
END;
$$;

-- Step 2: Drop existing policies on critical tables
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('clients', 'projects', 'quotes', 'appointments', 
                         'inventory_items', 'vendors', 'collections', 'curtain_templates',
                         'rooms', 'window_coverings', 'business_settings', 'email_settings',
                         'integration_settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Step 3: Apply RLS policies to tables with user_id column
-- CLIENTS
CREATE POLICY "Account isolation - SELECT" ON public.clients FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.clients FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.clients FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.clients FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- PROJECTS  
CREATE POLICY "Account isolation - SELECT" ON public.projects FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.projects FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.projects FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.projects FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- QUOTES
CREATE POLICY "Account isolation - SELECT" ON public.quotes FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.quotes FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.quotes FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.quotes FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- APPOINTMENTS
CREATE POLICY "Account isolation - SELECT" ON public.appointments FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.appointments FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.appointments FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.appointments FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- VENDORS
CREATE POLICY "Account isolation - SELECT" ON public.vendors FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.vendors FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.vendors FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.vendors FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- COLLECTIONS
CREATE POLICY "Account isolation - SELECT" ON public.collections FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.collections FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.collections FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.collections FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- CURTAIN_TEMPLATES
CREATE POLICY "Account isolation - SELECT" ON public.curtain_templates FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.curtain_templates FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.curtain_templates FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.curtain_templates FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- ROOMS
CREATE POLICY "Account isolation - SELECT" ON public.rooms FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.rooms FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.rooms FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.rooms FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- WINDOW_COVERINGS
CREATE POLICY "Account isolation - SELECT" ON public.window_coverings FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.window_coverings FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.window_coverings FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.window_coverings FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- BUSINESS_SETTINGS
CREATE POLICY "Account isolation - SELECT" ON public.business_settings FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT" ON public.business_settings FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE" ON public.business_settings FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE" ON public.business_settings FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

-- EMAIL_SETTINGS (uses account_owner_id)
CREATE POLICY "Account isolation - SELECT" ON public.email_settings FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

CREATE POLICY "Account isolation - INSERT" ON public.email_settings FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

CREATE POLICY "Account isolation - UPDATE" ON public.email_settings FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

CREATE POLICY "Account isolation - DELETE" ON public.email_settings FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

-- INTEGRATION_SETTINGS (uses account_owner_id)
CREATE POLICY "Account isolation - SELECT" ON public.integration_settings FOR SELECT
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

CREATE POLICY "Account isolation - INSERT" ON public.integration_settings FOR INSERT
TO public WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

CREATE POLICY "Account isolation - UPDATE" ON public.integration_settings FOR UPDATE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

CREATE POLICY "Account isolation - DELETE" ON public.integration_settings FOR DELETE
TO public USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(account_owner_id));

-- INVENTORY_ITEMS (uses org_id, different pattern)
CREATE POLICY "Account isolation - SELECT" ON public.inventory_items FOR SELECT
TO public USING ((org_id)::text = (auth.jwt() ->> 'org_id'::text));

CREATE POLICY "Account isolation - INSERT" ON public.inventory_items FOR INSERT
TO public WITH CHECK ((org_id)::text = (auth.jwt() ->> 'org_id'::text));

CREATE POLICY "Account isolation - UPDATE" ON public.inventory_items FOR UPDATE
TO public USING ((org_id)::text = (auth.jwt() ->> 'org_id'::text));

CREATE POLICY "Account isolation - DELETE" ON public.inventory_items FOR DELETE
TO public USING ((org_id)::text = (auth.jwt() ->> 'org_id'::text));

COMMENT ON FUNCTION public.get_effective_account_owner IS 'Returns the account owner ID for a user, ensuring proper data isolation between accounts.';
