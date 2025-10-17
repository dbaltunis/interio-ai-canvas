-- Add feature flags and inventory configuration to business_settings
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{
  "inventory_management": false,
  "auto_extract_materials": false,
  "leftover_tracking": false,
  "order_batching": false,
  "multi_location_inventory": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS inventory_config JSONB DEFAULT '{
  "track_leftovers": true,
  "waste_buffer_percentage": 5,
  "auto_reorder_enabled": false,
  "reorder_threshold_percentage": 20,
  "default_location": "main_warehouse"
}'::jsonb;

-- Create product_orders table if not exists
CREATE TABLE IF NOT EXISTS product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  supplier_name TEXT,
  supplier_email TEXT,
  order_date TIMESTAMP WITH TIME ZONE,
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_order_items table
CREATE TABLE IF NOT EXISTS product_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drop existing policies if they exist (after tables are created)
DROP POLICY IF EXISTS "Users can view their own product orders" ON product_orders;
DROP POLICY IF EXISTS "Users can create their own product orders" ON product_orders;
DROP POLICY IF EXISTS "Users can update their own product orders" ON product_orders;
DROP POLICY IF EXISTS "Users can delete their own product orders" ON product_orders;
DROP POLICY IF EXISTS "Users can view product order items" ON product_order_items;
DROP POLICY IF EXISTS "Users can manage product order items" ON product_order_items;

-- Enable RLS
ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_orders
CREATE POLICY "Users can view their own product orders"
  ON product_orders FOR SELECT
  USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create their own product orders"
  ON product_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product orders"
  ON product_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product orders"
  ON product_orders FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for product_order_items
CREATE POLICY "Users can view product order items"
  ON product_order_items FOR SELECT
  USING (order_id IN (
    SELECT id FROM product_orders 
    WHERE get_account_owner(auth.uid()) = get_account_owner(user_id)
  ));

CREATE POLICY "Users can manage product order items"
  ON product_order_items FOR ALL
  USING (order_id IN (
    SELECT id FROM product_orders WHERE user_id = auth.uid()
  ));

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_product_orders_updated_at ON product_orders;
DROP TRIGGER IF EXISTS update_product_order_items_updated_at ON product_order_items;

-- Create triggers for updated_at
CREATE TRIGGER update_product_orders_updated_at
  BEFORE UPDATE ON product_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_order_items_updated_at
  BEFORE UPDATE ON product_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();