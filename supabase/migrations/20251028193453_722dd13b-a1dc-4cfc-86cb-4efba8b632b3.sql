-- Phase 4.3: Create supplier_performance_metrics table
CREATE TABLE supplier_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  material_type TEXT,
  average_lead_time_days INTEGER NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  on_time_percentage NUMERIC(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE supplier_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view supplier metrics for their suppliers"
  ON supplier_performance_metrics FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage metrics for their suppliers"
  ON supplier_performance_metrics FOR ALL
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- Create unique index to prevent duplicate metrics
CREATE UNIQUE INDEX idx_supplier_metrics_unique 
  ON supplier_performance_metrics(supplier_id, COALESCE(material_type, ''));

-- Comments
COMMENT ON TABLE supplier_performance_metrics IS 'Historical performance data for suppliers';
COMMENT ON COLUMN supplier_performance_metrics.average_lead_time_days IS 'Average days from order to delivery';
COMMENT ON COLUMN supplier_performance_metrics.on_time_percentage IS 'Percentage of orders delivered on time';