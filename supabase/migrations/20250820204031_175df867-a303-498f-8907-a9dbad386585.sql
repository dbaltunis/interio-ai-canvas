-- Clean up duplicate invitations where users already exist
-- Create a function to clean up accepted invitations that are still marked as pending
CREATE OR REPLACE FUNCTION cleanup_duplicate_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update invitations to accepted where user already exists
  UPDATE user_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE status = 'pending' 
    AND invited_email IN (
      SELECT email FROM auth.users 
      WHERE email IS NOT NULL
    );
END;
$$;

-- Run the cleanup immediately
SELECT cleanup_duplicate_invitations();

-- Create trigger to automatically mark invitation as accepted when user signs up
CREATE OR REPLACE FUNCTION handle_invitation_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark any pending invitations as accepted when user signs up
  UPDATE user_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE status = 'pending' 
    AND invited_email = NEW.email;
    
  RETURN NEW;
END;
$$;

-- Create trigger to run on new user signup
DROP TRIGGER IF EXISTS on_user_signup_handle_invitations ON auth.users;
CREATE TRIGGER on_user_signup_handle_invitations
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_invitation_on_signup();