-- Fix display_unit for ALL existing workshop_items across ALL users
-- Read the correct unit from business_settings.measurement_units->>'length'
UPDATE workshop_items wi
SET measurements = jsonb_set(
  COALESCE(wi.measurements, '{}'::jsonb),
  '{display_unit}',
  to_jsonb(
    COALESCE(
      (
        SELECT 
          CASE 
            WHEN bs.measurement_units IS NOT NULL THEN
              COALESCE(bs.measurement_units::jsonb->>'length', 'cm')
            ELSE 'cm'
          END
        FROM business_settings bs
        WHERE bs.user_id = wi.user_id
        LIMIT 1
      ),
      'cm'
    )
  )
)
WHERE wi.measurements IS NOT NULL;