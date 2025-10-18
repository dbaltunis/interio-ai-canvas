-- Add RLS policies for option_rules table

-- Enable RLS if not already enabled
ALTER TABLE option_rules ENABLE ROW LEVEL SECURITY;

-- Users can view rules for templates they have access to
CREATE POLICY "Users can view option rules for their templates"
ON option_rules FOR SELECT
USING (
  template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid() 
    OR is_system_default = true
  )
);

-- Users can create rules for their own templates
CREATE POLICY "Users can create option rules for their templates"
ON option_rules FOR INSERT
WITH CHECK (
  template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid()
  )
);

-- Users can update rules for their own templates
CREATE POLICY "Users can update option rules for their templates"
ON option_rules FOR UPDATE
USING (
  template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid()
  )
);

-- Users can delete rules for their own templates
CREATE POLICY "Users can delete option rules for their templates"
ON option_rules FOR DELETE
USING (
  template_id IN (
    SELECT id FROM curtain_templates 
    WHERE user_id = auth.uid()
  )
);