-- Link existing curtain window coverings to the making cost
UPDATE public.window_coverings 
SET making_cost_id = (
  SELECT id FROM public.making_costs 
  WHERE name = 'curtain making cost' 
  LIMIT 1
)
WHERE name ILIKE '%curtain%' AND making_cost_id IS NULL;