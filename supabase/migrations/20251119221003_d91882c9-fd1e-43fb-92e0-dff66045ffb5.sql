-- Create function to seed default window types (Standard Window and Wall only)
CREATE OR REPLACE FUNCTION public.seed_default_window_types(account_owner_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
BEGIN
  -- Insert only Standard Window and Wall
  INSERT INTO public.window_types (org_id, key, name, visual_key)
  VALUES 
    (account_owner_id, 'standard', 'Standard Window', 'standard'),
    (account_owner_id, 'room_wall', 'Wall', 'room_wall')
  ON CONFLICT (org_id, key) DO NOTHING;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  RAISE LOG 'Seeded % window types for account %', inserted_count, account_owner_id;
  
  RETURN inserted_count;
END;
$$;