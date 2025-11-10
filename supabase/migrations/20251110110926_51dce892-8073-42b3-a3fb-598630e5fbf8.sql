-- Update demo URLs to show InterioApp store examples
UPDATE store_templates 
SET demo_url = 'https://interioapp.com/store/modern-minimalist-demo'
WHERE id = 'modern-minimalist';

UPDATE store_templates 
SET demo_url = 'https://interioapp.com/store/classic-elegance-demo'
WHERE id = 'classic-elegance';

UPDATE store_templates 
SET demo_url = 'https://interioapp.com/store/bold-showcase-demo'
WHERE id = 'bold-showcase';

UPDATE store_templates 
SET demo_url = 'https://interioapp.com/store/professional-business-demo'
WHERE id = 'professional-business';

UPDATE store_templates 
SET demo_url = 'https://interioapp.com/store/portfolio-style-demo'
WHERE id = 'portfolio-style';