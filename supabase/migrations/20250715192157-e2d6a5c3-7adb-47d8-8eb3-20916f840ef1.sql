
-- Check the current constraint and update it to allow the values used in the form
DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'window_coverings_fabrication_pricing_method_check'
        AND table_name = 'window_coverings'
    ) THEN
        ALTER TABLE window_coverings DROP CONSTRAINT window_coverings_fabrication_pricing_method_check;
    END IF;
    
    -- Add the new constraint with the correct values
    ALTER TABLE window_coverings ADD CONSTRAINT window_coverings_fabrication_pricing_method_check 
    CHECK (fabrication_pricing_method IN ('linear_meter', 'per_drop', 'per_panel', 'pricing_grid', 'fixed_price'));
END $$;
