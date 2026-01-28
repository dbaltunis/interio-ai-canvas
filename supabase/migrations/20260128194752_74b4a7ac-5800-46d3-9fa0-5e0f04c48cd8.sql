-- Backfill: Unify roman_fabric to curtain_fabric for Library display consistency
-- This affects 126 items across all accounts
UPDATE enhanced_inventory_items 
SET subcategory = 'curtain_fabric',
    updated_at = NOW()
WHERE subcategory = 'roman_fabric';