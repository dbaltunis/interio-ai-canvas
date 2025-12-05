-- FINAL: Create clean policies for tables now without policies

-- hardware_assemblies
CREATE POLICY "account_select" ON hardware_assemblies FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON hardware_assemblies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON hardware_assemblies FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON hardware_assemblies FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- lead_scoring_rules
CREATE POLICY "account_select" ON lead_scoring_rules FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON lead_scoring_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON lead_scoring_rules FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON lead_scoring_rules FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- project_notes
CREATE POLICY "account_select" ON project_notes FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON project_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON project_notes FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON project_notes FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- user_invitations
CREATE POLICY "account_select" ON user_invitations FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON user_invitations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_permissions
CREATE POLICY "account_select" ON user_permissions FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- user_presence
CREATE POLICY "account_select" ON user_presence FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON user_presence FOR UPDATE USING (auth.uid() = user_id);

-- user_roles
CREATE POLICY "account_select" ON user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- user_subscriptions  
CREATE POLICY "account_select" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));