
-- Add funnel stage and measurement tracking to clients table
ALTER TABLE clients 
ADD COLUMN funnel_stage TEXT DEFAULT 'lead',
ADD COLUMN last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create client measurements table for storing measurement history
CREATE TABLE client_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  measurement_type TEXT NOT NULL DEFAULT 'standard_window',
  measurements JSONB NOT NULL DEFAULT '{}',
  photos JSONB DEFAULT '[]',
  notes TEXT,
  measured_by TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for client measurements
ALTER TABLE client_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client measurements" 
  ON client_measurements 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own client measurements" 
  ON client_measurements 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own client measurements" 
  ON client_measurements 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own client measurements" 
  ON client_measurements 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Update projects table to simplify status
ALTER TABLE projects 
ADD COLUMN funnel_stage TEXT DEFAULT 'approved';

-- Create trigger to update client funnel stage when actions happen
CREATE OR REPLACE FUNCTION update_client_funnel_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_contact_date and stage when email is sent
  IF TG_TABLE_NAME = 'emails' AND TG_OP = 'INSERT' AND NEW.client_id IS NOT NULL THEN
    UPDATE clients 
    SET last_contact_date = now(),
        funnel_stage = CASE 
          WHEN funnel_stage = 'lead' THEN 'contacted'
          ELSE funnel_stage
        END,
        stage_changed_at = CASE 
          WHEN funnel_stage = 'lead' THEN now()
          ELSE stage_changed_at
        END
    WHERE id = NEW.client_id;
  END IF;
  
  -- Update stage when appointment is scheduled
  IF TG_TABLE_NAME = 'appointments' AND TG_OP = 'INSERT' AND NEW.client_id IS NOT NULL THEN
    UPDATE clients 
    SET funnel_stage = CASE 
          WHEN funnel_stage IN ('lead', 'contacted') THEN 'measuring_scheduled'
          ELSE funnel_stage
        END,
        stage_changed_at = CASE 
          WHEN funnel_stage IN ('lead', 'contacted') THEN now()
          ELSE stage_changed_at
        END
    WHERE id = NEW.client_id;
  END IF;
  
  -- Update stage when quote is created
  IF TG_TABLE_NAME = 'quotes' AND TG_OP = 'INSERT' AND NEW.client_id IS NOT NULL THEN
    UPDATE clients 
    SET funnel_stage = CASE 
          WHEN funnel_stage IN ('lead', 'contacted', 'measuring_scheduled') THEN 'quoted'
          ELSE funnel_stage
        END,
        stage_changed_at = CASE 
          WHEN funnel_stage IN ('lead', 'contacted', 'measuring_scheduled') THEN now()
          ELSE stage_changed_at
        END
    WHERE id = NEW.client_id;
  END IF;
  
  -- Update stage when project is created/approved
  IF TG_TABLE_NAME = 'projects' AND TG_OP = 'INSERT' AND NEW.client_id IS NOT NULL THEN
    UPDATE clients 
    SET funnel_stage = 'approved',
        stage_changed_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic funnel progression
CREATE TRIGGER trigger_email_funnel_update
  AFTER INSERT ON emails
  FOR EACH ROW EXECUTE FUNCTION update_client_funnel_stage();

CREATE TRIGGER trigger_appointment_funnel_update
  AFTER INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_client_funnel_stage();

CREATE TRIGGER trigger_quote_funnel_update
  AFTER INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_client_funnel_stage();

CREATE TRIGGER trigger_project_funnel_update
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION update_client_funnel_stage();
