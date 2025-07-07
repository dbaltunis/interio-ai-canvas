-- Create a function to automatically set user_id for heading options
CREATE OR REPLACE FUNCTION public.set_user_id_heading_options()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set user_id on insert
CREATE TRIGGER set_user_id_heading_options_trigger
  BEFORE INSERT ON public.heading_options
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_heading_options();