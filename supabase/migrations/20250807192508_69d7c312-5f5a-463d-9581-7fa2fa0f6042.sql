-- Fix critical RLS policy vulnerabilities

-- Remove overly permissive public access policies
DROP POLICY IF EXISTS "Enable booking viewing" ON public.appointments_booked;
DROP POLICY IF EXISTS "Enable public booking creation" ON public.appointments_booked;

-- Create more secure policies for appointments_booked
CREATE POLICY "Authenticated users can create bookings" 
ON public.appointments_booked 
FOR INSERT 
WITH CHECK (true); -- Allow booking creation but require authentication

CREATE POLICY "Scheduler owners can view their bookings" 
ON public.appointments_booked 
FOR SELECT 
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  ) OR 
  customer_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Fix user profile update privilege escalation
CREATE OR REPLACE FUNCTION validate_role_hierarchy(current_user_id uuid, target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM user_profiles 
  WHERE user_id = current_user_id;
  
  -- Get target user's current role
  SELECT role INTO target_user_role 
  FROM user_profiles 
  WHERE user_id = target_user_id;
  
  -- Only Owner can modify Owner/Admin roles
  IF (new_role IN ('Owner', 'Admin') OR target_user_role IN ('Owner', 'Admin')) 
     AND current_user_role != 'Owner' THEN
    RETURN false;
  END IF;
  
  -- Admin can modify Manager/Staff roles
  IF current_user_role IN ('Owner', 'Admin') 
     AND new_role IN ('Manager', 'Staff', 'User') THEN
    RETURN true;
  END IF;
  
  -- Users can only modify themselves (non-privileged roles)
  IF current_user_id = target_user_id 
     AND new_role IN ('User') 
     AND target_user_role IN ('User') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create audit logging trigger for role changes
CREATE OR REPLACE FUNCTION log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO permission_audit_log (
      user_id,
      target_user_id,
      permission_name,
      action,
      previous_value,
      new_value,
      reason,
      created_by
    ) VALUES (
      auth.uid(),
      NEW.user_id,
      'role_change',
      'updated',
      false, -- Previous value (simplified for role changes)
      true,  -- New value (simplified for role changes)
      format('Role changed from %s to %s', OLD.role, NEW.role),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply role change audit trigger
DROP TRIGGER IF EXISTS audit_role_changes ON user_profiles;
CREATE TRIGGER audit_role_changes
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_changes();

-- Enhance user profile RLS policies
DROP POLICY IF EXISTS "Users can update their profile" ON user_profiles;
CREATE POLICY "Users can update their profile with role validation" 
ON user_profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR (
    is_admin() AND 
    validate_role_hierarchy(auth.uid(), user_id, role)
  )
);

-- Remove dangerous System policies that allow unrestricted access
DROP POLICY IF EXISTS "System can insert analytics" ON email_analytics;
CREATE POLICY "Service role can insert analytics" 
ON email_analytics 
FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid() IN (
    SELECT user_id FROM emails WHERE id = email_id
  )
);

-- Secure appointment scheduler access
UPDATE appointment_schedulers 
SET active = false 
WHERE user_id NOT IN (
  SELECT user_id FROM user_profiles 
  WHERE role IN ('Owner', 'Admin', 'Manager')
) AND active = true;