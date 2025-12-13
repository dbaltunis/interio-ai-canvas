-- Phase A: Fix TWC Options - Set source to 'twc' for TWC-imported options
-- TWC options have characteristic patterns from the TWC API

UPDATE treatment_options
SET source = 'twc'
WHERE source = 'manual' OR source IS NULL
AND (
  -- TWC-style question patterns
  key ILIKE '%colour%' 
  OR key ILIKE '%control%' 
  OR key ILIKE '%bottom_bar%'
  OR key ILIKE '%fascia%'
  OR key ILIKE '%motor%'
  OR key ILIKE '%linked%'
  OR key ILIKE '%chain%'
  OR key ILIKE '%wand%'
  OR key ILIKE '%cord%'
  OR key ILIKE '%slat%'
  OR key ILIKE '%valance%'
  OR key ILIKE '%headrail%'
)
AND account_id IN (
  SELECT DISTINCT user_id FROM enhanced_inventory_items WHERE supplier = 'TWC'
);

-- Phase B: Fix Price Group for ALL TWC Items that have it in metadata
UPDATE enhanced_inventory_items
SET price_group = metadata->>'twc_pricing_group'
WHERE supplier = 'TWC'
AND price_group IS NULL
AND metadata->>'twc_pricing_group' IS NOT NULL;

-- Also try extracting from nested structure if exists
UPDATE enhanced_inventory_items
SET price_group = metadata->'twc_fabrics_and_colours'->0->>'pricingGroup'
WHERE supplier = 'TWC'
AND price_group IS NULL
AND metadata->'twc_fabrics_and_colours'->0->>'pricingGroup' IS NOT NULL;