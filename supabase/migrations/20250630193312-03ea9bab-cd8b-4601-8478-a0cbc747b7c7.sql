
-- First, let's ensure the projects table has all necessary columns for job tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS job_number TEXT UNIQUE;

-- Update the job number generation function to be more robust
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'JOB-' || LPAD(nextval('job_number_seq')::TEXT, 4, '0');
END;
$$;

-- Create or replace the trigger function for job numbers
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_set_job_number ON projects;
CREATE TRIGGER trigger_set_job_number
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_job_number();

-- Add RLS policies for projects table to ensure users can see their own projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" 
  ON projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own projects
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects" 
  ON projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own projects
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" 
  ON projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own projects
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" 
  ON projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Ensure quotes table has proper RLS as well
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
CREATE POLICY "Users can view their own quotes" 
  ON quotes 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own quotes" ON quotes;
CREATE POLICY "Users can create their own quotes" 
  ON quotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quotes" ON quotes;
CREATE POLICY "Users can update their own quotes" 
  ON quotes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own quotes" ON quotes;
CREATE POLICY "Users can delete their own quotes" 
  ON quotes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Ensure other related tables have proper RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- Rooms policies
DROP POLICY IF EXISTS "Users can manage their own rooms" ON rooms;
CREATE POLICY "Users can manage their own rooms" 
  ON rooms 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Surfaces policies  
DROP POLICY IF EXISTS "Users can manage their own surfaces" ON surfaces;
CREATE POLICY "Users can manage their own surfaces" 
  ON surfaces 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Treatments policies
DROP POLICY IF EXISTS "Users can manage their own treatments" ON treatments;
CREATE POLICY "Users can manage their own treatments" 
  ON treatments 
  FOR ALL 
  USING (auth.uid() = user_id);
