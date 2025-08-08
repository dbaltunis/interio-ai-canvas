-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage own window summaries" ON windows_summary;
DROP POLICY IF EXISTS "Users can read own window summaries" ON windows_summary;

-- Create correct policy
CREATE POLICY "Users can manage own window summaries" 
ON windows_summary 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM surfaces s
  JOIN projects p ON s.project_id = p.id
  WHERE s.id = windows_summary.window_id AND p.user_id = auth.uid()
));

-- Clear existing test data to start fresh
DELETE FROM windows_summary;