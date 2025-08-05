-- Add missing permissions that the Owner role needs
INSERT INTO user_permissions (user_id, permission_name)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'baltunis@curtainscalculator.com'),
    unnest(ARRAY[
        'view_projects',
        'create_projects', 
        'edit_projects',
        'delete_projects',
        'view_all_projects',
        'edit_all_projects',
        'view_all_clients',
        'edit_all_clients',
        'view_all_jobs',
        'edit_all_jobs',
        'view_documents',
        'manage_calendar',
        'view_quotes',
        'manage_quotes'
    ])
WHERE NOT EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'baltunis@curtainscalculator.com')
    AND permission_name = unnest(ARRAY[
        'view_projects',
        'create_projects', 
        'edit_projects',
        'delete_projects',
        'view_all_projects',
        'edit_all_projects',
        'view_all_clients',
        'edit_all_clients',
        'view_all_jobs',
        'edit_all_jobs',
        'view_documents',
        'manage_calendar',
        'view_quotes',
        'manage_quotes'
    ])
);