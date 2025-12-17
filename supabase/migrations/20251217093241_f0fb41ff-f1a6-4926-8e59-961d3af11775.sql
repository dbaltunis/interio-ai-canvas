-- First, fix the broken trigger that uses wrong ON CONFLICT
CREATE OR REPLACE FUNCTION public.initialize_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, NEW.role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;