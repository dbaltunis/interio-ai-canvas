
-- Create a flexible product categories table with hierarchy support
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.inventory_categories(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL DEFAULT 'product', -- 'product', 'fabric', 'hardware', 'wallpaper', etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Shopify integration fields
  shopify_category_id TEXT,
  shopify_handle TEXT,
  sync_with_shopify BOOLEAN DEFAULT false,
  last_shopify_sync TIMESTAMP WITH TIME ZONE,
  
  -- Category-specific settings
  requires_dimensions BOOLEAN DEFAULT false,
  requires_fabric_specs BOOLEAN DEFAULT false,
  requires_material_info BOOLEAN DEFAULT false,
  default_unit TEXT DEFAULT 'each',
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique slug per user
  UNIQUE(user_id, slug),
  -- Prevent self-referencing
  CHECK (id != parent_id)
);

-- Create Shopify integration settings table
CREATE TABLE IF NOT EXISTS public.shopify_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token TEXT NOT NULL,
  webhook_secret TEXT,
  auto_sync_enabled BOOLEAN DEFAULT false,
  sync_inventory BOOLEAN DEFAULT true,
  sync_prices BOOLEAN DEFAULT true,
  sync_images BOOLEAN DEFAULT true,
  last_full_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'error'
  sync_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create product sync tracking table
CREATE TABLE IF NOT EXISTS public.product_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  hardware_id UUID REFERENCES public.hardware_inventory(id) ON DELETE CASCADE,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'error', 'conflict'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_direction TEXT DEFAULT 'both', -- 'to_shopify', 'from_shopify', 'both'
  error_message TEXT,
  shopify_data JSONB DEFAULT '{}',
  local_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update inventory table to use new category system
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT,
ADD COLUMN IF NOT EXISTS sync_with_shopify BOOLEAN DEFAULT false;

-- Update hardware_inventory table to use new category system
ALTER TABLE public.hardware_inventory 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT,
ADD COLUMN IF NOT EXISTS sync_with_shopify BOOLEAN DEFAULT false;

-- Add RLS policies
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own inventory categories" ON public.inventory_categories
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.shopify_integration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own Shopify integration" ON public.shopify_integration
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.product_sync_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own product sync status" ON public.product_sync_status
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON public.inventory_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopify_integration_updated_at BEFORE UPDATE ON public.shopify_integration
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sync_status_updated_at BEFORE UPDATE ON public.product_sync_status
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent_id ON public.inventory_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_type ON public.inventory_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_user_type ON public.inventory_categories(user_id, category_type);
CREATE INDEX IF NOT EXISTS idx_inventory_category_id ON public.inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_hardware_inventory_category_id ON public.hardware_inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_product_sync_inventory_id ON public.product_sync_status(inventory_id);
CREATE INDEX IF NOT EXISTS idx_product_sync_hardware_id ON public.product_sync_status(hardware_id);
CREATE INDEX IF NOT EXISTS idx_product_sync_shopify_id ON public.product_sync_status(shopify_product_id);

-- Insert default categories for existing users (if any)
INSERT INTO public.inventory_categories (user_id, name, slug, category_type, description, default_unit)
SELECT DISTINCT user_id, 'Fabrics', 'fabrics', 'fabric', 'Fabric and textile products', 'yard'
FROM public.inventory
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory_categories 
  WHERE inventory_categories.user_id = inventory.user_id 
  AND inventory_categories.slug = 'fabrics'
);

INSERT INTO public.inventory_categories (user_id, name, slug, category_type, description, default_unit)
SELECT DISTINCT user_id, 'Hardware', 'hardware', 'hardware', 'Hardware and accessories', 'each'
FROM public.hardware_inventory
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory_categories 
  WHERE inventory_categories.user_id = hardware_inventory.user_id 
  AND inventory_categories.slug = 'hardware'
);
