-- Phase 1: Database Schema Changes for Grid-Based Blind Pricing

-- 1.1: Add price_group to enhanced_inventory_items (fabrics)
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS price_group TEXT CHECK (price_group IN ('A', 'B', 'C', 'D', 'E', 'Premium', 'Standard', 'Budget'));

COMMENT ON COLUMN enhanced_inventory_items.price_group IS 
'Fabric price grouping (A/B/C/D) used for grid routing. All fabrics in same group use same pricing grid.';

-- 1.2: Add system_type to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS system_type TEXT;

COMMENT ON COLUMN curtain_templates.system_type IS 
'System variant: open, cassette, heavy_duty, perfect_fit, etc. Used with price_group for grid routing.';

-- 1.3: Create pricing_grids table
CREATE TABLE IF NOT EXISTS pricing_grids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Grid identification
  grid_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Grid data (width/drop matrix)
  grid_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Versioning (for tracking price changes)
  version INTEGER DEFAULT 1,
  replaced_by_grid_id UUID REFERENCES pricing_grids(id) ON DELETE SET NULL,
  
  CONSTRAINT unique_active_grid UNIQUE(user_id, grid_code, active)
);

COMMENT ON TABLE pricing_grids IS 
'Stores pricing grid matrices for window blinds. Each grid contains width/drop price matrix.';

-- Enable RLS on pricing_grids
ALTER TABLE pricing_grids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pricing grids"
  ON pricing_grids
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.4: Create pricing_grid_rules table
CREATE TABLE IF NOT EXISTS pricing_grid_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rule conditions
  product_type TEXT NOT NULL,
  system_type TEXT,
  price_group TEXT NOT NULL,
  
  -- Optional additional conditions (for advanced routing)
  option_conditions JSONB,
  
  -- Target grid
  grid_id UUID NOT NULL REFERENCES pricing_grids(id) ON DELETE CASCADE,
  
  -- Priority for conflict resolution (higher = checked first)
  priority INTEGER DEFAULT 100,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_active_rule UNIQUE(user_id, product_type, system_type, price_group, active)
);

COMMENT ON TABLE pricing_grid_rules IS 
'Routes product + system + price_group combinations to specific pricing grids.';

-- Enable RLS on pricing_grid_rules
ALTER TABLE pricing_grid_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own grid rules"
  ON pricing_grid_rules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_grids_user_code ON pricing_grids(user_id, grid_code) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_pricing_grid_rules_lookup ON pricing_grid_rules(user_id, product_type, system_type, price_group) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_pricing_grid_rules_priority ON pricing_grid_rules(user_id, priority DESC) WHERE active = true;

-- Create updated_at trigger for pricing_grids
CREATE OR REPLACE FUNCTION update_pricing_grids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_grids_updated_at
  BEFORE UPDATE ON pricing_grids
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_grids_updated_at();

-- Create updated_at trigger for pricing_grid_rules
CREATE OR REPLACE FUNCTION update_pricing_grid_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_grid_rules_updated_at
  BEFORE UPDATE ON pricing_grid_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_grid_rules_updated_at();