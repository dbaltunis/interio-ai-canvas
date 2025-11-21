-- ============================================
-- Enhanced Custom Permissions System Migration
-- ============================================
-- This migration adds:
-- 1. New permissions (view_own_jobs, view_workroom, view_materials)
-- 2. Updated RLS policies for projects (permission-based access)
-- 3. Updated RLS policies for quote_templates (inheritance)
-- 4. Owner notification trigger for project creation

-- ============================================
-- PHASE 1: Add New Permissions
-- ============================================

-- Add new permission definitions
INSERT INTO permissions (name, description, category) 
VALUES 
  ('view_own_jobs', 'Can view jobs created by self', 'jobs'),
  ('view_workroom', 'Can view workroom and work orders', 'workroom'),
  ('view_materials', 'Can view materials and inventory in jobs', 'inventory')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PHASE 2: Update Projects RLS Policy
-- ============================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Account isolation - SELECT" ON projects;

-- Create new permission-aware SELECT policy
CREATE POLICY "Permission-based project access" ON projects
FOR SELECT USING (
  -- Owners and Admins see everything in their account
  (is_admin() OR get_user_role(auth.uid()) IN ('Owner', 'System Owner'))
  OR
  -- Users with view_all_jobs permission see all account projects
  (
    has_permission('view_all_jobs') 
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  OR
  -- Users with only view_own_jobs see only their own
  (has_permission('view_own_jobs') AND auth.uid() = user_id)
  OR
  -- Legacy support: if they have view_all_projects, also see all projects
  (
    has_permission('view_all_projects')
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
);

-- ============================================
-- PHASE 3: Update Quote Templates RLS Policy
-- ============================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view quote templates" ON quote_templates;

-- Create new inheritance-aware SELECT policy
CREATE POLICY "Users can view own and inherited templates" ON quote_templates
FOR SELECT USING (
  -- Own templates
  auth.uid() = user_id
  OR
  -- Admin access
  is_admin()
  OR
  -- Parent account templates (inheritance)
  user_id = get_account_owner(auth.uid())
  OR
  -- Templates marked as shared within account
  (
    active = true 
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
);

-- ============================================
-- PHASE 4: Create Owner Notification Trigger
-- ============================================

-- Create function to notify owner when staff creates a project
CREATE OR REPLACE FUNCTION notify_owner_on_project_creation()
RETURNS TRIGGER AS $$
DECLARE
  owner_id UUID;
  creator_role TEXT;
  creator_name TEXT;
BEGIN
  -- Get creator's role
  creator_role := get_user_role(NEW.user_id);
  
  -- Get creator's name
  SELECT display_name INTO creator_name
  FROM user_profiles
  WHERE user_id = NEW.user_id;
  
  -- Only notify if creator is not the Owner
  IF creator_role IN ('Staff', 'Manager', 'Admin', 'User') THEN
    -- Get the account owner
    owner_id := get_account_owner(NEW.user_id);
    
    -- Create notification for owner if they're different from creator
    IF owner_id IS NOT NULL AND owner_id != NEW.user_id THEN
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type,
        created_at
      ) VALUES (
        owner_id,
        'New Project Created',
        format('"%s" was created by %s', 
          COALESCE(NEW.name, 'Untitled Project'),
          COALESCE(creator_name, creator_role)
        ),
        'project_created',
        NEW.id,
        'project',
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS notify_owner_on_new_project ON projects;

-- Create trigger
CREATE TRIGGER notify_owner_on_new_project
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_owner_on_project_creation();

-- ============================================
-- PHASE 5: Sync Existing Staff Users
-- ============================================

-- Update all existing Staff users to have the new permission structure
DO $$
DECLARE
  staff_user RECORD;
BEGIN
  FOR staff_user IN 
    SELECT DISTINCT up.user_id
    FROM user_profiles up
    WHERE up.role = 'Staff'
  LOOP
    -- Fix permissions for each Staff user
    PERFORM fix_user_permissions_for_role(staff_user.user_id);
  END LOOP;
END $$;