-- Migration: Add notification triggers for key app events
-- 1. Team member accepted invitation → notify account owner
-- 2. Low stock alert → notify account owner when inventory drops below reorder point
-- 3. Job status change → notify account owner when team member changes status

-- ============================================
-- 1. Notify account owner when a team member accepts an invitation
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_invitation_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  account_owner_id UUID;
  member_name TEXT;
BEGIN
  -- Only fire when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- The invitation's user_id is the inviter (account owner or admin)
    account_owner_id := public.get_account_owner(NEW.user_id);
    IF account_owner_id IS NULL THEN
      account_owner_id := NEW.user_id;
    END IF;

    member_name := COALESCE(NEW.invited_name, NEW.invited_email, 'A team member');

    BEGIN
      INSERT INTO notifications (user_id, type, title, message, category, source_type, action_url)
      VALUES (
        account_owner_id,
        'success',
        'Team Member Joined',
        member_name || ' has accepted the invitation and joined your team as ' || COALESCE(NEW.role, 'Staff'),
        'team',
        'invitation',
        '/settings?tab=team'
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create invitation accepted notification: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_invitation_accepted ON user_invitations;
CREATE TRIGGER notify_owner_on_invitation_accepted
  AFTER UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_invitation_accepted();

-- ============================================
-- 2. Low stock alert: notify when inventory drops below reorder point
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_id UUID;
  item_name TEXT;
  reorder_pt INTEGER;
BEGIN
  -- Only check if quantity decreased and reorder_point is set
  IF NEW.quantity < OLD.quantity
     AND NEW.reorder_point IS NOT NULL
     AND NEW.quantity <= NEW.reorder_point
     AND OLD.quantity > OLD.reorder_point THEN

    owner_id := COALESCE(
      (SELECT parent_account_id FROM user_profiles WHERE user_id = NEW.user_id),
      NEW.user_id
    );

    item_name := COALESCE(NEW.name, 'Unknown item');
    reorder_pt := NEW.reorder_point;

    BEGIN
      INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
      VALUES (
        owner_id,
        'warning',
        'Low Stock Alert',
        item_name || ' is below reorder point (' || NEW.quantity || ' remaining, reorder at ' || reorder_pt || ')',
        'inventory',
        'inventory',
        NEW.id,
        '/library'
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create low stock notification: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_low_stock ON enhanced_inventory_items;
CREATE TRIGGER notify_low_stock
  AFTER UPDATE ON enhanced_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_low_stock();

-- ============================================
-- 3. Job status change: notify account owner when team member changes status
--    (Supplements the frontend notification in useProjects.ts for
--     cases where status is changed via other paths like Edge Functions)
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_owner_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  effective_owner_id UUID;
  changer_name TEXT;
  old_status_name TEXT;
  new_status_name TEXT;
BEGIN
  -- Only fire when status_id actually changes
  IF NEW.status_id IS DISTINCT FROM OLD.status_id AND NEW.status_id IS NOT NULL THEN
    effective_owner_id := public.get_effective_account_owner(NEW.user_id);

    -- Only notify if the project creator is not the account owner
    -- (i.e., a team member's project status changed)
    IF effective_owner_id IS NOT NULL AND effective_owner_id != NEW.user_id THEN
      SELECT COALESCE(display_name, first_name, 'Team member') INTO changer_name
      FROM user_profiles
      WHERE user_id = NEW.user_id;

      -- Get status names
      SELECT name INTO old_status_name FROM job_statuses WHERE id = OLD.status_id;
      SELECT name INTO new_status_name FROM job_statuses WHERE id = NEW.status_id;

      BEGIN
        INSERT INTO notifications (user_id, type, title, message, category, source_type, source_id, action_url)
        VALUES (
          effective_owner_id,
          'info',
          'Job Status Changed',
          COALESCE(changer_name, 'Team member') || ' changed "' || COALESCE(NEW.name, 'Untitled') || '" from ' || COALESCE(old_status_name, 'Unknown') || ' to ' || COALESCE(new_status_name, 'Unknown'),
          'project',
          'project',
          NEW.id,
          '/?jobId=' || NEW.id::TEXT
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create status change notification: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_owner_on_status_change ON projects;
CREATE TRIGGER notify_owner_on_status_change
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_status_change();
