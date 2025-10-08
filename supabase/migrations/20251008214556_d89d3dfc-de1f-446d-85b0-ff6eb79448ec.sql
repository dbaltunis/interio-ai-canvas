-- Allow all authenticated users to view system default templates
CREATE POLICY "Anyone can view system default templates"
ON curtain_templates
FOR SELECT
TO authenticated
USING (is_system_default = true AND active = true);

-- Prevent users from modifying system templates (only select allowed)
-- The existing policies already handle user templates correctly