
-- Fix Roman blinds lining options for account ec930f73-ef23-4430-921f-1b401859825d

-- Fix 1: Set lining_type to required=false (was causing "Lining Type is required" error)
UPDATE treatment_options 
SET required = false, updated_at = now()
WHERE id = 'fe2815ad-26ab-47de-83ea-cb5bc897ace9'
AND treatment_category = 'roman_blinds'
AND key = 'lining_type';

-- Fix 2: Set lining to visible=true and add per-linear-meter pricing method
UPDATE treatment_options 
SET visible = true, 
    pricing_method = 'per-linear-meter',
    updated_at = now()
WHERE id = 'f939fe99-2de5-47d2-86d6-f0968804c84c'
AND treatment_category = 'roman_blinds'
AND key = 'lining';
