-- Update demo URLs to use local relative paths
UPDATE store_templates 
SET demo_url = '/store/' || CASE id
  WHEN 'modern-minimalist' THEN 'modern-minimalist-demo'
  WHEN 'classic-elegance' THEN 'classic-elegance-demo'
  WHEN 'bold-showcase' THEN 'bold-showcase-demo'
  WHEN 'professional-business' THEN 'professional-business-demo'
  WHEN 'portfolio-style' THEN 'portfolio-style-demo'
END
WHERE id IN ('modern-minimalist', 'classic-elegance', 'bold-showcase', 'professional-business', 'portfolio-style');