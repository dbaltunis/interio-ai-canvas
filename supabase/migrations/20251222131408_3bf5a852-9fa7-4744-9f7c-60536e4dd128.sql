-- Create the update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add bundle_rules table for hardware bundles
CREATE TABLE IF NOT EXISTS public.bundle_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_item_id UUID REFERENCES public.enhanced_inventory_items(id) ON DELETE CASCADE,
  parent_item_key TEXT, -- Alternative to parent_item_id, e.g., 'track', 'rod'
  child_item_key TEXT NOT NULL, -- 'runners', 'brackets', 'end_caps', etc.
  child_item_id UUID REFERENCES public.enhanced_inventory_items(id) ON DELETE SET NULL,
  child_unit_price DECIMAL(10,2),
  qty_formula TEXT NOT NULL, -- 'width_ft * 6', 'CEILING(width_ft / 5)', '1'
  condition JSONB, -- {"mount_type": "ceiling"} or {"is_double": true}
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bundle_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for bundle_rules
CREATE POLICY "Users can view their own bundle rules"
  ON public.bundle_rules FOR SELECT
  USING (user_id = auth.uid() OR user_id = public.get_account_owner(auth.uid()));

CREATE POLICY "Users can insert their own bundle rules"
  ON public.bundle_rules FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = public.get_account_owner(auth.uid()));

CREATE POLICY "Users can update their own bundle rules"
  ON public.bundle_rules FOR UPDATE
  USING (user_id = auth.uid() OR user_id = public.get_account_owner(auth.uid()));

CREATE POLICY "Users can delete their own bundle rules"
  ON public.bundle_rules FOR DELETE
  USING (user_id = auth.uid() OR user_id = public.get_account_owner(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_bundle_rules_updated_at
  BEFORE UPDATE ON public.bundle_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add applies_to_headings to treatment_options for heading-based pricing
ALTER TABLE public.treatment_options
  ADD COLUMN IF NOT EXISTS applies_to_headings JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON TABLE public.bundle_rules IS 'Hardware bundle rules for auto-calculating accessories (runners, brackets, etc.)';
COMMENT ON COLUMN public.bundle_rules.qty_formula IS 'Formula using width_ft, height_ft, is_double, mount_type variables';
COMMENT ON COLUMN public.bundle_rules.condition IS 'JSON conditions that must match for rule to apply';
COMMENT ON COLUMN public.treatment_options.applies_to_headings IS 'Array of heading types this option applies to';
COMMENT ON COLUMN public.treatment_options.pricing_rules IS 'Additional pricing rules like height multipliers, minimums';