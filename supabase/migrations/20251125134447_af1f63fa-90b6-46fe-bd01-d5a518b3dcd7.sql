
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage their org's template option settings" ON template_option_settings;

-- Create new policy using the get_user_account_id function
CREATE POLICY "Users can manage template option settings for their account"
ON template_option_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM product_templates
    WHERE product_templates.id = template_option_settings.template_id
      AND product_templates.org_id = get_user_account_id(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM product_templates
    WHERE product_templates.id = template_option_settings.template_id
      AND product_templates.org_id = get_user_account_id(auth.uid())
  )
);
