-- Fix the RLS policy to check curtain_templates instead of product_templates
DROP POLICY IF EXISTS "Users can manage template option settings for their account" ON template_option_settings;

CREATE POLICY "Users can manage template option settings for their account"
ON template_option_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
      AND curtain_templates.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM curtain_templates
    WHERE curtain_templates.id = template_option_settings.template_id
      AND curtain_templates.user_id = auth.uid()
  )
);