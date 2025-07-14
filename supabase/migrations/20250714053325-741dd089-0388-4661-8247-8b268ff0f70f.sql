-- Add product category field to product templates
ALTER TABLE public.product_templates 
ADD COLUMN product_category TEXT DEFAULT 'curtain' CHECK (product_category IN ('curtain', 'blind', 'both'));

-- Update existing templates to have a default category
UPDATE public.product_templates 
SET product_category = CASE 
  WHEN LOWER(name) LIKE '%blind%' OR LOWER(name) LIKE '%roller%' OR LOWER(name) LIKE '%roman%' THEN 'blind'
  WHEN LOWER(name) LIKE '%curtain%' THEN 'curtain'
  ELSE 'curtain'
END;