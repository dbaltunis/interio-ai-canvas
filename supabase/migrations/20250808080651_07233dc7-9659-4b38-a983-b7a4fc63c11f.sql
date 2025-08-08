-- Ensure windows_summary table exists with proper structure and constraints
CREATE TABLE IF NOT EXISTS windows_summary (
  window_id uuid PRIMARY KEY,
  linear_meters numeric,
  widths_required integer,
  price_per_meter numeric,
  fabric_cost numeric,
  lining_type text,
  lining_cost numeric DEFAULT 0,
  manufacturing_type text,
  manufacturing_cost numeric,
  total_cost numeric,
  pricing_type text,
  waste_percent numeric,
  currency text DEFAULT 'GBP',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE windows_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage own window summaries" 
ON windows_summary 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM surfaces s
  JOIN projects p ON s.project_id = p.id
  WHERE s.id = windows_summary.window_id AND p.user_id = auth.uid()
));

-- Add trigger to update timestamp
CREATE OR REPLACE FUNCTION update_windows_summary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER windows_summary_updated_at
  BEFORE UPDATE ON windows_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_windows_summary_timestamp();

-- Clear existing test data
DELETE FROM windows_summary;