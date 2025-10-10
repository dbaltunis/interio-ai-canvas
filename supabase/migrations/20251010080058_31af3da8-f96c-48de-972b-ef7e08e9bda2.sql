-- Fix RLS policies for treatment_options to allow users to create options
DROP POLICY IF EXISTS "Users can create treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can view treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can update treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment options" ON treatment_options;

-- Allow users to create treatment_options for their templates
CREATE POLICY "Users can create treatment options"
ON treatment_options FOR INSERT
WITH CHECK (
  is_system_default = false
  AND (
    template_id IN (
      SELECT id FROM curtain_templates 
      WHERE user_id = auth.uid() AND is_system_default = false
    )
    OR treatment_category IS NOT NULL
  )
);

-- Allow users to view their own options and system defaults
CREATE POLICY "Users can view treatment options"
ON treatment_options FOR SELECT
USING (
  is_system_default = true
  OR template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid() OR is_system_default = true
  )
  OR (treatment_category IS NOT NULL AND is_system_default = false)
);

-- Allow users to update their own options
CREATE POLICY "Users can update treatment options"
ON treatment_options FOR UPDATE
USING (
  is_system_default = false
  AND template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete their own options
CREATE POLICY "Users can delete treatment options"
ON treatment_options FOR DELETE
USING (
  is_system_default = false
  AND template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid()
  )
);

-- Fix RLS policies for option_values
DROP POLICY IF EXISTS "Users can create option values" ON option_values;
DROP POLICY IF EXISTS "Users can view option values" ON option_values;
DROP POLICY IF EXISTS "Users can update option values" ON option_values;
DROP POLICY IF EXISTS "Users can delete option values" ON option_values;

-- Allow users to create option values for their treatment options
CREATE POLICY "Users can create option values"
ON option_values FOR INSERT
WITH CHECK (
  option_id IN (
    SELECT id FROM treatment_options WHERE is_system_default = false
  )
);

-- Allow users to view option values
CREATE POLICY "Users can view option values"
ON option_values FOR SELECT
USING (
  option_id IN (
    SELECT id FROM treatment_options
  )
);

-- Allow users to update their option values
CREATE POLICY "Users can update option values"
ON option_values FOR UPDATE
USING (
  option_id IN (
    SELECT id FROM treatment_options WHERE is_system_default = false
  )
);

-- Allow users to delete their option values
CREATE POLICY "Users can delete option values"
ON option_values FOR DELETE
USING (
  option_id IN (
    SELECT id FROM treatment_options WHERE is_system_default = false
  )
);