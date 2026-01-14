-- Create trigger to sync notes from surfaces to workshop_items
CREATE OR REPLACE FUNCTION public.sync_surface_notes_to_workshop_items()
RETURNS TRIGGER AS $$
BEGIN
  -- When a surface's notes are updated, sync to corresponding workshop_items
  IF NEW.notes IS DISTINCT FROM OLD.notes THEN
    UPDATE public.workshop_items
    SET notes = NEW.notes,
        updated_at = now()
    WHERE surface_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on surfaces table
DROP TRIGGER IF EXISTS sync_surface_notes_trigger ON public.surfaces;
CREATE TRIGGER sync_surface_notes_trigger
  AFTER UPDATE OF notes ON public.surfaces
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_surface_notes_to_workshop_items();