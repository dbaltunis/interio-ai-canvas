-- Create a function to set user_id to current auth user
CREATE OR REPLACE FUNCTION public.set_user_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set user_id if not explicitly provided
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers to automatically set user_id for all relevant tables
DROP TRIGGER IF EXISTS set_rooms_user_id ON public.rooms;
CREATE TRIGGER set_rooms_user_id
  BEFORE INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_insert();

DROP TRIGGER IF EXISTS set_surfaces_user_id ON public.surfaces;
CREATE TRIGGER set_surfaces_user_id
  BEFORE INSERT ON public.surfaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_insert();

DROP TRIGGER IF EXISTS set_treatments_user_id ON public.treatments;
CREATE TRIGGER set_treatments_user_id
  BEFORE INSERT ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_insert();

DROP TRIGGER IF EXISTS set_manual_quote_items_user_id ON public.manual_quote_items;
CREATE TRIGGER set_manual_quote_items_user_id
  BEFORE INSERT ON public.manual_quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_insert();