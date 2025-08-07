-- Create missing Project statuses to cover the workflow
INSERT INTO public.job_statuses (name, description, category, color, sort_order, action, user_id)
VALUES 
  ('Draft', 'Initial project creation, fully editable', 'Project', 'gray', 1, 'editable', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Planning', 'Project in planning phase, editable', 'Project', 'blue', 2, 'editable', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Quote Sent', 'Quote has been sent to client', 'Project', 'yellow', 3, 'progress_only', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Order Confirmed', 'Client confirmed order, locked for production', 'Project', 'orange', 4, 'locked', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('In Production', 'Project in production phase', 'Project', 'purple', 5, 'locked', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Cancelled', 'Project cancelled', 'Project', 'red', 99, 'locked', 'ec930f73-ef23-4430-921f-1b401859825d');

-- Update existing projects to use valid statuses
UPDATE public.projects 
SET status = 'Planning' 
WHERE status = 'planning';

-- Update sort order for existing statuses
UPDATE public.job_statuses 
SET sort_order = 6
WHERE name = 'Approved' AND category = 'Project';

UPDATE public.job_statuses 
SET sort_order = 7
WHERE name = 'Completed' AND category = 'Project';