-- ============================================
-- PART 1: Fix Price Group Names to Match Existing Grids
-- ============================================

-- Map ROLLER_ prefixed groups to existing numeric grid groups
UPDATE enhanced_inventory_items SET price_group = '1' 
WHERE price_group IN ('ROLLER_STANDARD', 'ROLLER_LIGHT', 'ROLLER_UNIVIEW', 'GROUP_1');

UPDATE enhanced_inventory_items SET price_group = '2' 
WHERE price_group IN ('ROLLER_BLOCKOUT', 'BLOCKOUT');

UPDATE enhanced_inventory_items SET price_group = '3' 
WHERE price_group IN ('ROLLER_SUNSCREEN', 'SUNSCREEN');

-- Map ALUMINIUM_ and WOOD_ prefixed groups for venetian blinds
UPDATE enhanced_inventory_items SET price_group = '1' 
WHERE price_group LIKE 'ALUMINIUM_%';

UPDATE enhanced_inventory_items SET price_group = '1' 
WHERE price_group LIKE 'WOOD_%';

-- Map VERTICAL_ prefixed groups
UPDATE enhanced_inventory_items SET price_group = '1' 
WHERE price_group LIKE 'VERTICAL_%';

-- Map CELLULAR_ prefixed groups
UPDATE enhanced_inventory_items SET price_group = '1' 
WHERE price_group LIKE 'CELLULAR_%';

-- ============================================
-- PART 2: Delete ALL Duplicate Treatment Options
-- ============================================

-- First, delete option_values that belong to duplicate treatment_options
DELETE FROM option_values 
WHERE option_id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY key, treatment_category, account_id ORDER BY created_at ASC) as rn
    FROM treatment_options
  ) ranked 
  WHERE rn > 1
);

-- Delete template_option_settings for duplicate treatment_options
DELETE FROM template_option_settings 
WHERE treatment_option_id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY key, treatment_category, account_id ORDER BY created_at ASC) as rn
    FROM treatment_options
  ) ranked 
  WHERE rn > 1
);

-- Now delete the duplicate treatment_options (keep oldest)
DELETE FROM treatment_options 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY key, treatment_category, account_id ORDER BY created_at ASC) as rn
    FROM treatment_options
  ) ranked 
  WHERE rn > 1
);

-- ============================================
-- PART 3: Clean up any remaining orphans
-- ============================================

-- Clean up option_values pointing to non-existent options
DELETE FROM option_values 
WHERE option_id NOT IN (SELECT id FROM treatment_options);