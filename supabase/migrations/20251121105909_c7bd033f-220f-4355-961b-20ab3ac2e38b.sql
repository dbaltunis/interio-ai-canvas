-- Drop the broken trigger and function that's blocking project creation
DROP TRIGGER IF EXISTS notify_owner_on_new_project ON projects;
DROP FUNCTION IF EXISTS notify_owner_on_project_creation();

-- Create corrected function using actual notifications table structure
CREATE OR REPLACE FUNCTION notify_owner_on_project_creation()
RETURNS TRIGGER AS $$
DECLARE
  owner_id UUID;
  creator_role TEXT;
BEGIN
  -- Get the creator's role
  creator_role := get_user_role(NEW.user_id);
  
  -- Only notify if creator is not the Owner
  IF creator_role IN ('Staff', 'Manager', 'Admin', 'User') THEN
    -- Get the account owner
    owner_id := get_account_owner(NEW.user_id);
    
    -- Insert notification for owner if they exist and are different from creator
    IF owner_id IS NOT NULL AND owner_id != NEW.user_id THEN
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        action_url
      ) VALUES (
        owner_id,
        'New Project Created',
        format('"%s" was created by a team member', NEW.name),
        'info',
        '/jobs?project=' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER notify_owner_on_new_project
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_owner_on_project_creation();