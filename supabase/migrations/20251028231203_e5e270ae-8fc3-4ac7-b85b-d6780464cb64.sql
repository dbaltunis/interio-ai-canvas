-- Comprehensive Quote Fix Migration
-- 1. Fix quote numbers for project 1b9da7b6-1f83-4e3e-a3b5-75f0108cf186
-- 2. Set proper status_id for quotes with null status_id

-- First, get or create the "Draft" status
DO $$
DECLARE
  draft_status_id uuid;
  user_id_val uuid;
BEGIN
  -- Get user_id from the first quote in the project
  SELECT user_id INTO user_id_val 
  FROM quotes 
  WHERE project_id = '1b9da7b6-1f83-4e3e-a3b5-75f0108cf186' 
  LIMIT 1;

  -- Try to find existing Draft status for this user in Quote category
  SELECT id INTO draft_status_id
  FROM job_statuses
  WHERE user_id = user_id_val
    AND name ILIKE 'Draft'
    AND category = 'Quote'
    AND is_active = true
  LIMIT 1;

  -- If no Draft status found in Quote category, try to find any Draft status
  IF draft_status_id IS NULL THEN
    SELECT id INTO draft_status_id
    FROM job_statuses
    WHERE user_id = user_id_val
      AND name ILIKE 'Draft'
      AND is_active = true
    LIMIT 1;
  END IF;

  -- If still no Draft status exists, create one
  IF draft_status_id IS NULL THEN
    INSERT INTO job_statuses (user_id, name, description, category, color, slot_number, is_active)
    VALUES (user_id_val, 'Draft', 'Quote is being drafted', 'Quote', 'gray', 1, true)
    RETURNING id INTO draft_status_id;
  END IF;

  -- Update all quotes with null status_id to use the Draft status
  UPDATE quotes
  SET status_id = draft_status_id
  WHERE project_id = '1b9da7b6-1f83-4e3e-a3b5-75f0108cf186'
    AND status_id IS NULL;

  -- Fix quote numbers for the specific project
  -- Use the last 4 digits from the original JOB number (3932 from JOB-1761689413932)
  WITH ordered_quotes AS (
    SELECT 
      id,
      version,
      ROW_NUMBER() OVER (ORDER BY created_at, version) as row_num
    FROM quotes
    WHERE project_id = '1b9da7b6-1f83-4e3e-a3b5-75f0108cf186'
  )
  UPDATE quotes q
  SET quote_number = CASE 
    WHEN oq.version = 1 OR oq.version IS NULL THEN 'QT-3932'
    ELSE 'QT-3932-v' || oq.version::text
  END
  FROM ordered_quotes oq
  WHERE q.id = oq.id;

END $$;

-- Create an index on quote_number for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- Create an index on status_id for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_status_id ON quotes(status_id);