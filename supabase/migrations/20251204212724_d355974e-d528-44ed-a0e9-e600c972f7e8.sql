-- =====================================================
-- PHASE 1: Create missing get_user_account_id function
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_account_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_effective_account_owner(auth.uid());
$$;

-- =====================================================
-- PHASE 2: Fix is_admin() to ONLY return TRUE for System Owners
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  );
$$;

-- =====================================================
-- PHASE 3: Create account-scoped helper function
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_same_account(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(target_user_id),
    FALSE
  );
$$;

-- =====================================================
-- PHASE 4: Update RLS policies for core tables
-- =====================================================

-- client_measurements policies
DROP POLICY IF EXISTS "Users can view their own measurements" ON public.client_measurements;
DROP POLICY IF EXISTS "Users can create their own measurements" ON public.client_measurements;
DROP POLICY IF EXISTS "Users can update their own measurements" ON public.client_measurements;
DROP POLICY IF EXISTS "Users can delete their own measurements" ON public.client_measurements;

CREATE POLICY "Users can view measurements in their account"
ON public.client_measurements FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create measurements"
ON public.client_measurements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update measurements in their account"
ON public.client_measurements FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete measurements in their account"
ON public.client_measurements FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- email_campaigns policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.email_campaigns;

CREATE POLICY "Users can view campaigns in their account"
ON public.email_campaigns FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create campaigns"
ON public.email_campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update campaigns in their account"
ON public.email_campaigns FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete campaigns in their account"
ON public.email_campaigns FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- email_templates policies
DROP POLICY IF EXISTS "Users can view their own email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can create email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete their own email templates" ON public.email_templates;

CREATE POLICY "Users can view email templates in their account"
ON public.email_templates FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create email templates"
ON public.email_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update email templates in their account"
ON public.email_templates FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete email templates in their account"
ON public.email_templates FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view projects in their account"
ON public.projects FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update projects in their account"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete projects in their account"
ON public.projects FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- quotes policies
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can create quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete their own quotes" ON public.quotes;

CREATE POLICY "Users can view quotes in their account"
ON public.quotes FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create quotes"
ON public.quotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update quotes in their account"
ON public.quotes FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete quotes in their account"
ON public.quotes FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- clients policies
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view clients in their account"
ON public.clients FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update clients in their account"
ON public.clients FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete clients in their account"
ON public.clients FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- enhanced_inventory_items policies
DROP POLICY IF EXISTS "Users can view their own inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can create inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON public.enhanced_inventory_items;

CREATE POLICY "Users can view inventory in their account"
ON public.enhanced_inventory_items FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can create inventory items"
ON public.enhanced_inventory_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update inventory in their account"
ON public.enhanced_inventory_items FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Users can delete inventory in their account"
ON public.enhanced_inventory_items FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- treatment_options policies (uses account_id)
DROP POLICY IF EXISTS "Users can view treatment options" ON public.treatment_options;
DROP POLICY IF EXISTS "Users can create treatment options" ON public.treatment_options;
DROP POLICY IF EXISTS "Users can update treatment options" ON public.treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment options" ON public.treatment_options;
DROP POLICY IF EXISTS "Users can view treatment options in their account" ON public.treatment_options;
DROP POLICY IF EXISTS "Users can update treatment options in their account" ON public.treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment options in their account" ON public.treatment_options;

CREATE POLICY "Account members can view treatment options"
ON public.treatment_options FOR SELECT
USING (account_id = public.get_user_account_id() OR public.is_admin());

CREATE POLICY "Account members can create treatment options"
ON public.treatment_options FOR INSERT
WITH CHECK (account_id = public.get_user_account_id());

CREATE POLICY "Account members can update treatment options"
ON public.treatment_options FOR UPDATE
USING (account_id = public.get_user_account_id() OR public.is_admin());

CREATE POLICY "Account members can delete treatment options"
ON public.treatment_options FOR DELETE
USING (account_id = public.get_user_account_id() OR public.is_admin());

-- option_values policies (uses account_id)
DROP POLICY IF EXISTS "Users can view option values" ON public.option_values;
DROP POLICY IF EXISTS "Users can create option values" ON public.option_values;
DROP POLICY IF EXISTS "Users can update option values" ON public.option_values;
DROP POLICY IF EXISTS "Users can delete option values" ON public.option_values;
DROP POLICY IF EXISTS "Users can view option values in their account" ON public.option_values;
DROP POLICY IF EXISTS "Users can update option values in their account" ON public.option_values;
DROP POLICY IF EXISTS "Users can delete option values in their account" ON public.option_values;

CREATE POLICY "Account members can view option values"
ON public.option_values FOR SELECT
USING (account_id = public.get_user_account_id() OR public.is_admin());

CREATE POLICY "Account members can create option values"
ON public.option_values FOR INSERT
WITH CHECK (account_id = public.get_user_account_id());

CREATE POLICY "Account members can update option values"
ON public.option_values FOR UPDATE
USING (account_id = public.get_user_account_id() OR public.is_admin());

CREATE POLICY "Account members can delete option values"
ON public.option_values FOR DELETE
USING (account_id = public.get_user_account_id() OR public.is_admin());

-- business_settings policies
DROP POLICY IF EXISTS "Users can view their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can create business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can update their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can view business settings in their account" ON public.business_settings;
DROP POLICY IF EXISTS "Users can update business settings in their account" ON public.business_settings;

CREATE POLICY "Account members can view business settings"
ON public.business_settings FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can create business settings"
ON public.business_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account members can update business settings"
ON public.business_settings FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- vendors policies
DROP POLICY IF EXISTS "Users can view their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can create vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can view vendors in their account" ON public.vendors;
DROP POLICY IF EXISTS "Users can update vendors in their account" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete vendors in their account" ON public.vendors;

CREATE POLICY "Account members can view vendors"
ON public.vendors FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can create vendors"
ON public.vendors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account members can update vendors"
ON public.vendors FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can delete vendors"
ON public.vendors FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

-- appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view appointments in their account" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments in their account" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments in their account" ON public.appointments;

CREATE POLICY "Account members can view appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account members can update appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());

CREATE POLICY "Account members can delete appointments"
ON public.appointments FOR DELETE
USING (auth.uid() = user_id OR public.is_same_account(user_id) OR public.is_admin());