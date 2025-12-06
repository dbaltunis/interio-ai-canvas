-- Update handle_new_user function to create default number sequences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  parent_id UUID;
  assigned_role TEXT := 'Owner';
BEGIN
  -- Check for pending invitation
  SELECT * INTO invitation_record
  FROM user_invitations
  WHERE invited_email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;

  IF FOUND THEN
    parent_id := invitation_record.invited_by;
    assigned_role := invitation_record.role;
    
    -- Mark invitation as accepted
    UPDATE user_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = invitation_record.id;
  ELSE
    parent_id := NULL;
    assigned_role := 'Owner';
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    role,
    parent_account_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    assigned_role,
    parent_id,
    now(),
    now()
  );

  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Grant permissions based on role
  PERFORM public.fix_user_permissions_for_role(NEW.id);

  -- For account owners (no parent), create default business settings and number sequences
  IF parent_id IS NULL THEN
    -- Create business settings
    INSERT INTO public.business_settings (user_id, created_at, updated_at)
    VALUES (NEW.id, now(), now())
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default number sequences for new account owners
    INSERT INTO public.number_sequences (user_id, entity_type, prefix, next_number, padding, active, created_at, updated_at)
    VALUES 
      (NEW.id, 'draft', 'DRAFT-', 1, 3, true, now(), now()),
      (NEW.id, 'quote', 'QUOTE-', 1, 3, true, now(), now()),
      (NEW.id, 'order', 'ORDER-', 1, 3, true, now(), now()),
      (NEW.id, 'invoice', 'INV-', 1, 3, true, now(), now()),
      (NEW.id, 'job', 'JOB-', 1, 3, true, now(), now())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill existing owner accounts missing number sequences
INSERT INTO public.number_sequences (user_id, entity_type, prefix, next_number, padding, active, created_at, updated_at)
SELECT 
  up.user_id, 
  entity_types.entity_type,
  entity_types.prefix,
  1,
  3,
  true,
  now(),
  now()
FROM user_profiles up
CROSS JOIN (VALUES 
  ('draft', 'DRAFT-'),
  ('quote', 'QUOTE-'),
  ('order', 'ORDER-'),
  ('invoice', 'INV-'),
  ('job', 'JOB-')
) AS entity_types(entity_type, prefix)
WHERE up.role = 'Owner'
AND up.parent_account_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM number_sequences ns 
  WHERE ns.user_id = up.user_id 
  AND ns.entity_type = entity_types.entity_type
)
ON CONFLICT DO NOTHING;