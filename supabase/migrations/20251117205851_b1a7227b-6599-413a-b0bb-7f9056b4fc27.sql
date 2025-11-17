-- Add Window Treatment Pro template to store_templates
INSERT INTO store_templates (
  id,
  name,
  description,
  category,
  is_default,
  template_config
) VALUES (
  'window-treatment-pro',
  'Window Treatment Pro',
  'Professional window treatment store with modern design, perfect for blind & curtain businesses',
  'professional',
  true, -- Set as default since it's the only fully styled one
  '{
    "colors": {
      "primary": "#1e293b",
      "secondary": "#ffffff",
      "accent": "#3b82f6",
      "background": "#ffffff",
      "text": "#1e293b"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "defaultPages": []
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default,
  template_config = EXCLUDED.template_config;

-- Set other templates as not default since we have a fully styled one now
UPDATE store_templates 
SET is_default = false 
WHERE id != 'window-treatment-pro';