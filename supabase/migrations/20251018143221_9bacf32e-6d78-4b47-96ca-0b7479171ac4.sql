-- SECURITY PHASE 1: Fix tables with RLS enabled but no policies
-- SECURITY PHASE 2: Secure materialized views - revoke API access
REVOKE ALL ON public.client_stats_mv FROM anon, authenticated;
GRANT SELECT ON public.client_stats_mv TO authenticated;

-- SECURITY PHASE 3: Create audit trail table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and owners can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_profiles 
    WHERE role IN ('Admin', 'Owner')
  )
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- SECURITY PHASE 4: Create audit trigger functions
CREATE OR REPLACE FUNCTION public.log_deletion_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    OLD.id,
    to_jsonb(OLD),
    now()
  );
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_update_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_jsonb(OLD) != to_jsonb(NEW) THEN
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
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- SECURITY PHASE 5: Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_clients_delete ON public.clients;
CREATE TRIGGER audit_clients_delete
  BEFORE DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_audit();

DROP TRIGGER IF EXISTS audit_clients_update ON public.clients;  
CREATE TRIGGER audit_clients_update
  AFTER UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.log_update_audit();

DROP TRIGGER IF EXISTS audit_quotes_delete ON public.quotes;
CREATE TRIGGER audit_quotes_delete
  BEFORE DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_audit();

DROP TRIGGER IF EXISTS audit_quotes_update ON public.quotes;
CREATE TRIGGER audit_quotes_update
  AFTER UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_update_audit();

DROP TRIGGER IF EXISTS audit_user_profiles_update ON public.user_profiles;
CREATE TRIGGER audit_user_profiles_update
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_update_audit();

DROP TRIGGER IF EXISTS audit_user_permissions_delete ON public.user_permissions;
CREATE TRIGGER audit_user_permissions_delete
  BEFORE DELETE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_audit();

DROP TRIGGER IF EXISTS audit_deals_delete ON public.deals;
CREATE TRIGGER audit_deals_delete
  BEFORE DELETE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_audit();

-- SECURITY PHASE 6: Session tracking table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can create sessions"
ON public.user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- SECURITY PHASE 7: Session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_sessions WHERE expires_at < now();
END;
$$;

-- SECURITY PHASE 8: Input validation functions
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text text, max_length integer DEFAULT 10000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  input_text := replace(input_text, chr(0), '');
  input_text := trim(input_text);
  IF length(input_text) > max_length THEN
    input_text := substring(input_text from 1 for max_length);
  END IF;
  RETURN input_text;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_email(email_address text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_phone_number(phone_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  phone_number := regexp_replace(phone_number, '[^0-9+]', '', 'g');
  IF position('+' in phone_number) > 1 THEN
    phone_number := regexp_replace(phone_number, '\+', '', 'g');
  END IF;
  RETURN phone_number;
END;
$$;