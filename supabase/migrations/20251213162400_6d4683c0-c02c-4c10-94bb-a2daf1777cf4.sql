-- Fix existing TWC options: Set source column to 'twc' for options that match TWC-style patterns
UPDATE treatment_options
SET source = 'twc'
WHERE (source IS NULL OR source = 'manual')
AND (
  key ILIKE '%colour%'
  OR key ILIKE '%control_type%'
  OR key ILIKE '%bottom_bar%'
  OR key ILIKE '%fascia%'
  OR key ILIKE '%motor%'
  OR key ILIKE '%chain%'
  OR key ILIKE '%wand%'
  OR key ILIKE '%cord%'
  OR key ILIKE '%valance%'
  OR key ILIKE '%headrail%'
  OR key ILIKE '%cassette%'
  OR key ILIKE '%bracket%'
  OR key ILIKE '%fabric%'
  OR key ILIKE '%control_side%'
  OR key ILIKE '%roll_direction%'
);

-- Set source to 'manual' for remaining NULL sources
UPDATE treatment_options
SET source = 'manual'
WHERE source IS NULL;