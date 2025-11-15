
-- ============================================================
-- CLEANUP: Remove Duplicate Option Type Categories
-- ============================================================
-- This migration removes option type categories that duplicate
-- functionality available elsewhere in the system

-- 1. Deactivate "Heading Types" for curtains
--    Reason: Headings are managed in the Headings section with
--    inventory items, fullness ratios, pricing, and images
UPDATE option_type_categories
SET active = false,
    updated_at = now()
WHERE type_key = 'heading_type' 
  AND treatment_category = 'curtains'
  AND is_system_default = true;

-- 2. Deactivate "Fullness Options" for curtains  
--    Reason: Fullness is an attribute of heading inventory items,
--    not a standalone option
UPDATE option_type_categories
SET active = false,
    updated_at = now()
WHERE type_key = 'fullness'
  AND treatment_category = 'curtains'
  AND is_system_default = true;

-- 3. Also deactivate any related treatment_options that were created
--    for these deprecated option types (they'll be orphaned now)
UPDATE treatment_options
SET visible = false,
    updated_at = now()
WHERE key IN ('heading_type', 'fullness')
  AND treatment_category = 'curtains';

-- Add comment explaining this change
COMMENT ON COLUMN option_type_categories.active IS 
'When false, this option type category is hidden from the UI. Deactivated categories include those that duplicate functionality available elsewhere (e.g., heading_type is managed in the Headings inventory section).';
