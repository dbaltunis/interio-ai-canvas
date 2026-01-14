-- Fix: Update trigger to use window_id instead of surface_id
CREATE OR REPLACE FUNCTION public.sync_surface_notes_to_workshop_items()
RETURNS TRIGGER AS $$
BEGIN
  -- When a surface's notes are updated, sync to corresponding workshop_items via window_id
  IF NEW.notes IS DISTINCT FROM OLD.notes THEN
    UPDATE public.workshop_items
    SET notes = NEW.notes,
        updated_at = now()
    WHERE window_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS sync_surface_notes_trigger ON public.surfaces;
CREATE TRIGGER sync_surface_notes_trigger
  AFTER UPDATE OF notes ON public.surfaces
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_surface_notes_to_workshop_items();

-- One-time sync: Copy existing surface notes to workshop_items
UPDATE public.workshop_items wi
SET notes = COALESCE(s.notes, wi.notes),
    updated_at = now()
FROM public.surfaces s
WHERE wi.window_id = s.id
  AND s.notes IS NOT NULL
  AND s.notes != ''
  AND (wi.notes IS NULL OR wi.notes = '' OR wi.notes LIKE 'Auto-generated%');