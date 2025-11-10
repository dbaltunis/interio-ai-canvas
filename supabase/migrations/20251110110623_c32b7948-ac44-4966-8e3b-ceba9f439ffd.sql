-- Add demo URLs to existing store templates
UPDATE store_templates 
SET demo_url = 'https://themes.shopify.com/themes/dawn/styles/default'
WHERE id = 'modern-minimalist';

UPDATE store_templates 
SET demo_url = 'https://themes.shopify.com/themes/craft/styles/default'
WHERE id = 'classic-elegance';

UPDATE store_templates 
SET demo_url = 'https://themes.shopify.com/themes/studio/styles/default'
WHERE id = 'bold-showcase';

UPDATE store_templates 
SET demo_url = 'https://themes.shopify.com/themes/sense/styles/default'
WHERE id = 'professional-business';

UPDATE store_templates 
SET demo_url = 'https://themes.shopify.com/themes/origin/styles/default'
WHERE id = 'portfolio-style';