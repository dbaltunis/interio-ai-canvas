-- Phase 3: Link TWC options to TWC templates that are missing option links
-- This ensures TWC options appear in the worksheet popup for all TWC templates

-- First, let's see how many TWC templates are missing option links
DO $$
DECLARE
  templates_fixed INTEGER := 0;
  options_linked INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting TWC options linking migration...';
END $$;

-- Link TWC options to TWC templates based on matching treatment_category
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT DISTINCT
  ct.id as template_id,
  to_options.id as treatment_option_id,
  true as is_enabled
FROM curtain_templates ct
CROSS JOIN treatment_options to_options 
WHERE 
  -- Match TWC templates (by name or description containing TWC)
  (ct.name ILIKE '%TWC%' OR ct.description ILIKE '%TWC%')
  -- Match TWC options
  AND to_options.source = 'twc'
  -- Match by treatment category
  AND to_options.treatment_category = ct.treatment_category
  -- Only link if not already linked
  AND NOT EXISTS (
    SELECT 1 FROM template_option_settings tos 
    WHERE tos.template_id = ct.id 
    AND tos.treatment_option_id = to_options.id
  );

-- Report how many links were created
DO $$
DECLARE
  link_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO link_count
  FROM template_option_settings tos
  JOIN curtain_templates ct ON ct.id = tos.template_id
  JOIN treatment_options to_opt ON to_opt.id = tos.treatment_option_id
  WHERE (ct.name ILIKE '%TWC%' OR ct.description ILIKE '%TWC%')
    AND to_opt.source = 'twc';
  
  RAISE NOTICE 'Total TWC option links in template_option_settings: %', link_count;
END $$;