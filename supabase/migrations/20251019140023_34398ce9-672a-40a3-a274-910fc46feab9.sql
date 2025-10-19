-- 1. Ensure blinds use 1.0 fullness and per sqm pricing
UPDATE curtain_templates
SET fullness_ratio = 1.0,
    pricing_type = 'per_sqm'
WHERE LOWER(treatment_category) LIKE '%blind%';

-- 2. Add hem allowance columns if missing
ALTER TABLE curtain_templates
ADD COLUMN IF NOT EXISTS blind_header_hem_cm numeric DEFAULT 8,
ADD COLUMN IF NOT EXISTS blind_bottom_hem_cm numeric DEFAULT 8,
ADD COLUMN IF NOT EXISTS blind_side_hem_cm numeric DEFAULT 0;

-- 3. Add machine price per sqm column
ALTER TABLE curtain_templates
ADD COLUMN IF NOT EXISTS machine_price_per_sqm numeric;

-- 4. Default machine price per sqm for blinds
UPDATE curtain_templates
SET machine_price_per_sqm = COALESCE(machine_price_per_sqm, 33)
WHERE LOWER(treatment_category) LIKE '%blind%';