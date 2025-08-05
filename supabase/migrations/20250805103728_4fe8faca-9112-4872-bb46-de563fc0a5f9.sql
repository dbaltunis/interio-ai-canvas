-- Update all remaining tables to allow admin access

-- Business Settings
DROP POLICY IF EXISTS "Users can create their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can delete their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can update their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can view their own business settings" ON public.business_settings;

CREATE POLICY "Users can create business settings" ON public.business_settings
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view business settings" ON public.business_settings
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update business settings" ON public.business_settings
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete business settings" ON public.business_settings
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Vendors
DROP POLICY IF EXISTS "Users can create their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can view their own vendors" ON public.vendors;

CREATE POLICY "Users can create vendors" ON public.vendors
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view vendors" ON public.vendors
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update vendors" ON public.vendors
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete vendors" ON public.vendors
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Email Templates
DROP POLICY IF EXISTS "Users can create their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;

CREATE POLICY "Users can create templates" ON public.email_templates
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view templates" ON public.email_templates
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update templates" ON public.email_templates
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete templates" ON public.email_templates
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Curtain Templates
DROP POLICY IF EXISTS "Users can create their own curtain templates" ON public.curtain_templates;
DROP POLICY IF EXISTS "Users can delete their own curtain templates" ON public.curtain_templates;
DROP POLICY IF EXISTS "Users can update their own curtain templates" ON public.curtain_templates;
DROP POLICY IF EXISTS "Users can view their own curtain templates" ON public.curtain_templates;

CREATE POLICY "Users can create curtain templates" ON public.curtain_templates
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view curtain templates" ON public.curtain_templates
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update curtain templates" ON public.curtain_templates
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete curtain templates" ON public.curtain_templates
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Appointments
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;

CREATE POLICY "Users can create appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view appointments" ON public.appointments
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update appointments" ON public.appointments
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete appointments" ON public.appointments
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Client Measurements
DROP POLICY IF EXISTS "Users can create their own client measurements" ON public.client_measurements;
DROP POLICY IF EXISTS "Users can delete their own client measurements" ON public.client_measurements;
DROP POLICY IF EXISTS "Users can update their own client measurements" ON public.client_measurements;
DROP POLICY IF EXISTS "Users can view their own client measurements" ON public.client_measurements;

CREATE POLICY "Users can create client measurements" ON public.client_measurements
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view client measurements" ON public.client_measurements
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update client measurements" ON public.client_measurements
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete client measurements" ON public.client_measurements
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Inventory Categories
DROP POLICY IF EXISTS "Users can create their own categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON public.inventory_categories;

CREATE POLICY "Users can create categories" ON public.inventory_categories
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view categories" ON public.inventory_categories
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update categories" ON public.inventory_categories
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete categories" ON public.inventory_categories
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Hardware Assemblies
DROP POLICY IF EXISTS "Users can create their own assemblies" ON public.hardware_assemblies;
DROP POLICY IF EXISTS "Users can delete their own assemblies" ON public.hardware_assemblies;
DROP POLICY IF EXISTS "Users can update their own assemblies" ON public.hardware_assemblies;
DROP POLICY IF EXISTS "Users can view their own assemblies" ON public.hardware_assemblies;

CREATE POLICY "Users can create assemblies" ON public.hardware_assemblies
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view assemblies" ON public.hardware_assemblies
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update assemblies" ON public.hardware_assemblies
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete assemblies" ON public.hardware_assemblies
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Quote Templates
DROP POLICY IF EXISTS "Users can create their own quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can delete their own quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can update their own quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can view their own quote templates" ON public.quote_templates;

CREATE POLICY "Users can create quote templates" ON public.quote_templates
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view quote templates" ON public.quote_templates
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update quote templates" ON public.quote_templates
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete quote templates" ON public.quote_templates
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());