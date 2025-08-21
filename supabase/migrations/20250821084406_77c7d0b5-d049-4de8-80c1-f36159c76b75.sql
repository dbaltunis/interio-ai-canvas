-- Add missing email and calendar permissions for Holly
DO $$
DECLARE
  holly_user_id uuid;
  missing_perms text[] := ARRAY['view_emails', 'create_emails', 'send_emails', 'view_calendar', 'create_appointments'];
  perm text;
BEGIN
  -- Get Holly's user ID
  SELECT id INTO holly_user_id FROM auth.users WHERE email = 'darius+holly@curtainscalculator.com';
  
  IF holly_user_id IS NOT NULL THEN
    -- Add missing permissions
    FOREACH perm IN ARRAY missing_perms
    LOOP
      INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
      VALUES (holly_user_id, perm, (SELECT id FROM auth.users WHERE email = 'darius@curtainscalculator.com'))
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Updated additional permissions for Holly user: %', holly_user_id;
  ELSE
    RAISE NOTICE 'Holly user not found';
  END IF;
END $$;