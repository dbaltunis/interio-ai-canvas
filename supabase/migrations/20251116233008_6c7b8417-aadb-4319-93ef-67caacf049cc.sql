-- Fix System Owner permissions by removing restrictive custom permissions
-- This allows System Owners to use their full role-based permissions

DELETE FROM user_permissions 
WHERE user_id IN (
  SELECT user_id FROM user_profiles WHERE role = 'System Owner'
);

-- Add comment
COMMENT ON TABLE user_permissions IS 'Custom permissions override role permissions. System Owners should rely on role-based permissions unless specifically customized.';