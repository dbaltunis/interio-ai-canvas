-- Add blind-specific hem allowance columns to curtain_templates table
-- These are used for fabric calculations in curtains and roman blinds

-- Add the columns if they don't exist
DO $$ 
BEGIN
  -- Add blind_header_hem_cm column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'curtain_templates' 
    AND column_name = 'blind_header_hem_cm'
  ) THEN
    ALTER TABLE public.curtain_templates 
    ADD COLUMN blind_header_hem_cm NUMERIC(10,2) DEFAULT 8;
    
    COMMENT ON COLUMN public.curtain_templates.blind_header_hem_cm IS 'Header hem allowance in centimeters for fabric calculation';
  END IF;

  -- Add blind_bottom_hem_cm column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'curtain_templates' 
    AND column_name = 'blind_bottom_hem_cm'
  ) THEN
    ALTER TABLE public.curtain_templates 
    ADD COLUMN blind_bottom_hem_cm NUMERIC(10,2) DEFAULT 8;
    
    COMMENT ON COLUMN public.curtain_templates.blind_bottom_hem_cm IS 'Bottom hem allowance in centimeters for fabric calculation';
  END IF;

  -- Add blind_side_hem_cm column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'curtain_templates' 
    AND column_name = 'blind_side_hem_cm'
  ) THEN
    ALTER TABLE public.curtain_templates 
    ADD COLUMN blind_side_hem_cm NUMERIC(10,2) DEFAULT 0;
    
    COMMENT ON COLUMN public.curtain_templates.blind_side_hem_cm IS 'Side hem allowance per side in centimeters for fabric calculation';
  END IF;
END $$;

-- Set appropriate defaults based on treatment category
-- Curtains and Roman Blinds typically need hems, rollers/shutters don't

-- Update curtains to have standard hem values
UPDATE public.curtain_templates 
SET 
  blind_header_hem_cm = COALESCE(blind_header_hem_cm, 8),
  blind_bottom_hem_cm = COALESCE(blind_bottom_hem_cm, 15),
  blind_side_hem_cm = COALESCE(blind_side_hem_cm, 7.5)
WHERE treatment_category = 'curtains'
AND (blind_header_hem_cm IS NULL OR blind_bottom_hem_cm IS NULL OR blind_side_hem_cm IS NULL);

-- Update roman blinds to have standard hem values
UPDATE public.curtain_templates 
SET 
  blind_header_hem_cm = COALESCE(blind_header_hem_cm, 8),
  blind_bottom_hem_cm = COALESCE(blind_bottom_hem_cm, 8),
  blind_side_hem_cm = COALESCE(blind_side_hem_cm, 4)
WHERE treatment_category = 'roman_blinds'
AND (blind_header_hem_cm IS NULL OR blind_bottom_hem_cm IS NULL OR blind_side_hem_cm IS NULL);

-- Roller blinds, shutters, venetian blinds, etc. don't typically need fabric hems
-- Set to 0 for these categories
UPDATE public.curtain_templates 
SET 
  blind_header_hem_cm = 0,
  blind_bottom_hem_cm = 0,
  blind_side_hem_cm = 0
WHERE treatment_category IN ('roller_blinds', 'shutters', 'venetian_blinds', 'vertical_blinds', 'panel_glide', 'cellular_shades')
AND (blind_header_hem_cm IS NULL OR blind_bottom_hem_cm IS NULL OR blind_side_hem_cm IS NULL);