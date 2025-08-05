-- First, create the missing permissions in the permissions table
INSERT INTO permissions (name, description, category) VALUES
    ('view_projects', 'Can view projects', 'projects'),
    ('create_projects', 'Can create new projects', 'projects'),
    ('edit_projects', 'Can edit projects', 'projects'),
    ('delete_projects', 'Can delete projects', 'projects'),
    ('view_all_projects', 'Can view all team projects', 'projects'),
    ('edit_all_projects', 'Can edit all team projects', 'projects'),
    ('view_all_clients', 'Can view all team clients', 'clients'),
    ('edit_all_clients', 'Can edit all team clients', 'clients'),
    ('view_all_jobs', 'Can view all team jobs', 'jobs'),
    ('edit_all_jobs', 'Can edit all team jobs', 'jobs'),
    ('view_documents', 'Can view documents', 'files'),
    ('manage_calendar', 'Can manage calendar settings', 'calendar'),
    ('view_quotes', 'Can view quotes', 'quotes'),
    ('manage_quotes', 'Can manage quotes', 'quotes')
ON CONFLICT (name) DO NOTHING;

-- Now assign these permissions to the owner
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