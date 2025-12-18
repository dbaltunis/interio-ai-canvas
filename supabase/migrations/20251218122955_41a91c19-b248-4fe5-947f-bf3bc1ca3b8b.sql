-- COMPREHENSIVE FIX: Fix all incorrect categories, subcategories, price_groups, vendor links, and duplicate options
-- Part 1: Fix incorrect 'InterioApp' subcategories to proper values

-- Fix blinds_other with InterioApp → material + venetian_slats
UPDATE enhanced_inventory_items
SET 
  category = 'material', 
  subcategory = 'venetian_slats'
WHERE category = 'blinds_other' 
AND subcategory = 'InterioApp';

-- Fix fabric with InterioApp → proper subcategory based on name patterns
-- Roller fabrics → material + roller_fabric
UPDATE enhanced_inventory_items
SET category = 'material', subcategory = 'roller_fabric'
WHERE category IN ('fabric', 'roller_fabric')
AND subcategory = 'InterioApp'
AND (name ILIKE '%roller%' OR name ILIKE '%blockout%' OR name ILIKE '%sunscreen%' OR name ILIKE '%screen%');

-- Curtain fabrics → fabric + curtain_fabric
UPDATE enhanced_inventory_items
SET category = 'fabric', subcategory = 'curtain_fabric'
WHERE category = 'fabric'
AND subcategory = 'InterioApp'
AND (name ILIKE '%curtain%' OR name ILIKE '%drape%' OR name ILIKE '%velvet%' OR name ILIKE '%linen%' OR name ILIKE '%sheer%');

-- Roman fabrics → fabric + roman_fabric
UPDATE enhanced_inventory_items
SET category = 'fabric', subcategory = 'roman_fabric'
WHERE category = 'fabric'
AND subcategory = 'InterioApp'
AND name ILIKE '%roman%';

-- Remaining fabrics → fabric + curtain_fabric (safe default for soft goods)
UPDATE enhanced_inventory_items
SET subcategory = 'curtain_fabric'
WHERE category = 'fabric'
AND subcategory = 'InterioApp';

-- Fix heading items with InterioApp
UPDATE enhanced_inventory_items
SET subcategory = 'curtain_heading'
WHERE category = 'heading'
AND subcategory = 'InterioApp';

-- Fix wallcovering items with InterioApp
UPDATE enhanced_inventory_items
SET subcategory = 'wallpaper'
WHERE category = 'wallcovering'
AND subcategory = 'InterioApp';

-- Fix top_system items → hardware + track
UPDATE enhanced_inventory_items
SET category = 'hardware', subcategory = 'track'
WHERE category = 'top_system'
AND subcategory = 'InterioApp';

-- Part 2: Backfill price_groups based on material names

-- Venetian Aluminium 25mm
UPDATE enhanced_inventory_items
SET price_group = 'ALUMINIUM_25MM'
WHERE subcategory = 'venetian_slats'
AND price_group IS NULL
AND (name ILIKE '%aluminium%25mm%' OR name ILIKE '%aluminum%25mm%' OR name ILIKE '%25mm%aluminium%' OR name ILIKE '%25mm%aluminum%' OR name ILIKE '%25mm standard%');

-- Venetian Aluminium 50mm
UPDATE enhanced_inventory_items
SET price_group = 'ALUMINIUM_50MM'
WHERE subcategory = 'venetian_slats'
AND price_group IS NULL
AND (name ILIKE '%aluminium%50mm%' OR name ILIKE '%aluminum%50mm%' OR name ILIKE '%50mm%aluminium%' OR name ILIKE '%50mm%aluminum%');

-- Venetian Wood 50mm
UPDATE enhanced_inventory_items
SET price_group = 'WOOD_50MM'
WHERE subcategory = 'venetian_slats'
AND price_group IS NULL
AND (name ILIKE '%wood%50mm%' OR name ILIKE '%50mm%wood%' OR name ILIKE '%pure wood%' OR name ILIKE '%timber%');

-- Venetian Fauxwood/Visionwood
UPDATE enhanced_inventory_items
SET price_group = 'FAUXWOOD_50MM'
WHERE subcategory = 'venetian_slats'
AND price_group IS NULL
AND (name ILIKE '%fauxwood%' OR name ILIKE '%faux wood%' OR name ILIKE '%visionwood%' OR name ILIKE '%vision wood%' OR name ILIKE '%pvc%');

-- Default venetian to GROUP_1 if no specific match
UPDATE enhanced_inventory_items
SET price_group = 'GROUP_1'
WHERE subcategory = 'venetian_slats'
AND price_group IS NULL;

-- Roller fabrics - set price_group based on patterns
UPDATE enhanced_inventory_items
SET price_group = 'BLOCKOUT'
WHERE subcategory = 'roller_fabric'
AND price_group IS NULL
AND (name ILIKE '%blockout%' OR name ILIKE '%block out%' OR name ILIKE '%blackout%');

UPDATE enhanced_inventory_items
SET price_group = 'SUNSCREEN'
WHERE subcategory = 'roller_fabric'
AND price_group IS NULL
AND (name ILIKE '%sunscreen%' OR name ILIKE '%screen%' OR name ILIKE '%mesh%');

UPDATE enhanced_inventory_items
SET price_group = 'LIGHT_FILTER'
WHERE subcategory = 'roller_fabric'
AND price_group IS NULL
AND (name ILIKE '%light filter%' OR name ILIKE '%translucent%' OR name ILIKE '%dimout%');

-- Default roller to GROUP_1
UPDATE enhanced_inventory_items
SET price_group = 'GROUP_1'
WHERE subcategory = 'roller_fabric'
AND price_group IS NULL;

-- Vertical slats
UPDATE enhanced_inventory_items
SET price_group = 'VERTICAL_FABRIC'
WHERE subcategory = 'vertical_slats'
AND price_group IS NULL
AND (name ILIKE '%fabric%' OR name ILIKE '%cloth%');

UPDATE enhanced_inventory_items
SET price_group = 'VERTICAL_PVC'
WHERE subcategory = 'vertical_slats'
AND price_group IS NULL
AND (name ILIKE '%pvc%' OR name ILIKE '%vinyl%');

UPDATE enhanced_inventory_items
SET price_group = 'GROUP_1'
WHERE subcategory = 'vertical_slats'
AND price_group IS NULL;

-- Cellular/honeycomb
UPDATE enhanced_inventory_items
SET price_group = 'CELLULAR_SINGLE'
WHERE subcategory = 'cellular'
AND price_group IS NULL
AND name ILIKE '%single%';

UPDATE enhanced_inventory_items
SET price_group = 'CELLULAR_DOUBLE'
WHERE subcategory = 'cellular'
AND price_group IS NULL
AND name ILIKE '%double%';

UPDATE enhanced_inventory_items
SET price_group = 'GROUP_1'
WHERE subcategory = 'cellular'
AND price_group IS NULL;

-- Panel glide
UPDATE enhanced_inventory_items
SET price_group = 'GROUP_1'
WHERE subcategory = 'panel_glide_fabric'
AND price_group IS NULL;

-- Part 3: Backfill vendor_id for TWC items
-- First, get the TWC vendor ID per user and update their items
DO $$
DECLARE
  vendor_record RECORD;
BEGIN
  FOR vendor_record IN 
    SELECT DISTINCT v.id as vendor_id, v.user_id
    FROM vendors v
    WHERE v.name ILIKE '%TWC%' OR v.name ILIKE '%wholesale%'
  LOOP
    UPDATE enhanced_inventory_items
    SET vendor_id = vendor_record.vendor_id
    WHERE user_id = vendor_record.user_id
    AND supplier = 'TWC'
    AND vendor_id IS NULL;
    
    RAISE NOTICE 'Updated TWC items for user % with vendor_id %', vendor_record.user_id, vendor_record.vendor_id;
  END LOOP;
END $$;

-- Part 4: Clean up duplicate treatment_options
-- Delete duplicates keeping the one with most values or earliest created
DELETE FROM treatment_options
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY account_id, treatment_category, key 
        ORDER BY 
          (SELECT COUNT(*) FROM option_values WHERE option_id = treatment_options.id) DESC,
          created_at ASC
      ) as rn
    FROM treatment_options
    WHERE account_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Also clean up any orphaned option_values
DELETE FROM option_values
WHERE option_id NOT IN (SELECT id FROM treatment_options);

-- Part 5: Clean up orphaned option_type_categories
DELETE FROM option_type_categories
WHERE id IN (
  SELECT otc.id
  FROM option_type_categories otc
  LEFT JOIN treatment_options topt ON 
    otc.account_id = topt.account_id AND 
    otc.type_key = topt.key AND 
    otc.treatment_category = topt.treatment_category
  WHERE topt.id IS NULL
  AND otc.account_id IS NOT NULL
);