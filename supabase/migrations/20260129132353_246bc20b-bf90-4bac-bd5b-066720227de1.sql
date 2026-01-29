-- Backfill activity records for existing data
-- This script uses original created_at timestamps and avoids duplicates

-- 1. Backfill project_created events
INSERT INTO public.project_activity_log (project_id, user_id, activity_type, title, description, metadata, created_at)
SELECT 
  p.id as project_id,
  p.user_id,
  'project_created' as activity_type,
  'Project created' as title,
  CASE 
    WHEN p.name IS NOT NULL THEN 'Created project "' || p.name || '"'
    ELSE 'Project was created'
  END as description,
  jsonb_build_object('project_name', p.name, 'backfilled', true) as metadata,
  p.created_at
FROM public.projects p
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_activity_log pal 
  WHERE pal.project_id = p.id 
  AND pal.activity_type = 'project_created'
);

-- 2. Backfill room_added events
INSERT INTO public.project_activity_log (project_id, user_id, activity_type, title, description, metadata, created_at)
SELECT 
  r.project_id,
  p.user_id,
  'room_added' as activity_type,
  'Added room "' || COALESCE(r.name, 'Unnamed Room') || '"' as title,
  NULL as description,
  jsonb_build_object('room_id', r.id, 'room_name', r.name, 'backfilled', true) as metadata,
  r.created_at
FROM public.rooms r
JOIN public.projects p ON r.project_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_activity_log pal 
  WHERE pal.project_id = r.project_id 
  AND pal.activity_type = 'room_added'
  AND (pal.metadata->>'room_id')::uuid = r.id
);

-- 3. Backfill window_added events (surfaces table)
INSERT INTO public.project_activity_log (project_id, user_id, activity_type, title, description, metadata, created_at)
SELECT 
  r.project_id,
  p.user_id,
  'window_added' as activity_type,
  'Added window "' || COALESCE(s.name, 'Unnamed Window') || '"' as title,
  'In room "' || COALESCE(r.name, 'Unnamed Room') || '"' as description,
  jsonb_build_object(
    'surface_id', s.id, 
    'surface_name', s.name, 
    'room_id', r.id,
    'room_name', r.name,
    'backfilled', true
  ) as metadata,
  s.created_at
FROM public.surfaces s
JOIN public.rooms r ON s.room_id = r.id
JOIN public.projects p ON r.project_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_activity_log pal 
  WHERE pal.project_id = r.project_id 
  AND pal.activity_type = 'window_added'
  AND (pal.metadata->>'surface_id')::uuid = s.id
);

-- 4. Backfill quote_created events
INSERT INTO public.project_activity_log (project_id, user_id, activity_type, title, description, metadata, created_at)
SELECT 
  q.project_id,
  p.user_id,
  'quote_created' as activity_type,
  'Quote created' as title,
  CASE 
    WHEN q.quote_number IS NOT NULL THEN 'Created quote #' || q.quote_number
    ELSE 'Quote was created'
  END as description,
  jsonb_build_object(
    'quote_id', q.id, 
    'quote_number', q.quote_number,
    'backfilled', true
  ) as metadata,
  q.created_at
FROM public.quotes q
JOIN public.projects p ON q.project_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_activity_log pal 
  WHERE pal.project_id = q.project_id 
  AND pal.activity_type = 'quote_created'
  AND (pal.metadata->>'quote_id')::uuid = q.id
);