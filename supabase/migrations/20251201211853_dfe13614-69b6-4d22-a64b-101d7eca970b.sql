-- Fix corrupted pricing_settings for baltunis@curtainscalculator.com
-- Correct user_id: ec930f73-ef23-4430-921f-1b401859825d

UPDATE business_settings 
SET pricing_settings = '{"manufacturing_defaults":{"return_left":8,"return_right":8,"overlap":10.5,"header_allowance":7.5,"bottom_hem":14.5,"side_hems":8,"seam_hems":2,"waste_percent":5.5,"supports_railroading":true,"supports_pattern_matching":true,"supports_custom_hems":true,"measurement_unit":"inches"}}'::jsonb,
    updated_at = now()
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d';