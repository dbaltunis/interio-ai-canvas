
-- Add the missing columns to the fabrics table
ALTER TABLE public.fabrics 
ADD COLUMN IF NOT EXISTS vertical_repeat numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS horizontal_repeat numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS roll_direction text DEFAULT 'auto' CHECK (roll_direction IN ('auto', 'vertical', 'horizontal'));

-- Update any existing fabrics to have default values
UPDATE public.fabrics 
SET 
  vertical_repeat = COALESCE(pattern_repeat, 0),
  horizontal_repeat = 0,
  roll_direction = 'auto'
WHERE vertical_repeat IS NULL OR horizontal_repeat IS NULL OR roll_direction IS NULL;
