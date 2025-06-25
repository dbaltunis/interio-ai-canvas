
-- Add job_number to projects table for proper job tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS job_number TEXT UNIQUE;

-- Create sequence for job numbers
CREATE SEQUENCE IF NOT EXISTS job_number_seq START 1000;

-- Create function to generate job numbers
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'JOB-' || LPAD(nextval('job_number_seq')::TEXT, 4, '0');
END;
$$;

-- Create trigger to auto-generate job numbers
CREATE OR REPLACE FUNCTION set_job_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_job_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_job_number ON projects;
CREATE TRIGGER trigger_set_job_number
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_job_number();

-- Add client type and additional fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'B2C';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- Add labor cost and product details to treatments
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS material_cost NUMERIC DEFAULT 0;

-- Update windows table to support walls
ALTER TABLE windows ADD COLUMN IF NOT EXISTS surface_type TEXT DEFAULT 'window';
ALTER TABLE windows RENAME TO surfaces;

-- Update foreign key references (this will be handled in code)
-- treatments.window_id will now reference surfaces.id (which can be windows or walls)

-- Add surface dimensions for walls
ALTER TABLE surfaces ADD COLUMN IF NOT EXISTS surface_width NUMERIC;
ALTER TABLE surfaces ADD COLUMN IF NOT EXISTS surface_height NUMERIC;
