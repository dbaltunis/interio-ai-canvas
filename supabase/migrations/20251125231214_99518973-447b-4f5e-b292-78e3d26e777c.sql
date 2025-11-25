-- Clean up duplicate and empty business_settings records
-- Step 1: For users with multiple records, keep only the one with most complete data
WITH ranked_settings AS (
  SELECT 
    id,
    user_id,
    -- Rank by completeness: prioritize records with company_name, then by created_at
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY 
        CASE WHEN company_name IS NOT NULL THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM business_settings
)
DELETE FROM business_settings
WHERE id IN (
  SELECT id FROM ranked_settings WHERE rn > 1
);

-- Step 2: Add unique constraint on user_id to prevent future duplicates
ALTER TABLE business_settings
DROP CONSTRAINT IF EXISTS business_settings_user_id_unique;

ALTER TABLE business_settings
ADD CONSTRAINT business_settings_user_id_unique UNIQUE (user_id);

-- Step 3: Clean up duplicate quote templates (keep the one without document-settings as first block)
WITH duplicate_templates AS (
  SELECT 
    id,
    name,
    user_id,
    blocks,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, name 
      ORDER BY 
        CASE 
          WHEN (blocks::jsonb->0->>'type') = 'document-settings' THEN 1 
          ELSE 0 
        END,
        created_at DESC
    ) as rn
  FROM quote_templates
  WHERE name = 'Default Quote Template'
)
DELETE FROM quote_templates
WHERE id IN (
  SELECT id FROM duplicate_templates WHERE rn > 1
);