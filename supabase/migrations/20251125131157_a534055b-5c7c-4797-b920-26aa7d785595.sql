
-- Delete Test options and their values
DELETE FROM option_values WHERE option_id IN (
  '9efa5da1-8da8-4322-947c-851860a76158',
  'a3b3ab4d-28b5-4aa1-8f67-6d91f8074b7a'
);

DELETE FROM treatment_options WHERE id IN (
  '9efa5da1-8da8-4322-947c-851860a76158',
  'a3b3ab4d-28b5-4aa1-8f67-6d91f8074b7a'
);

-- Create template_option_settings table for template-level option control
CREATE TABLE IF NOT EXISTS template_option_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES product_templates(id) ON DELETE CASCADE,
  treatment_option_id UUID NOT NULL REFERENCES treatment_options(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, treatment_option_id)
);

-- Enable RLS
ALTER TABLE template_option_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_option_settings using org_id from product_templates
CREATE POLICY "Users can manage their org's template option settings"
  ON template_option_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM product_templates
      WHERE product_templates.id = template_option_settings.template_id
      AND (product_templates.org_id)::text = (auth.jwt() ->> 'org_id'::text)
    )
  );

-- Create index for performance
CREATE INDEX idx_template_option_settings_template 
  ON template_option_settings(template_id);

-- Add trigger for updated_at
CREATE TRIGGER update_template_option_settings_updated_at
  BEFORE UPDATE ON template_option_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
