-- Phase 2.5: Security & Access Control Hardening
-- Add new permissions for import/export, billing, and purchasing

-- Update get_default_permissions_for_role function to include new permissions
CREATE OR REPLACE FUNCTION public.get_default_permissions_for_role(user_role text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  CASE user_role
    WHEN 'Owner' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
        'view_profile',
        'export_clients', 'import_clients', 'export_jobs', 'import_jobs',
        'export_inventory', 'import_inventory', 'view_billing', 'manage_purchasing'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings',
        'view_profile', 'view_purchasing'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'view_all_clients',
        'view_calendar', 'create_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings',
        'view_profile', 'view_purchasing'
      ];
    WHEN 'Staff' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients',
        'view_calendar',
        'view_inventory',
        'view_profile'
      ];
    ELSE
      RETURN ARRAY['view_profile']::text[];
  END CASE;
END;
$function$;

-- Create export_requests table for approval workflow
CREATE TABLE IF NOT EXISTS public.export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('clients', 'jobs', 'inventory')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  approved_at timestamptz,
  record_count int,
  reason text,
  request_notes text
);

-- Enable RLS on export_requests
ALTER TABLE public.export_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for export_requests
CREATE POLICY "Users can view their own export requests"
  ON public.export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Account owners can view export requests for their account"
  ON public.export_requests FOR SELECT
  USING (auth.uid() = account_owner_id);

CREATE POLICY "Users can create export requests"
  ON public.export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Account owners can update export requests"
  ON public.export_requests FOR UPDATE
  USING (auth.uid() = account_owner_id);

-- Create export_audit_log table for tracking all exports
CREATE TABLE IF NOT EXISTS public.export_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_type text NOT NULL,
  record_count int NOT NULL,
  exported_at timestamptz DEFAULT now() NOT NULL,
  ip_address inet,
  user_agent text,
  file_format text,
  included_fields text[]
);

-- Enable RLS on export_audit_log
ALTER TABLE public.export_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for export_audit_log (owner/admin can view all, users can view own)
CREATE POLICY "Users can view their own export logs"
  ON public.export_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all export logs in their account"
  ON public.export_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up1
      WHERE up1.user_id = auth.uid()
      AND up1.role IN ('Owner', 'Admin')
      AND EXISTS (
        SELECT 1 FROM public.user_profiles up2
        WHERE up2.user_id = export_audit_log.user_id
        AND (up2.parent_account_id = up1.user_id OR up2.user_id = up1.user_id)
      )
    )
  );

CREATE POLICY "Users can create export audit logs"
  ON public.export_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_export_requests_user_id ON public.export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_export_requests_account_owner_id ON public.export_requests(account_owner_id);
CREATE INDEX IF NOT EXISTS idx_export_requests_status ON public.export_requests(status);
CREATE INDEX IF NOT EXISTS idx_export_audit_log_user_id ON public.export_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_export_audit_log_exported_at ON public.export_audit_log(exported_at);

-- Update user_notification_settings RLS policies for proper inheritance
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON public.user_notification_settings;

-- Create proper RLS policies for notification settings
CREATE POLICY "Users can view their own notification settings"
  ON public.user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON public.user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON public.user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);