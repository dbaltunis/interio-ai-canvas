-- ============================================
-- PERMANENT FIX: Remove curtain_type column confusion
-- Use ONLY treatment_category for product categorization
-- ============================================

-- Drop the redundant curtain_type column from curtain_templates
-- All templates already have treatment_category populated correctly
ALTER TABLE curtain_templates DROP COLUMN IF EXISTS curtain_type;

-- Add comment explaining the standard
COMMENT ON COLUMN curtain_templates.treatment_category IS 'Treatment category using plural standard form (roller_blinds, curtains, roman_blinds, etc.) - this is the ONLY field for product type categorization';