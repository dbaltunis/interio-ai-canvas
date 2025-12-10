-- Fix tax_rate on quotes where it's 0 but tax_amount was calculated
-- This ensures tax line displays correctly

-- First, check and update quotes that have tax_amount but tax_rate = 0
UPDATE quotes q
SET tax_rate = COALESCE(
  (SELECT bs.tax_rate / 100.0 
   FROM business_settings bs 
   JOIN projects p ON p.user_id = bs.user_id 
   WHERE p.id = q.project_id 
   LIMIT 1),
  0.10
)
WHERE q.tax_rate = 0 
  AND q.tax_amount > 0;

-- Log what we fixed
SELECT id, quote_number, subtotal, tax_rate, tax_amount, total_amount 
FROM quotes 
WHERE tax_amount > 0 
ORDER BY created_at DESC 
LIMIT 5;