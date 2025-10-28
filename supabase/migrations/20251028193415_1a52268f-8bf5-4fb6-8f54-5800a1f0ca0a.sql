-- Phase 4.2: Create order_milestones table
CREATE TABLE order_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_order_id UUID NOT NULL REFERENCES batch_orders(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  target_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their order milestones"
  ON order_milestones FOR SELECT
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create milestones for their orders"
  ON order_milestones FOR INSERT
  WITH CHECK (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their order milestones"
  ON order_milestones FOR UPDATE
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their order milestones"
  ON order_milestones FOR DELETE
  USING (
    batch_order_id IN (
      SELECT id FROM batch_orders WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX idx_order_milestones_batch_order ON order_milestones(batch_order_id);

-- Comments
COMMENT ON TABLE order_milestones IS 'Timeline milestones for batch orders';
COMMENT ON COLUMN order_milestones.target_date IS 'Expected date for this milestone';
COMMENT ON COLUMN order_milestones.completed_at IS 'When milestone was actually completed';