-- Create organizations table
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- Create inventory items table - single table for all stock and services
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fabric','lining','interlining','track','pole','bracket','tape','hook','service','other')),
  sku TEXT,
  name TEXT NOT NULL,
  attributes JSONB DEFAULT '{}'::jsonb,   -- eg {"width_mm":1400,"repeat_mm":64,"colour":"ivory"}
  uom TEXT DEFAULT 'each',
  price NUMERIC,                          -- base sell price per uom
  cost NUMERIC,                           -- base cost per uom
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create product templates table
CREATE TABLE public.product_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  treatment_key TEXT NOT NULL,  -- 'curtain','roman','roller', etc
  name TEXT NOT NULL,           -- 'lined pinch pleat curtain'
  visual_key TEXT NOT NULL,     -- refers to a visual template
  default_mode TEXT DEFAULT 'quick' CHECK (default_mode IN ('quick', 'pro')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;

-- Create measurement fields table
CREATE TABLE public.measurement_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  key TEXT NOT NULL,            -- 'rail_width','drop','ceiling_to_floor','return_to_wall'
  label TEXT NOT NULL,
  unit TEXT DEFAULT 'mm',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.measurement_fields ENABLE ROW LEVEL SECURITY;

-- Create template options table
CREATE TABLE public.template_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.product_templates(id) ON DELETE CASCADE,
  key TEXT NOT NULL,            -- 'heading','panel_setup','fix_type'
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('select','number','boolean','text')),
  unit TEXT,
  min_value NUMERIC,
  max_value NUMERIC,
  step_value NUMERIC,
  required BOOLEAN DEFAULT false,
  default_value JSONB,
  show_if JSONB,                -- json logic to control visibility
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.template_options ENABLE ROW LEVEL SECURITY;

-- Create template option values table
CREATE TABLE public.template_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES public.template_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  price_delta_rule JSONB,       -- eg {"per_panel":12.5} or {"formula":"0.1 * fabric_m"}
  show_if JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.template_option_values ENABLE ROW LEVEL SECURITY;

-- Create template measurements junction table
CREATE TABLE public.template_measurements (
  template_id UUID NOT NULL REFERENCES public.product_templates(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.measurement_fields(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT false,
  show_if JSONB,
  PRIMARY KEY(template_id, field_id)
);

-- Enable RLS
ALTER TABLE public.template_measurements ENABLE ROW LEVEL SECURITY;

-- Create window types table
CREATE TABLE public.window_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  key TEXT NOT NULL,            -- 'standard','bay3','balcony_door','terrace_doors'
  name TEXT NOT NULL,
  visual_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.window_types ENABLE ROW LEVEL SECURITY;

-- Create window type measurements junction table
CREATE TABLE public.window_type_measurements (
  window_type_id UUID NOT NULL REFERENCES public.window_types(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.measurement_fields(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT false,
  PRIMARY KEY(window_type_id, field_id)
);

-- Enable RLS
ALTER TABLE public.window_type_measurements ENABLE ROW LEVEL SECURITY;

-- Create visual templates table
CREATE TABLE public.visual_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  template JSONB NOT NULL,      -- svg parts and anchor ids
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visual_templates ENABLE ROW LEVEL SECURITY;

-- Create assemblies table
CREATE TABLE public.assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.product_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assemblies ENABLE ROW LEVEL SECURITY;

-- Create assembly lines table
CREATE TABLE public.assembly_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id UUID NOT NULL REFERENCES public.assemblies(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  role TEXT,                    -- 'fabric','lining','tape','hook','labour','install'
  qty_formula TEXT NOT NULL,    -- safe js expression using context (mm). returns quantity in item's uom
  wastage_pct NUMERIC DEFAULT 0,
  price_mode TEXT DEFAULT 'sell' CHECK (price_mode IN ('sell', 'cost')),
  show_if JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assembly_lines ENABLE ROW LEVEL SECURITY;

-- Create pricing rules table
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.product_templates(id) ON DELETE CASCADE,
  rule JSONB NOT NULL,          -- ladder tables or formulas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Create jobs table
CREATE TABLE public.measurement_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  client_id UUID,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.measurement_jobs ENABLE ROW LEVEL SECURITY;

-- Create job windows table
CREATE TABLE public.job_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.measurement_jobs(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.product_templates(id),
  window_type_id UUID REFERENCES public.window_types(id),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,   -- all selections and measurements
  bom JSONB,
  price_breakdown JSONB,
  price_total NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_windows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for org-based access
-- Note: These policies assume org_id is stored in JWT token

-- Orgs policies
CREATE POLICY "Users can view their org" ON public.orgs FOR SELECT USING (id::text = (auth.jwt() ->> 'org_id'));
CREATE POLICY "Users can update their org" ON public.orgs FOR UPDATE USING (id::text = (auth.jwt() ->> 'org_id'));

-- Inventory items policies
CREATE POLICY "Users can manage org inventory items" ON public.inventory_items FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Product templates policies
CREATE POLICY "Users can manage org product templates" ON public.product_templates FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Measurement fields policies
CREATE POLICY "Users can manage org measurement fields" ON public.measurement_fields FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Template options policies
CREATE POLICY "Users can manage org template options" ON public.template_options FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Template option values policies
CREATE POLICY "Users can manage template option values" ON public.template_option_values FOR ALL USING (
  option_id IN (
    SELECT id FROM public.template_options WHERE org_id::text = (auth.jwt() ->> 'org_id')
  )
);

-- Template measurements policies
CREATE POLICY "Users can manage template measurements" ON public.template_measurements FOR ALL USING (
  template_id IN (
    SELECT id FROM public.product_templates WHERE org_id::text = (auth.jwt() ->> 'org_id')
  )
);

-- Window types policies
CREATE POLICY "Users can manage org window types" ON public.window_types FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Window type measurements policies
CREATE POLICY "Users can manage window type measurements" ON public.window_type_measurements FOR ALL USING (
  window_type_id IN (
    SELECT id FROM public.window_types WHERE org_id::text = (auth.jwt() ->> 'org_id')
  )
);

-- Visual templates policies
CREATE POLICY "Users can manage org visual templates" ON public.visual_templates FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Assemblies policies
CREATE POLICY "Users can manage org assemblies" ON public.assemblies FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Assembly lines policies
CREATE POLICY "Users can manage assembly lines" ON public.assembly_lines FOR ALL USING (
  assembly_id IN (
    SELECT id FROM public.assemblies WHERE org_id::text = (auth.jwt() ->> 'org_id')
  )
);

-- Pricing rules policies
CREATE POLICY "Users can manage org pricing rules" ON public.pricing_rules FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Jobs policies
CREATE POLICY "Users can manage org jobs" ON public.measurement_jobs FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Job windows policies
CREATE POLICY "Users can manage org job windows" ON public.job_windows FOR ALL USING (org_id::text = (auth.jwt() ->> 'org_id'));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON public.orgs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_templates_updated_at BEFORE UPDATE ON public.product_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_measurement_fields_updated_at BEFORE UPDATE ON public.measurement_fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_template_options_updated_at BEFORE UPDATE ON public.template_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_template_option_values_updated_at BEFORE UPDATE ON public.template_option_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_window_types_updated_at BEFORE UPDATE ON public.window_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visual_templates_updated_at BEFORE UPDATE ON public.visual_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assemblies_updated_at BEFORE UPDATE ON public.assemblies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assembly_lines_updated_at BEFORE UPDATE ON public.assembly_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_measurement_jobs_updated_at BEFORE UPDATE ON public.measurement_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_windows_updated_at BEFORE UPDATE ON public.job_windows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();