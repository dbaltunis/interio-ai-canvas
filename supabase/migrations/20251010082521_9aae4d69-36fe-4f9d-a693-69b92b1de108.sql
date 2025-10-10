-- Phase 1: Standardize treatment_category across all templates
-- Map curtain_type values to consistent treatment_category values

UPDATE curtain_templates
SET treatment_category = CASE
  WHEN curtain_type = 'roller_blind' THEN 'roller_blinds'
  WHEN curtain_type = 'roman_blind' THEN 'roman_blinds'
  WHEN curtain_type = 'venetian_blind' THEN 'venetian_blinds'
  WHEN curtain_type = 'vertical_blind' THEN 'vertical_blinds'
  WHEN curtain_type = 'panel_glide' THEN 'panel_glide'
  WHEN curtain_type = 'plantation_shutter' THEN 'shutters'
  WHEN curtain_type = 'cellular_shade' THEN 'cellular_shades'
  WHEN curtain_type IN ('single', 'double', 'sheer') THEN 'curtains'
  ELSE treatment_category
END
WHERE treatment_category IS NULL OR treatment_category != CASE
  WHEN curtain_type = 'roller_blind' THEN 'roller_blinds'
  WHEN curtain_type = 'roman_blind' THEN 'roman_blinds'
  WHEN curtain_type = 'venetian_blind' THEN 'venetian_blinds'
  WHEN curtain_type = 'vertical_blind' THEN 'vertical_blinds'
  WHEN curtain_type = 'panel_glide' THEN 'panel_glide'
  WHEN curtain_type = 'plantation_shutter' THEN 'shutters'
  WHEN curtain_type = 'cellular_shade' THEN 'cellular_shades'
  WHEN curtain_type IN ('single', 'double', 'sheer') THEN 'curtains'
  ELSE treatment_category
END;

-- Create helper function for flexible category matching
CREATE OR REPLACE FUNCTION normalize_treatment_category(category_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE
    WHEN category_input IN ('roller_blind', 'roller_blinds') THEN 'roller_blinds'
    WHEN category_input IN ('roman_blind', 'roman_blinds') THEN 'roman_blinds'
    WHEN category_input IN ('venetian_blind', 'venetian_blinds') THEN 'venetian_blinds'
    WHEN category_input IN ('vertical_blind', 'vertical_blinds') THEN 'vertical_blinds'
    WHEN category_input = 'panel_glide' THEN 'panel_glide'
    WHEN category_input IN ('plantation_shutter', 'shutters') THEN 'shutters'
    WHEN category_input IN ('cellular_shade', 'cellular_shades') THEN 'cellular_shades'
    WHEN category_input IN ('single', 'double', 'sheer', 'curtain', 'curtains') THEN 'curtains'
    ELSE category_input
  END;
END;
$$;