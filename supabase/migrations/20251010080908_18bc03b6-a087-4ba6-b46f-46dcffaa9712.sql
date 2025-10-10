-- Update RLS policy to allow viewing treatment_category-based options (template_id IS NULL)
DROP POLICY IF EXISTS "Users can view treatment options" ON treatment_options;

CREATE POLICY "Users can view treatment options"
ON treatment_options FOR SELECT
USING (
  is_system_default = true
  OR template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid() OR is_system_default = true
  )
  OR (
    -- Allow viewing category-based options (not template-specific)
    treatment_category IS NOT NULL 
    AND template_id IS NULL 
    AND is_system_default = false
  )
);