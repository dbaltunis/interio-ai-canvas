-- Fix security warnings for pricing grid trigger functions

DROP FUNCTION IF EXISTS update_pricing_grids_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_pricing_grids_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_pricing_grid_rules_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_pricing_grid_rules_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the triggers since we used CASCADE
CREATE TRIGGER pricing_grids_updated_at
  BEFORE UPDATE ON pricing_grids
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_grids_updated_at();

CREATE TRIGGER pricing_grid_rules_updated_at
  BEFORE UPDATE ON pricing_grid_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_grid_rules_updated_at();