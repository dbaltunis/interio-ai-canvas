-- Phase 2 Fix: Assign orphaned Staff accounts to correct parent and clean up settings

-- Step 1: Assign orphaned Staff accounts to the owner account (darius+7)
UPDATE user_profiles
SET 
  parent_account_id = '1ae8503a-888c-44d9-95df-f8fbc09ae7df',
  updated_at = now()
WHERE user_id IN (
  '7ba0003a-dd53-4de2-b2cd-32661c0b1772',
  '40967b56-5e28-44ee-a5ed-fbc97e73c974'
);

-- Step 2: Delete their custom settings so they inherit from parent
DELETE FROM business_settings
WHERE user_id IN (
  '7ba0003a-dd53-4de2-b2cd-32661c0b1772',
  '40967b56-5e28-44ee-a5ed-fbc97e73c974'
);

-- Step 3: Ensure all Owner accounts have default settings
-- Only insert if they don't already have settings
DO $$
DECLARE
  owner_record RECORD;
BEGIN
  FOR owner_record IN 
    SELECT up.user_id
    FROM user_profiles up
    WHERE up.role = 'Owner' 
      AND up.parent_account_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM business_settings bs WHERE bs.user_id = up.user_id
      )
  LOOP
    INSERT INTO business_settings (
      user_id,
      measurement_units,
      show_vendor_costs_to_managers,
      show_vendor_costs_to_staff,
      pricing_settings,
      created_at,
      updated_at
    ) VALUES (
      owner_record.user_id,
      '{"system":"imperial","length":"inches","area":"sq_inches","fabric":"yards","currency":"USD"}'::jsonb,
      true,
      false,
      '{"default_markup_percentage":50,"material_markup_percentage":40,"labor_markup_percentage":30,"minimum_markup_percentage":20,"dynamic_pricing_enabled":false,"quantity_discounts_enabled":false,"show_markup_to_staff":false,"category_markups":{"fabric":45,"hardware":35,"blinds":45,"shutters":55,"curtains":50,"installation":25}}'::jsonb,
      now(),
      now()
    );
  END LOOP;
END $$;

COMMENT ON TABLE business_settings IS 'Business settings with inheritance: child accounts inherit from parent via RLS and useBusinessSettings hook';