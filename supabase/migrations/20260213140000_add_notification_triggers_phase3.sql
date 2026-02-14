-- Migration: Additional notification triggers (Phase 3 - Medium Priority)
-- 1. Supplier order status change on quotes → notify account owner
-- 2. Booking created → notify account owner (DB trigger fallback)

-- ============================================
-- 1. Supplier order status change on quotes
--    Fires when twc_order_status or supplier_orders JSONB changes.
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_supplier_order_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  quote_title TEXT;
BEGIN
  -- Check if TWC order status changed (legacy column)
  IF NEW.twc_order_status IS DISTINCT FROM OLD.twc_order_status
     AND NEW.twc_order_status IS NOT NULL THEN

    owner_id := COALESCE(
      public.get_effective_account_owner(NEW.user_id),
      NEW.user_id
    );

    quote_title := COALESCE(NEW.quote_number, 'Q-' || LEFT(NEW.id::TEXT, 8));

    BEGIN
      INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
      VALUES (
        owner_id,
        'info',
        'Supplier Order Update',
        'TWC order for quote ' || quote_title || ' status changed to: ' || NEW.twc_order_status,
        'supplier',
        'quote',
        NEW.id,
        '/?jobId=' || COALESCE(NEW.project_id::TEXT, NEW.id::TEXT)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create supplier order notification: %', SQLERRM;
    END;
  END IF;

  -- Check if multi-supplier orders JSONB changed
  IF NEW.supplier_orders IS DISTINCT FROM OLD.supplier_orders
     AND NEW.supplier_orders IS NOT NULL
     AND (OLD.supplier_orders IS NULL OR NEW.supplier_orders::TEXT != OLD.supplier_orders::TEXT) THEN

    owner_id := COALESCE(
      public.get_effective_account_owner(NEW.user_id),
      NEW.user_id
    );

    quote_title := COALESCE(NEW.quote_number, 'Q-' || LEFT(NEW.id::TEXT, 8));

    BEGIN
      INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
      VALUES (
        owner_id,
        'info',
        'Supplier Order Update',
        'Supplier order status updated for quote ' || quote_title,
        'supplier',
        'quote',
        NEW.id,
        '/?jobId=' || COALESCE(NEW.project_id::TEXT, NEW.id::TEXT)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create supplier order notification: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_supplier_order_change ON quotes;
CREATE TRIGGER notify_owner_on_supplier_order_change
  AFTER UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_supplier_order_change();

-- ============================================
-- 2. Booking created → notify account owner (DB trigger fallback)
--    The edge function also creates an in-app notification,
--    but this trigger covers direct DB inserts (e.g. from API).
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_booking_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  scheduler_name TEXT;
BEGIN
  -- Get the scheduler owner
  SELECT s.user_id, s.name
    INTO owner_id, scheduler_name
    FROM appointment_schedulers s
    WHERE s.id = NEW.scheduler_id;

  IF owner_id IS NOT NULL THEN
    -- Avoid duplicate: check if a notification was already created in the last 30 seconds
    -- (the edge function may have already created one)
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = owner_id
        AND source_type = 'appointment'
        AND source_id = NEW.id
        AND created_at > NOW() - INTERVAL '30 seconds'
    ) THEN
      BEGIN
        INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
        VALUES (
          owner_id,
          'info',
          'New Booking Received',
          COALESCE(NEW.customer_name, 'A customer') || ' booked "' || COALESCE(scheduler_name, 'an appointment') || '" for ' || COALESCE(NEW.appointment_date::TEXT, 'TBD') || ' at ' || COALESCE(NEW.appointment_time::TEXT, 'TBD'),
          'appointment',
          'appointment',
          NEW.id,
          '/?tab=calendar'
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create booking notification: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_booking_created ON appointments_booked;
CREATE TRIGGER notify_owner_on_booking_created
  AFTER INSERT ON appointments_booked
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_booking_created();
