-- Fix unique constraints on option_type_categories to use account_id instead of user_id
-- This is the SAME multi-tenant isolation bug that affected treatment_options

-- Step 1: Clean up invalid data FIRST (before adding new constraints)
-- Delete system defaults (account_id = NULL)
DELETE FROM option_type_categories 
WHERE account_id IS NULL;

-- Delete records with NULL treatment_category (invalid data)
DELETE FROM option_type_categories 
WHERE treatment_category IS NULL;

-- Step 2: Drop ALL old unique constraints (these use user_id instead of account_id)
ALTER TABLE option_type_categories 
DROP CONSTRAINT IF EXISTS option_type_categories_treatment_category_type_key_key;

DROP INDEX IF EXISTS idx_option_type_system_unique;
DROP INDEX IF EXISTS idx_option_type_user_unique;

-- Step 3: Create the CORRECT account-scoped unique index
CREATE UNIQUE INDEX option_type_categories_account_treatment_type_unique 
ON option_type_categories (account_id, treatment_category, type_key);

-- Step 4: Create matching option_type_categories for all existing treatment_options
-- ONLY insert for treatment_options that have a valid treatment_category
INSERT INTO option_type_categories (account_id, type_key, type_label, treatment_category, sort_order)
SELECT DISTINCT
  topt.account_id,
  topt.key,
  topt.label,
  topt.treatment_category,
  ROW_NUMBER() OVER (PARTITION BY topt.account_id, topt.treatment_category ORDER BY topt.order_index, topt.created_at) as sort_order
FROM treatment_options topt
WHERE topt.treatment_category IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM option_type_categories otc
    WHERE otc.account_id = topt.account_id 
    AND otc.type_key = topt.key
    AND otc.treatment_category = topt.treatment_category
  )
ON CONFLICT (account_id, treatment_category, type_key) DO NOTHING;