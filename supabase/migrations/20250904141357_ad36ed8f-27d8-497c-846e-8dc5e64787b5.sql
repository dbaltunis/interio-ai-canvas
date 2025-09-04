-- Remove foreign key constraint and add unique constraint, then insert data
-- First remove the foreign key constraint
ALTER TABLE public.window_types DROP CONSTRAINT IF EXISTS window_types_org_id_fkey;

-- Add unique constraint for org_id, key combination
ALTER TABLE public.window_types ADD CONSTRAINT window_types_org_id_key_unique UNIQUE (org_id, key);

-- Insert window types directly using the user ID
INSERT INTO public.window_types (org_id, key, name, visual_key)
VALUES 
    ('ec930f73-ef23-4430-921f-1b401859825d'::uuid, 'standard', 'Standard Window', 'standard'),
    ('ec930f73-ef23-4430-921f-1b401859825d'::uuid, 'bay', 'Bay Window', 'bay'),
    ('ec930f73-ef23-4430-921f-1b401859825d'::uuid, 'french_doors', 'French Doors', 'french_doors'),
    ('ec930f73-ef23-4430-921f-1b401859825d'::uuid, 'sliding_doors', 'Sliding Doors', 'sliding_doors')
ON CONFLICT (org_id, key) DO UPDATE SET
    name = EXCLUDED.name,
    visual_key = EXCLUDED.visual_key;