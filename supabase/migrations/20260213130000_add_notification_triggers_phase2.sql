-- Migration: Additional notification triggers (Phase 2 - High Priority)
-- 1. Quote accepted/rejected → notify account owner
-- 2. Invoice created → notify account owner
-- 3. Project completed → notify account owner
-- 4. Client funnel stage change → notify account owner

-- ============================================
-- 1. Quote status changed (accepted/rejected/expired)
--    Notify account owner when a quote reaches a decision state.
--    Uses quotes.status column (draft/sent/viewed/accepted/rejected/expired).
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_quote_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  quote_title TEXT;
  client_name TEXT;
  notif_type TEXT;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  -- Only fire when the status column actually changes
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- We care about accepted, rejected, expired, and viewed
    IF NEW.status IN ('accepted', 'rejected', 'expired', 'viewed') THEN
      owner_id := COALESCE(
        public.get_effective_account_owner(NEW.user_id),
        NEW.user_id
      );

      -- Get quote number or project name for context
      quote_title := COALESCE(NEW.quote_number, 'Q-' || LEFT(NEW.id::TEXT, 8));

      -- Try to get client name
      SELECT COALESCE(c.full_name, c.company_name, c.email, 'Unknown client')
        INTO client_name
        FROM clients c
        WHERE c.id = NEW.client_id;

      IF NEW.status = 'accepted' THEN
        notif_type := 'success';
        notif_title := 'Quote Accepted';
        notif_message := 'Quote ' || quote_title || ' has been accepted by ' || COALESCE(client_name, 'the client');
      ELSIF NEW.status = 'rejected' THEN
        notif_type := 'error';
        notif_title := 'Quote Rejected';
        notif_message := 'Quote ' || quote_title || ' has been rejected by ' || COALESCE(client_name, 'the client');
      ELSIF NEW.status = 'expired' THEN
        notif_type := 'warning';
        notif_title := 'Quote Expired';
        notif_message := 'Quote ' || quote_title || ' for ' || COALESCE(client_name, 'a client') || ' has expired';
      ELSIF NEW.status = 'viewed' THEN
        notif_type := 'info';
        notif_title := 'Quote Viewed';
        notif_message := COALESCE(client_name, 'The client') || ' has viewed quote ' || quote_title;
      END IF;

      BEGIN
        INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
        VALUES (
          owner_id,
          notif_type,
          notif_title,
          notif_message,
          'quote',
          'quote',
          NEW.id,
          '/?jobId=' || COALESCE(NEW.project_id::TEXT, NEW.id::TEXT)
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create quote status notification: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_quote_status_change ON quotes;
CREATE TRIGGER notify_owner_on_quote_status_change
  AFTER UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_quote_status_change();

-- ============================================
-- 2. Invoice created → notify account owner
--    Fires when a new custom_invoice is inserted.
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_invoice_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  creator_name TEXT;
  invoice_desc TEXT;
BEGIN
  owner_id := COALESCE(
    public.get_effective_account_owner(NEW.user_id),
    NEW.user_id
  );

  -- Only notify if created by a team member (not the owner themselves)
  IF owner_id != NEW.user_id THEN
    SELECT COALESCE(display_name, first_name, 'A team member')
      INTO creator_name
      FROM user_profiles
      WHERE user_id = NEW.user_id;

    invoice_desc := COALESCE(NEW.description, 'Untitled invoice');

    BEGIN
      INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
      VALUES (
        owner_id,
        'info',
        'New Invoice Created',
        COALESCE(creator_name, 'A team member') || ' created invoice: ' || invoice_desc || ' (' || COALESCE(NEW.currency, 'GBP') || ' ' || NEW.amount::TEXT || ')',
        'billing',
        'invoice',
        NEW.id,
        '/billing'
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create invoice notification: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_invoice_created ON custom_invoices;
CREATE TRIGGER notify_owner_on_invoice_created
  AFTER INSERT ON custom_invoices
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_invoice_created();

-- Also notify when invoice status changes to paid or overdue
CREATE OR REPLACE FUNCTION public.notify_owner_on_invoice_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  invoice_desc TEXT;
  notif_type TEXT;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('paid', 'overdue', 'cancelled') THEN
      owner_id := COALESCE(
        public.get_effective_account_owner(NEW.user_id),
        NEW.user_id
      );

      invoice_desc := COALESCE(NEW.description, 'Untitled invoice');

      IF NEW.status = 'paid' THEN
        notif_type := 'success';
        notif_title := 'Invoice Paid';
        notif_message := 'Invoice "' || invoice_desc || '" has been paid (' || COALESCE(NEW.currency, 'GBP') || ' ' || NEW.amount::TEXT || ')';
      ELSIF NEW.status = 'overdue' THEN
        notif_type := 'warning';
        notif_title := 'Invoice Overdue';
        notif_message := 'Invoice "' || invoice_desc || '" is now overdue (' || COALESCE(NEW.currency, 'GBP') || ' ' || NEW.amount::TEXT || ')';
      ELSIF NEW.status = 'cancelled' THEN
        notif_type := 'info';
        notif_title := 'Invoice Cancelled';
        notif_message := 'Invoice "' || invoice_desc || '" has been cancelled';
      END IF;

      BEGIN
        INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
        VALUES (
          owner_id,
          notif_type,
          notif_title,
          notif_message,
          'billing',
          'invoice',
          NEW.id,
          '/billing'
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create invoice status notification: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_invoice_status_change ON custom_invoices;
CREATE TRIGGER notify_owner_on_invoice_status_change
  AFTER UPDATE ON custom_invoices
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_invoice_status_change();

-- ============================================
-- 3. Project completed → notify account owner
--    Fires when project status changes to a completion state.
--    Checks both status_id (custom statuses) and status (simple column).
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_project_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  completer_name TEXT;
  new_status_name TEXT;
  is_completed BOOLEAN := FALSE;
  was_completed BOOLEAN := FALSE;
BEGIN
  -- Check if the new status is a completion status
  -- Method 1: Check status_id against job_statuses with action = 'locked' and name like 'Complete%'
  IF NEW.status_id IS NOT NULL AND NEW.status_id IS DISTINCT FROM OLD.status_id THEN
    SELECT EXISTS(
      SELECT 1 FROM job_statuses
      WHERE id = NEW.status_id
        AND (
          LOWER(name) LIKE '%complet%'
          OR LOWER(name) LIKE '%install%'
          OR LOWER(name) LIKE '%finish%'
          OR LOWER(name) LIKE '%done%'
          OR action = 'locked'
        )
    ) INTO is_completed;

    IF OLD.status_id IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM job_statuses
        WHERE id = OLD.status_id
          AND (
            LOWER(name) LIKE '%complet%'
            OR LOWER(name) LIKE '%install%'
            OR LOWER(name) LIKE '%finish%'
            OR LOWER(name) LIKE '%done%'
            OR action = 'locked'
          )
      ) INTO was_completed;
    END IF;

    SELECT name INTO new_status_name FROM job_statuses WHERE id = NEW.status_id;
  END IF;

  -- Method 2: Check simple status column
  IF NOT is_completed AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF LOWER(COALESCE(NEW.status, '')) IN ('completed', 'installed', 'complete', 'finished', 'done') THEN
      is_completed := TRUE;
    END IF;
    IF LOWER(COALESCE(OLD.status, '')) IN ('completed', 'installed', 'complete', 'finished', 'done') THEN
      was_completed := TRUE;
    END IF;
    new_status_name := NEW.status;
  END IF;

  -- Only notify on transition INTO completion (not if it was already completed)
  IF is_completed AND NOT was_completed THEN
    owner_id := COALESCE(
      public.get_effective_account_owner(NEW.user_id),
      NEW.user_id
    );

    SELECT COALESCE(display_name, first_name, 'System')
      INTO completer_name
      FROM user_profiles
      WHERE user_id = NEW.user_id;

    BEGIN
      INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
      VALUES (
        owner_id,
        'success',
        'Project Completed',
        '"' || COALESCE(NEW.name, 'Untitled project') || '" has been marked as ' || COALESCE(new_status_name, 'completed'),
        'project',
        'project',
        NEW.id,
        '/?jobId=' || NEW.id::TEXT
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create project completed notification: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_project_completed ON projects;
CREATE TRIGGER notify_owner_on_project_completed
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_project_completed();

-- ============================================
-- 4. Client funnel stage advancement → notify account owner
--    Fires when a client progresses through the sales funnel.
--    Only notifies on significant stages: quoted, approved.
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_funnel_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  notif_type TEXT;
  notif_title TEXT;
  notif_message TEXT;
  client_display TEXT;
BEGIN
  IF NEW.funnel_stage IS DISTINCT FROM OLD.funnel_stage THEN
    -- Only notify on significant stage changes
    IF NEW.funnel_stage IN ('quoted', 'approved') THEN
      owner_id := COALESCE(
        public.get_effective_account_owner(NEW.user_id),
        NEW.user_id
      );

      client_display := COALESCE(NEW.full_name, NEW.company_name, NEW.email, 'A client');

      IF NEW.funnel_stage = 'quoted' THEN
        notif_type := 'info';
        notif_title := 'Client Quoted';
        notif_message := client_display || ' has moved to the "Quoted" stage';
      ELSIF NEW.funnel_stage = 'approved' THEN
        notif_type := 'success';
        notif_title := 'Client Approved';
        notif_message := client_display || ' has moved to the "Approved" stage';
      END IF;

      BEGIN
        INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
        VALUES (
          owner_id,
          notif_type,
          notif_title,
          notif_message,
          'client',
          'client',
          NEW.id,
          '/clients?clientId=' || NEW.id::TEXT
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create funnel stage notification: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_funnel_stage_change ON clients;
CREATE TRIGGER notify_owner_on_funnel_stage_change
  AFTER UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_funnel_stage_change();
