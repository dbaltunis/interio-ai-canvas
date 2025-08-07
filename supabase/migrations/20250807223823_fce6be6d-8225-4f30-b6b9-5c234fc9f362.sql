-- Fix the RLS policy for windows_summary to correctly reference surfaces → projects → user_id
DROP POLICY IF EXISTS "read own job" ON windows_summary;
DROP POLICY IF EXISTS "Users can read own window summaries" ON windows_summary;
DROP POLICY IF EXISTS "Users can manage own window summaries" ON windows_summary;

-- Create correct RLS policies for windows_summary
CREATE POLICY "Users can read own window summaries" 
ON windows_summary FOR SELECT
USING (EXISTS (
  SELECT 1 FROM surfaces s
  JOIN projects p ON s.project_id = p.id
  WHERE s.id = windows_summary.window_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can manage own window summaries" 
ON windows_summary FOR ALL
USING (EXISTS (
  SELECT 1 FROM surfaces s
  JOIN projects p ON s.project_id = p.id
  WHERE s.id = windows_summary.window_id 
  AND p.user_id = auth.uid()
));