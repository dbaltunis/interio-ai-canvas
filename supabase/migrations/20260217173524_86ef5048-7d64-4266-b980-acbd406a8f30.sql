
-- Backfill: set product_category for all curtain fabrics in Laela account
UPDATE enhanced_inventory_items 
SET product_category = 'curtains'
WHERE user_id = '4eebf4ef-bc13-4e57-b120-32a0ca281932'
  AND subcategory = 'curtain_fabric'
  AND (product_category IS NULL OR product_category = '');

-- Backfill: set compatible_treatments as text array
UPDATE enhanced_inventory_items 
SET compatible_treatments = ARRAY['curtains']::text[]
WHERE user_id = '4eebf4ef-bc13-4e57-b120-32a0ca281932'
  AND category = 'fabric'
  AND (compatible_treatments IS NULL OR array_length(compatible_treatments, 1) IS NULL);

-- Backfill: selling_price fallback to cost_price where selling is 0
UPDATE enhanced_inventory_items 
SET selling_price = cost_price
WHERE user_id = '4eebf4ef-bc13-4e57-b120-32a0ca281932'
  AND selling_price = 0 
  AND cost_price > 0;
