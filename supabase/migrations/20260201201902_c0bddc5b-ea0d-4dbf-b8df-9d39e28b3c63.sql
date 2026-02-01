-- Fix orphaned inventory items created by team members
-- These items were saved with the team member's user_id instead of the account owner's user_id
-- making them invisible to everyone including the creator

-- Step 1: Update enhanced_inventory_items to use the correct account owner ID
UPDATE enhanced_inventory_items eii
SET user_id = (
  SELECT COALESCE(up.parent_account_id, up.user_id)
  FROM user_profiles up
  WHERE up.user_id = eii.user_id
)
WHERE eii.user_id IN (
  SELECT up.user_id 
  FROM user_profiles up 
  WHERE up.parent_account_id IS NOT NULL
);

-- Step 2: Also fix any orphaned business_settings (though less likely)
-- Business settings should also belong to the account owner
UPDATE business_settings bs
SET user_id = (
  SELECT COALESCE(up.parent_account_id, up.user_id)
  FROM user_profiles up
  WHERE up.user_id = bs.user_id
)
WHERE bs.user_id IN (
  SELECT up.user_id 
  FROM user_profiles up 
  WHERE up.parent_account_id IS NOT NULL
);