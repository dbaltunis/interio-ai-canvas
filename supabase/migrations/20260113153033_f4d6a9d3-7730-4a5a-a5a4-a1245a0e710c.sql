-- Restore zeroed quote
UPDATE quotes SET 
  subtotal = 39846.00,
  total_amount = 39846.00,
  updated_at = NOW()
WHERE id = '5982c9eb-b60d-4eb9-bbc1-5e5fca2736d6' AND total_amount = 0;