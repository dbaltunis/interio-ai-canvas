-- Fix log_update_audit function to handle tables with different primary key names
-- The user_profiles table uses 'user_id' as primary key, not 'id'

CREATE OR REPLACE FUNCTION public.log_update_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_pk uuid;
BEGIN
  IF to_jsonb(OLD) != to_jsonb(NEW) THEN
    -- Handle different primary key column names
    CASE TG_TABLE_NAME
      WHEN 'user_profiles' THEN
        record_pk := NEW.user_id;
      ELSE
        record_pk := NEW.id;
    END CASE;
    
    INSERT INTO public.audit_log (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data,
      created_at
    ) VALUES (
      auth.uid(),
      'UPDATE',
      TG_TABLE_NAME,
      record_pk,
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Also fix log_deletion_audit function for consistency
CREATE OR REPLACE FUNCTION public.log_deletion_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_pk uuid;
BEGIN
  -- Handle different primary key column names
  CASE TG_TABLE_NAME
    WHEN 'user_profiles' THEN
      record_pk := OLD.user_id;
    ELSE
      record_pk := OLD.id;
  END CASE;
  
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    created_at
  ) VALUES (
    auth.uid(),
    'DELETE',
    TG_TABLE_NAME,
    record_pk,
    to_jsonb(OLD),
    now()
  );
  RETURN OLD;
END;
$$;