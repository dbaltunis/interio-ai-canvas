-- Update existing quotes and projects to use custom status names
-- First, let's update quotes
UPDATE quotes SET status = CASE 
  WHEN status = 'draft' THEN 'Draft'
  WHEN status = 'completed' THEN 'Completed'
  ELSE status
END;

-- Update projects to use custom status names
UPDATE projects SET status = CASE 
  WHEN status = 'draft' THEN 'Draft'
  WHEN status = 'planning' THEN 'Approved' 
  WHEN status = 'in_progress' THEN 'Approved'
  WHEN status = 'on_hold' THEN 'Approved'
  WHEN status = 'completed' THEN 'Completed'
  ELSE status
END;