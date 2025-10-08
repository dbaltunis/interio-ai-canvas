-- Create enums
DO $$ BEGIN
  CREATE TYPE treatment_category AS ENUM ('blinds', 'curtains', 'shutters', 'shades', 'awnings', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE unit_system AS ENUM ('mm', 'inch');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE option_input_type AS ENUM ('select', 'number', 'boolean', 'text', 'multiselect');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE modifier_method AS ENUM ('add', 'multiply', 'override');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE price_list_status AS ENUM ('draft', 'ready', 'live', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create treatment templates table (master catalog)
CREATE TABLE IF NOT EXISTS treatment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category treatment_category NOT NULL,
  unit_system unit_system DEFAULT 'mm',
  mount_types TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create treatment_options
CREATE TABLE IF NOT EXISTS treatment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES treatment_templates(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  input_type option_input_type NOT NULL,
  required BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  validation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, key)
);

-- Create option_values
CREATE TABLE IF NOT EXISTS option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES treatment_options(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  extra_data JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(option_id, code)
);

-- Create option_rules
CREATE TABLE IF NOT EXISTS option_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES treatment_templates(id) ON DELETE CASCADE NOT NULL,
  condition JSONB NOT NULL,
  effect JSONB NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create retailer_price_lists
CREATE TABLE IF NOT EXISTS retailer_price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES treatment_templates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'AUD',
  tax_inclusive BOOLEAN DEFAULT true,
  region TEXT DEFAULT 'AU',
  valid_from DATE,
  valid_to DATE,
  status price_list_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create price_rows
CREATE TABLE IF NOT EXISTS price_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID REFERENCES retailer_price_lists(id) ON DELETE CASCADE NOT NULL,
  band_w_min NUMERIC NOT NULL,
  band_w_max NUMERIC NOT NULL,
  band_d_min NUMERIC NOT NULL,
  band_d_max NUMERIC NOT NULL,
  base_price NUMERIC NOT NULL,
  price_per_m2 NUMERIC,
  add_on_code TEXT,
  add_on_price NUMERIC,
  sku TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create price_modifiers
CREATE TABLE IF NOT EXISTS price_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID REFERENCES retailer_price_lists(id) ON DELETE CASCADE NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('option', 'option_value')),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  method modifier_method NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(price_list_id, code)
);

-- Create account_overrides
CREATE TABLE IF NOT EXISTS account_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) NOT NULL,
  option_id UUID REFERENCES treatment_options(id) ON DELETE CASCADE,
  option_value_id UUID REFERENCES option_values(id) ON DELETE CASCADE,
  visible BOOLEAN,
  required BOOLEAN,
  default_value TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (option_id IS NOT NULL OR option_value_id IS NOT NULL)
);

-- Create custom_options
CREATE TABLE IF NOT EXISTS custom_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES treatment_templates(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  input_type option_input_type NOT NULL,
  validation JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, template_id, key)
);

-- Create media_files
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('diagram', 'swatch', 'thumbnail')),
  url TEXT NOT NULL,
  mime TEXT,
  ref_template_id UUID REFERENCES treatment_templates(id) ON DELETE CASCADE,
  ref_option_id UUID REFERENCES treatment_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE treatment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only create if they don't exist)
DO $$ BEGIN
  CREATE POLICY "Anyone can view active treatment templates" ON treatment_templates
    FOR SELECT USING (active = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage treatment templates" ON treatment_templates
    FOR ALL USING (is_admin_or_owner());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Continue with other policies...
DO $$ BEGIN
  CREATE POLICY "Anyone can view treatment options" ON treatment_options
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage treatment options" ON treatment_options
    FOR ALL USING (is_admin_or_owner());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view option values" ON option_values
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage option values" ON option_values
    FOR ALL USING (is_admin_or_owner());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view option rules" ON option_rules
    FOR SELECT USING (active = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage option rules" ON option_rules
    FOR ALL USING (is_admin_or_owner());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own price lists" ON retailer_price_lists
    FOR SELECT USING (
      retailer_id = auth.uid() OR 
      get_account_owner(auth.uid()) = get_account_owner(retailer_id)
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own price lists" ON retailer_price_lists
    FOR ALL USING (
      retailer_id = auth.uid() OR 
      get_account_owner(auth.uid()) = retailer_id
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view price rows from their lists" ON price_rows
    FOR SELECT USING (
      price_list_id IN (
        SELECT id FROM retailer_price_lists 
        WHERE retailer_id = auth.uid() OR get_account_owner(auth.uid()) = get_account_owner(retailer_id)
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage price rows from their lists" ON price_rows
    FOR ALL USING (
      price_list_id IN (
        SELECT id FROM retailer_price_lists 
        WHERE retailer_id = auth.uid() OR get_account_owner(auth.uid()) = retailer_id
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view modifiers from their lists" ON price_modifiers
    FOR SELECT USING (
      price_list_id IN (
        SELECT id FROM retailer_price_lists 
        WHERE retailer_id = auth.uid() OR get_account_owner(auth.uid()) = get_account_owner(retailer_id)
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage modifiers from their lists" ON price_modifiers
    FOR ALL USING (
      price_list_id IN (
        SELECT id FROM retailer_price_lists 
        WHERE retailer_id = auth.uid() OR get_account_owner(auth.uid()) = retailer_id
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their overrides" ON account_overrides
    FOR ALL USING (
      account_id = auth.uid() OR 
      get_account_owner(auth.uid()) = account_id
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their custom options" ON custom_options
    FOR ALL USING (
      account_id = auth.uid() OR 
      get_account_owner(auth.uid()) = account_id
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their media files" ON media_files
    FOR ALL USING (
      account_id = auth.uid() OR 
      get_account_owner(auth.uid()) = account_id
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Triggers
DROP TRIGGER IF EXISTS update_treatment_templates_updated_at ON treatment_templates;
CREATE TRIGGER update_treatment_templates_updated_at BEFORE UPDATE ON treatment_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_options_updated_at ON treatment_options;
CREATE TRIGGER update_treatment_options_updated_at BEFORE UPDATE ON treatment_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_option_rules_updated_at ON option_rules;
CREATE TRIGGER update_option_rules_updated_at BEFORE UPDATE ON option_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retailer_price_lists_updated_at ON retailer_price_lists;
CREATE TRIGGER update_retailer_price_lists_updated_at BEFORE UPDATE ON retailer_price_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_overrides_updated_at ON account_overrides;
CREATE TRIGGER update_account_overrides_updated_at BEFORE UPDATE ON account_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_options_updated_at ON custom_options;
CREATE TRIGGER update_custom_options_updated_at BEFORE UPDATE ON custom_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();