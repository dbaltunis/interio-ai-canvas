-- Fix quote numbers that have wrong format (JOB- instead of QT-)
WITH numbered_quotes AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM quotes
  WHERE quote_number LIKE 'JOB-%'
     OR quote_number NOT LIKE 'QT-%'
)
UPDATE quotes q
SET quote_number = 'QT-' || LPAD(nq.row_num::text, 4, '0')
FROM numbered_quotes nq
WHERE q.id = nq.id;