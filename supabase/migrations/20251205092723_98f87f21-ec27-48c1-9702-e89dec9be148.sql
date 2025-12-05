-- PHASE 2: More critical tables RLS reset

-- curtain_templates
DROP POLICY IF EXISTS "Users can view own templates" ON curtain_templates;
DROP POLICY IF EXISTS "Users can view templates in their account" ON curtain_templates;
DROP POLICY IF EXISTS "Users can create templates" ON curtain_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON curtain_templates;
DROP POLICY IF EXISTS "Users can update templates in their account" ON curtain_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON curtain_templates;
DROP POLICY IF EXISTS "Users can delete templates in their account" ON curtain_templates;
DROP POLICY IF EXISTS "account_select" ON curtain_templates;
DROP POLICY IF EXISTS "account_insert" ON curtain_templates;
DROP POLICY IF EXISTS "account_update" ON curtain_templates;
DROP POLICY IF EXISTS "account_delete" ON curtain_templates;

-- pricing_grids
DROP POLICY IF EXISTS "Users can view own grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can view grids in their account" ON pricing_grids;
DROP POLICY IF EXISTS "Users can create grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can update own grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can update grids in their account" ON pricing_grids;
DROP POLICY IF EXISTS "Users can delete own grids" ON pricing_grids;
DROP POLICY IF EXISTS "Users can delete grids in their account" ON pricing_grids;
DROP POLICY IF EXISTS "account_select" ON pricing_grids;
DROP POLICY IF EXISTS "account_insert" ON pricing_grids;
DROP POLICY IF EXISTS "account_update" ON pricing_grids;
DROP POLICY IF EXISTS "account_delete" ON pricing_grids;

-- treatments
DROP POLICY IF EXISTS "Users can view own treatments" ON treatments;
DROP POLICY IF EXISTS "Users can view treatments in their account" ON treatments;
DROP POLICY IF EXISTS "Users can create treatments" ON treatments;
DROP POLICY IF EXISTS "Users can update own treatments" ON treatments;
DROP POLICY IF EXISTS "Users can update treatments in their account" ON treatments;
DROP POLICY IF EXISTS "Users can delete own treatments" ON treatments;
DROP POLICY IF EXISTS "Users can delete treatments in their account" ON treatments;
DROP POLICY IF EXISTS "account_select" ON treatments;
DROP POLICY IF EXISTS "account_insert" ON treatments;
DROP POLICY IF EXISTS "account_update" ON treatments;
DROP POLICY IF EXISTS "account_delete" ON treatments;

-- rooms
DROP POLICY IF EXISTS "Users can view own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view rooms in their account" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Users can update own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can update rooms in their account" ON rooms;
DROP POLICY IF EXISTS "Users can delete own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can delete rooms in their account" ON rooms;
DROP POLICY IF EXISTS "account_select" ON rooms;
DROP POLICY IF EXISTS "account_insert" ON rooms;
DROP POLICY IF EXISTS "account_update" ON rooms;
DROP POLICY IF EXISTS "account_delete" ON rooms;

-- emails
DROP POLICY IF EXISTS "Users can view own emails" ON emails;
DROP POLICY IF EXISTS "Users can view emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can create emails" ON emails;
DROP POLICY IF EXISTS "Users can update own emails" ON emails;
DROP POLICY IF EXISTS "Users can update emails in their account" ON emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete emails in their account" ON emails;
DROP POLICY IF EXISTS "account_select" ON emails;
DROP POLICY IF EXISTS "account_insert" ON emails;
DROP POLICY IF EXISTS "account_update" ON emails;
DROP POLICY IF EXISTS "account_delete" ON emails;

-- deals
DROP POLICY IF EXISTS "Users can view own deals" ON deals;
DROP POLICY IF EXISTS "Users can view deals in their account" ON deals;
DROP POLICY IF EXISTS "Users can create deals" ON deals;
DROP POLICY IF EXISTS "Users can update own deals" ON deals;
DROP POLICY IF EXISTS "Users can update deals in their account" ON deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON deals;
DROP POLICY IF EXISTS "Users can delete deals in their account" ON deals;
DROP POLICY IF EXISTS "account_select" ON deals;
DROP POLICY IF EXISTS "account_insert" ON deals;
DROP POLICY IF EXISTS "account_update" ON deals;
DROP POLICY IF EXISTS "account_delete" ON deals;

-- CREATE NEW POLICIES

-- curtain_templates
CREATE POLICY "account_select" ON curtain_templates FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON curtain_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON curtain_templates FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON curtain_templates FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- pricing_grids
CREATE POLICY "account_select" ON pricing_grids FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON pricing_grids FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON pricing_grids FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON pricing_grids FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- treatments
CREATE POLICY "account_select" ON treatments FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON treatments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON treatments FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON treatments FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- rooms
CREATE POLICY "account_select" ON rooms FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON rooms FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON rooms FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- emails
CREATE POLICY "account_select" ON emails FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON emails FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON emails FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- deals
CREATE POLICY "account_select" ON deals FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON deals FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON deals FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));