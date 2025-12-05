-- PHASE 3: Remaining critical tables with account_id

-- treatment_options (uses account_id)
DROP POLICY IF EXISTS "Users can view treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can view options in their account" ON treatment_options;
DROP POLICY IF EXISTS "Users can create treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can update treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can update options in their account" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete options in their account" ON treatment_options;
DROP POLICY IF EXISTS "account_select" ON treatment_options;
DROP POLICY IF EXISTS "account_insert" ON treatment_options;
DROP POLICY IF EXISTS "account_update" ON treatment_options;
DROP POLICY IF EXISTS "account_delete" ON treatment_options;

-- option_values (uses account_id)
DROP POLICY IF EXISTS "Users can view option values" ON option_values;
DROP POLICY IF EXISTS "Users can view values in their account" ON option_values;
DROP POLICY IF EXISTS "Users can create option values" ON option_values;
DROP POLICY IF EXISTS "Users can update option values" ON option_values;
DROP POLICY IF EXISTS "Users can update values in their account" ON option_values;
DROP POLICY IF EXISTS "Users can delete option values" ON option_values;
DROP POLICY IF EXISTS "Users can delete values in their account" ON option_values;
DROP POLICY IF EXISTS "account_select" ON option_values;
DROP POLICY IF EXISTS "account_insert" ON option_values;
DROP POLICY IF EXISTS "account_update" ON option_values;
DROP POLICY IF EXISTS "account_delete" ON option_values;

-- vendors
DROP POLICY IF EXISTS "Users can view own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can view vendors in their account" ON vendors;
DROP POLICY IF EXISTS "Users can create vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update vendors in their account" ON vendors;
DROP POLICY IF EXISTS "Users can delete own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can delete vendors in their account" ON vendors;
DROP POLICY IF EXISTS "account_select" ON vendors;
DROP POLICY IF EXISTS "account_insert" ON vendors;
DROP POLICY IF EXISTS "account_update" ON vendors;
DROP POLICY IF EXISTS "account_delete" ON vendors;

-- tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks in their account" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in their account" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their account" ON tasks;
DROP POLICY IF EXISTS "account_select" ON tasks;
DROP POLICY IF EXISTS "account_insert" ON tasks;
DROP POLICY IF EXISTS "account_update" ON tasks;
DROP POLICY IF EXISTS "account_delete" ON tasks;

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view notifications in their account" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications in their account" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications in their account" ON notifications;
DROP POLICY IF EXISTS "account_select" ON notifications;
DROP POLICY IF EXISTS "account_insert" ON notifications;
DROP POLICY IF EXISTS "account_update" ON notifications;
DROP POLICY IF EXISTS "account_delete" ON notifications;

-- email_templates
DROP POLICY IF EXISTS "Users can view own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can view templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can create templates" ON email_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can update templates in their account" ON email_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can delete templates in their account" ON email_templates;
DROP POLICY IF EXISTS "account_select" ON email_templates;
DROP POLICY IF EXISTS "account_insert" ON email_templates;
DROP POLICY IF EXISTS "account_update" ON email_templates;
DROP POLICY IF EXISTS "account_delete" ON email_templates;

-- CREATE NEW POLICIES

-- treatment_options (account_id based)
CREATE POLICY "account_select" ON treatment_options FOR SELECT USING (
  public.get_effective_account_owner(auth.uid()) = account_id
  OR account_id IS NULL
);
CREATE POLICY "account_insert" ON treatment_options FOR INSERT WITH CHECK (
  public.get_effective_account_owner(auth.uid()) = account_id
);
CREATE POLICY "account_update" ON treatment_options FOR UPDATE USING (
  public.get_effective_account_owner(auth.uid()) = account_id
);
CREATE POLICY "account_delete" ON treatment_options FOR DELETE USING (
  public.get_effective_account_owner(auth.uid()) = account_id
);

-- option_values (account_id based)
CREATE POLICY "account_select" ON option_values FOR SELECT USING (
  public.get_effective_account_owner(auth.uid()) = account_id
  OR account_id IS NULL
);
CREATE POLICY "account_insert" ON option_values FOR INSERT WITH CHECK (
  public.get_effective_account_owner(auth.uid()) = account_id
);
CREATE POLICY "account_update" ON option_values FOR UPDATE USING (
  public.get_effective_account_owner(auth.uid()) = account_id
);
CREATE POLICY "account_delete" ON option_values FOR DELETE USING (
  public.get_effective_account_owner(auth.uid()) = account_id
);

-- vendors
CREATE POLICY "account_select" ON vendors FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON vendors FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON vendors FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- tasks
CREATE POLICY "account_select" ON tasks FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON tasks FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON tasks FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- notifications
CREATE POLICY "account_select" ON notifications FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON notifications FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON notifications FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- email_templates
CREATE POLICY "account_select" ON email_templates FOR SELECT USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_insert" ON email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "account_update" ON email_templates FOR UPDATE USING (auth.uid() = user_id OR public.is_same_account(user_id));
CREATE POLICY "account_delete" ON email_templates FOR DELETE USING (auth.uid() = user_id OR public.is_same_account(user_id));