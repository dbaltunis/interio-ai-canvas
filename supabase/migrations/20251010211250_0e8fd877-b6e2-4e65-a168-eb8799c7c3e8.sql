-- Step 1: Delete duplicate treatment_options records, keeping only the earliest created
-- For vertical_blinds and any other categories with duplicates
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY treatment_category, key ORDER BY created_at ASC) as rn
  FROM treatment_options
)
DELETE FROM treatment_options
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Add UNIQUE constraint to prevent future duplicates
-- This ensures (treatment_category, key) combinations are unique at the database level
ALTER TABLE treatment_options 
ADD CONSTRAINT treatment_options_category_key_unique 
UNIQUE (treatment_category, key);

-- Step 3: Create index for better query performance on this combination
CREATE INDEX IF NOT EXISTS idx_treatment_options_category_key 
ON treatment_options(treatment_category, key);