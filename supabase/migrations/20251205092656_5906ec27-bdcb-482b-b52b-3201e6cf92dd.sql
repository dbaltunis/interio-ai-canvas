-- COMPREHENSIVE RLS RESET: Fix all broken policies with is_admin() bypasses

-- ============================================
-- PHASE 1: DROP ALL BROKEN POLICIES
-- ============================================

-- clients
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can view clients in their account" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their account" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients in their account" ON clients;
DROP POLICY IF EXISTS "account_select" ON clients;
DROP POLICY IF EXISTS "account_insert" ON clients;
DROP POLICY IF EXISTS "account_update" ON clients;
DROP POLICY IF EXISTS "account_delete" ON clients;

-- quotes
DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view quotes in their account" ON quotes;
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update quotes in their account" ON quotes;
DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete quotes in their account" ON quotes;
DROP POLICY IF EXISTS "account_select" ON quotes;
DROP POLICY IF EXISTS "account_insert" ON quotes;
DROP POLICY IF EXISTS "account_update" ON quotes;
DROP POLICY IF EXISTS "account_delete" ON quotes;

-- projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects in their account" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their account" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their account" ON projects;
DROP POLICY IF EXISTS "account_select" ON projects;
DROP POLICY IF EXISTS "account_insert" ON projects;
DROP POLICY IF EXISTS "account_update" ON projects;
DROP POLICY IF EXISTS "account_delete" ON projects;

-- enhanced_inventory_items
DROP POLICY IF EXISTS "Users can view own inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can view inventory in their account" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can create inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can update inventory in their account" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory in their account" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "account_select" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "account_insert" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "account_update" ON enhanced_inventory_items;
DROP POLICY IF EXISTS "account_delete" ON enhanced_inventory_items;

-- appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view appointments in their account" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments in their account" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments in their account" ON appointments;
DROP POLICY IF EXISTS "account_select" ON appointments;
DROP POLICY IF EXISTS "account_insert" ON appointments;
DROP POLICY IF EXISTS "account_update" ON appointments;
DROP POLICY IF EXISTS "account_delete" ON appointments;

-- business_settings
DROP POLICY IF EXISTS "Users can view own settings" ON business_settings;
DROP POLICY IF EXISTS "Users can view settings in their account" ON business_settings;
DROP POLICY IF EXISTS "Users can create settings" ON business_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON business_settings;
DROP POLICY IF EXISTS "Users can update settings in their account" ON business_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON business_settings;
DROP POLICY IF EXISTS "Users can delete settings in their account" ON business_settings;
DROP POLICY IF EXISTS "account_select" ON business_settings;
DROP POLICY IF EXISTS "account_insert" ON business_settings;
DROP POLICY IF EXISTS "account_update" ON business_settings;
DROP POLICY IF EXISTS "account_delete" ON business_settings;

-- ============================================
-- PHASE 2: CREATE NEW CONSISTENT POLICIES
-- ============================================

-- clients
CREATE POLICY "account_select" ON clients FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON clients FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON clients FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- quotes
CREATE POLICY "account_select" ON quotes FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON quotes FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON quotes FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- projects
CREATE POLICY "account_select" ON projects FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON projects FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON projects FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- enhanced_inventory_items
CREATE POLICY "account_select" ON enhanced_inventory_items FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON enhanced_inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON enhanced_inventory_items FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON enhanced_inventory_items FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- appointments
CREATE POLICY "account_select" ON appointments FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON appointments FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON appointments FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- business_settings
CREATE POLICY "account_select" ON business_settings FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON business_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON business_settings FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON business_settings FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));