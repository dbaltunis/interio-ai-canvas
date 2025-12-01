-- Fix template_option_settings RLS to support team sharing
DROP POLICY IF EXISTS "Users can manage template option settings for their account" ON template_option_settings;

-- Create account-based isolation policy
CREATE POLICY "Account isolation - SELECT"
ON template_option_settings FOR SELECT
USING (EXISTS (
    SELECT 1 FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(curtain_templates.user_id)
));

CREATE POLICY "Account isolation - INSERT"
ON template_option_settings FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(curtain_templates.user_id)
));

CREATE POLICY "Account isolation - UPDATE"
ON template_option_settings FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(curtain_templates.user_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(curtain_templates.user_id)
));

CREATE POLICY "Account isolation - DELETE"
ON template_option_settings FOR DELETE
USING (EXISTS (
    SELECT 1 FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(curtain_templates.user_id)
));