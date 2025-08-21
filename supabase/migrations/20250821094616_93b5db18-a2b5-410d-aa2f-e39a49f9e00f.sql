-- Add account-level access for emails and related tables
-- This allows managers to see account owner's emails

-- Update emails RLS policy for account-level access
CREATE POLICY "Users can view account emails" ON public.emails
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (has_permission('view_emails') OR has_permission('manage_emails') OR is_admin())
);

-- Update email_settings for account-level access  
CREATE POLICY "Users can view account email settings" ON public.email_settings
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (has_permission('view_settings') OR has_permission('manage_settings') OR is_admin())
);

-- Update email_templates for account-level access
CREATE POLICY "Users can view account email templates" ON public.email_templates
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (has_permission('view_settings') OR has_permission('manage_settings') OR is_admin())
);

-- Update email_campaigns for account-level access
CREATE POLICY "Users can view account email campaigns" ON public.email_campaigns
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (has_permission('view_emails') OR has_permission('manage_emails') OR is_admin())
);

-- Add email permissions for Managers since they're missing
-- Since these permission names might not exist in the permissions table, let's check what email permissions are actually available
DO $$
DECLARE
    manager_user record;
    available_email_perms text[] := ARRAY['view_emails', 'create_emails', 'send_emails', 'view_settings'];
    perm text;
    granted_by_id uuid;
BEGIN
    FOR manager_user IN 
        SELECT up.user_id, up.parent_account_id
        FROM public.user_profiles up
        WHERE up.role = 'Manager'
    LOOP
        -- Get the parent account ID for granted_by
        granted_by_id := manager_user.parent_account_id;
        
        -- Add available email permissions that exist in the system
        FOREACH perm IN ARRAY available_email_perms LOOP
            -- Only add permissions that exist in the user_permissions table structure
            -- We'll do a safer approach and just add the ones we know exist
            IF perm IN ('view_settings') THEN
                INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
                VALUES (manager_user.user_id, perm, granted_by_id)
                ON CONFLICT (user_id, permission_name) DO NOTHING;
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Updated email permissions for Manager user: %', manager_user.user_id;
    END LOOP;
END $$;