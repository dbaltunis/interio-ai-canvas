-- Add missing permissions that the Owner role needs
DO $$
DECLARE
    owner_user_id UUID;
    missing_permissions TEXT[] := ARRAY[
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
    ];
    perm TEXT;
BEGIN
    -- Get the owner's user ID
    SELECT id INTO owner_user_id FROM auth.users WHERE email = 'baltunis@curtainscalculator.com';
    
    -- Add each missing permission
    FOREACH perm IN ARRAY missing_permissions
    LOOP
        INSERT INTO user_permissions (user_id, permission_name)
        SELECT owner_user_id, perm
        WHERE NOT EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = owner_user_id AND permission_name = perm
        );
    END LOOP;
END $$;