-- Phase 4.1: Extend batch_orders table for timeline tracking
ALTER TABLE batch_orders
ADD COLUMN project_id UUID REFERENCES projects(id),
ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN expected_completion_days INTEGER,
ADD COLUMN ai_predicted_days INTEGER,
ADD COLUMN ai_confidence TEXT CHECK (ai_confidence IN ('low', 'medium', 'high')),
ADD COLUMN progress_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN estimated_completion_date DATE;

-- Create index for project linking
CREATE INDEX idx_batch_orders_project_id ON batch_orders(project_id);

-- Comments for clarity
COMMENT ON COLUMN batch_orders.project_id IS 'Links order to a specific project for timeline tracking';
COMMENT ON COLUMN batch_orders.locked_at IS 'When order was sent and locked (prevents editing)';
COMMENT ON COLUMN batch_orders.expected_completion_days IS 'Expected days until completion (AI or manual)';
COMMENT ON COLUMN batch_orders.ai_predicted_days IS 'AI predicted completion days (for reference)';
COMMENT ON COLUMN batch_orders.ai_confidence IS 'AI prediction confidence level';
COMMENT ON COLUMN batch_orders.progress_start_date IS 'When progress tracking started';
COMMENT ON COLUMN batch_orders.estimated_completion_date IS 'Calculated estimated completion date';