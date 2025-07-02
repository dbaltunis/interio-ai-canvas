-- Add a trigger to automatically set user_id for making_costs table
CREATE OR REPLACE FUNCTION public.set_user_id_making_costs()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id on insert
DROP TRIGGER IF EXISTS set_user_id_making_costs_trigger ON public.making_costs;
CREATE TRIGGER set_user_id_making_costs_trigger
  BEFORE INSERT ON public.making_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_making_costs();