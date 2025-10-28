-- Phase 1: Ordering Hub Database Foundation

-- 1.1 Add materials_status to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS materials_status TEXT DEFAULT 'not_processed';

COMMENT ON COLUMN quotes.materials_status IS 'Tracks material ordering status: not_processed, in_queue, ordered, partially_received, received';

-- 1.2 Create material_order_queue table
CREATE TABLE IF NOT EXISTS material_order_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  inventory_item_id UUID REFERENCES enhanced_inventory_items(id),
  material_name TEXT NOT NULL,
  material_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  needed_by_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_batch', 'ordered', 'received', 'cancelled')),
  unit_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_queue_user ON material_order_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_material_queue_supplier ON material_order_queue(supplier_id);
CREATE INDEX IF NOT EXISTS idx_material_queue_status ON material_order_queue(status);
CREATE INDEX IF NOT EXISTS idx_material_queue_quote ON material_order_queue(quote_id);
CREATE INDEX IF NOT EXISTS idx_material_queue_needed_by ON material_order_queue(needed_by_date);

ALTER TABLE material_order_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own material queue"
  ON material_order_queue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_material_queue_updated_at
  BEFORE UPDATE ON material_order_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 1.3 Create batch_orders table
CREATE TABLE IF NOT EXISTS batch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  batch_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent', 'acknowledged', 'in_transit', 'delivered', 'completed', 'cancelled')),
  order_schedule_date DATE,
  total_items INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  sent_date TIMESTAMP WITH TIME ZONE,
  acknowledged_date TIMESTAMP WITH TIME ZONE,
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batch_orders_user ON batch_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_orders_supplier ON batch_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_batch_orders_status ON batch_orders(status);
CREATE INDEX IF NOT EXISTS idx_batch_orders_schedule_date ON batch_orders(order_schedule_date);
CREATE INDEX IF NOT EXISTS idx_batch_orders_batch_number ON batch_orders(batch_number);

ALTER TABLE batch_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own batch orders"
  ON batch_orders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_batch_orders_updated_at
  BEFORE UPDATE ON batch_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 1.4 Create batch_order_items table
CREATE TABLE IF NOT EXISTS batch_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_order_id UUID NOT NULL REFERENCES batch_orders(id) ON DELETE CASCADE,
  material_queue_id UUID NOT NULL REFERENCES material_order_queue(id),
  quote_id UUID REFERENCES quotes(id),
  project_id UUID REFERENCES projects(id),
  client_name TEXT,
  material_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  received_quantity NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batch_order_items_batch ON batch_order_items(batch_order_id);
CREATE INDEX IF NOT EXISTS idx_batch_order_items_queue ON batch_order_items(material_queue_id);
CREATE INDEX IF NOT EXISTS idx_batch_order_items_quote ON batch_order_items(quote_id);

ALTER TABLE batch_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view batch order items"
  ON batch_order_items FOR SELECT
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert batch order items"
  ON batch_order_items FOR INSERT
  WITH CHECK (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update batch order items"
  ON batch_order_items FOR UPDATE
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete batch order items"
  ON batch_order_items FOR DELETE
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

-- 1.5 Create order_tracking_history table
CREATE TABLE IF NOT EXISTS order_tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_order_id UUID NOT NULL REFERENCES batch_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  location TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_batch ON order_tracking_history(batch_order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created ON order_tracking_history(created_at DESC);

ALTER TABLE order_tracking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order tracking history"
  ON order_tracking_history FOR SELECT
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tracking history"
  ON order_tracking_history FOR INSERT
  WITH CHECK (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

-- 1.6 Create supplier_lead_times table (for AI learning)
CREATE TABLE IF NOT EXISTS supplier_lead_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  material_type TEXT NOT NULL,
  order_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  lead_time_days INTEGER GENERATED ALWAYS AS (delivery_date - order_date) STORED,
  order_complexity TEXT CHECK (order_complexity IN ('simple', 'medium', 'complex')),
  batch_order_id UUID REFERENCES batch_orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_lead_times_user ON supplier_lead_times(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_lead_times_supplier ON supplier_lead_times(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_lead_times_material_type ON supplier_lead_times(material_type);

ALTER TABLE supplier_lead_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage supplier lead times"
  ON supplier_lead_times FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.7 Create order_schedule_settings table
CREATE TABLE IF NOT EXISTS order_schedule_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  schedule_days TEXT[] DEFAULT ARRAY['wednesday', 'friday'],
  auto_create_batches BOOLEAN DEFAULT false,
  lead_time_days INTEGER DEFAULT 7,
  auto_assign_suppliers BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE order_schedule_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own schedule settings"
  ON order_schedule_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_order_schedule_settings_updated_at
  BEFORE UPDATE ON order_schedule_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate batch numbers
CREATE OR REPLACE FUNCTION generate_batch_number(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_str TEXT;
  count INTEGER;
  batch_num TEXT;
BEGIN
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COUNT(*) INTO count
  FROM batch_orders
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  batch_num := 'BO-' || year_str || '-' || LPAD((count + 1)::TEXT, 4, '0');
  
  RETURN batch_num;
END;
$$;