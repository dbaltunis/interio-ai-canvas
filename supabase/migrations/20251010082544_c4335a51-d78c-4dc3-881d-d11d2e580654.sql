-- Fix search_path security warning for normalize_treatment_category function
DROP FUNCTION IF EXISTS normalize_treatment_category(text);

CREATE OR REPLACE FUNCTION normalize_treatment_category(category_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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