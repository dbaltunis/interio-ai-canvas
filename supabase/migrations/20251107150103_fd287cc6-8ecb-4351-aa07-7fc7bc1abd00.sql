-- Step 1: Drop old constraint
ALTER TABLE curtain_templates 
DROP CONSTRAINT IF EXISTS check_treatment_category;

-- Step 2: Update existing data to match new constraint
UPDATE curtain_templates 
SET treatment_category = 'cellular_blinds'
WHERE treatment_category = 'cellular_shades';

-- Step 3: Add new constraint with all valid categories
ALTER TABLE curtain_templates 
ADD CONSTRAINT check_treatment_category 
CHECK (treatment_category IN (
  'roller_blinds', 'roman_blinds', 'venetian_blinds', 'vertical_blinds',
  'cellular_blinds', 'cellular_shades', 'plantation_shutters', 'shutters', 
  'panel_glide', 'curtains', 'awning', 'wallpaper'
));

-- Step 4: Activate wallpaper templates
UPDATE curtain_templates 
SET 
  active = true,
  treatment_category = 'wallpaper'
WHERE curtain_type = 'wallpaper'
AND user_id = 'ec930f73-ef23-4430-921f-1b401859825d';

UPDATE curtain_templates 
SET active = true
WHERE curtain_type = 'wallpaper'
AND is_system_default = true;

-- Step 5: Update Shopify permissions function
CREATE OR REPLACE FUNCTION public.get_default_permissions_for_role(user_role text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
        'export_inventory', 'import_inventory', 'view_billing', 'manage_purchasing',
        'view_shopify', 'manage_shopify'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings',
        'view_profile', 'view_purchasing', 'view_shopify'
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

-- Step 6: Add Shopify permissions to existing Owners
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT DISTINCT up.user_id, 'view_shopify', up.user_id
FROM user_profiles up
WHERE up.role = 'Owner'
ON CONFLICT (user_id, permission_name) DO NOTHING;

INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT DISTINCT up.user_id, 'manage_shopify', up.user_id
FROM user_profiles up
WHERE up.role = 'Owner'
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Step 7: Add Shopify view permission to existing Admins
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT DISTINCT up.user_id, 'view_shopify', up.user_id
FROM user_profiles up
WHERE up.role = 'Admin'
ON CONFLICT (user_id, permission_name) DO NOTHING;