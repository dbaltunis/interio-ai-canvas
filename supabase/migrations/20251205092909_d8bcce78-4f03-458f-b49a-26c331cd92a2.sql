-- PHASE 4 CORRECTED: Tables that have user_id column

-- client_activity_log
DROP POLICY IF EXISTS "Users can view own activity" ON client_activity_log;
DROP POLICY IF EXISTS "Users can view activity in their account" ON client_activity_log;
DROP POLICY IF EXISTS "Users can create activity" ON client_activity_log;
DROP POLICY IF EXISTS "Users can update own activity" ON client_activity_log;
DROP POLICY IF EXISTS "Users can update activity in their account" ON client_activity_log;
DROP POLICY IF EXISTS "Users can delete own activity" ON client_activity_log;
DROP POLICY IF EXISTS "Users can delete activity in their account" ON client_activity_log;
DROP POLICY IF EXISTS "account_select" ON client_activity_log;
DROP POLICY IF EXISTS "account_insert" ON client_activity_log;
DROP POLICY IF EXISTS "account_update" ON client_activity_log;
DROP POLICY IF EXISTS "account_delete" ON client_activity_log;

-- client_files
DROP POLICY IF EXISTS "Users can view own files" ON client_files;
DROP POLICY IF EXISTS "Users can view files in their account" ON client_files;
DROP POLICY IF EXISTS "Users can create files" ON client_files;
DROP POLICY IF EXISTS "Users can update own files" ON client_files;
DROP POLICY IF EXISTS "Users can update files in their account" ON client_files;
DROP POLICY IF EXISTS "Users can delete own files" ON client_files;
DROP POLICY IF EXISTS "Users can delete files in their account" ON client_files;
DROP POLICY IF EXISTS "account_select" ON client_files;
DROP POLICY IF EXISTS "account_insert" ON client_files;
DROP POLICY IF EXISTS "account_update" ON client_files;
DROP POLICY IF EXISTS "account_delete" ON client_files;

-- client_measurements
DROP POLICY IF EXISTS "Users can view own measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can view measurements in their account" ON client_measurements;
DROP POLICY IF EXISTS "Users can create measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can update own measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can update measurements in their account" ON client_measurements;
DROP POLICY IF EXISTS "Users can delete own measurements" ON client_measurements;
DROP POLICY IF EXISTS "Users can delete measurements in their account" ON client_measurements;
DROP POLICY IF EXISTS "account_select" ON client_measurements;
DROP POLICY IF EXISTS "account_insert" ON client_measurements;
DROP POLICY IF EXISTS "account_update" ON client_measurements;
DROP POLICY IF EXISTS "account_delete" ON client_measurements;

-- collections
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Users can view collections in their account" ON collections;
DROP POLICY IF EXISTS "Users can create collections" ON collections;
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Users can update collections in their account" ON collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete collections in their account" ON collections;
DROP POLICY IF EXISTS "account_select" ON collections;
DROP POLICY IF EXISTS "account_insert" ON collections;
DROP POLICY IF EXISTS "account_update" ON collections;
DROP POLICY IF EXISTS "account_delete" ON collections;

-- inventory_categories
DROP POLICY IF EXISTS "Users can view own categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can view categories in their account" ON inventory_categories;
DROP POLICY IF EXISTS "Users can create categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can update categories in their account" ON inventory_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can delete categories in their account" ON inventory_categories;
DROP POLICY IF EXISTS "account_select" ON inventory_categories;
DROP POLICY IF EXISTS "account_insert" ON inventory_categories;
DROP POLICY IF EXISTS "account_update" ON inventory_categories;
DROP POLICY IF EXISTS "account_delete" ON inventory_categories;

-- CREATE NEW POLICIES

-- client_activity_log
CREATE POLICY "account_select" ON client_activity_log FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON client_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON client_activity_log FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON client_activity_log FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- client_files
CREATE POLICY "account_select" ON client_files FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON client_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON client_files FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON client_files FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- client_measurements
CREATE POLICY "account_select" ON client_measurements FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON client_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON client_measurements FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON client_measurements FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- collections
CREATE POLICY "account_select" ON collections FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON collections FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON collections FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- inventory_categories
CREATE POLICY "account_select" ON inventory_categories FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON inventory_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON inventory_categories FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON inventory_categories FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));