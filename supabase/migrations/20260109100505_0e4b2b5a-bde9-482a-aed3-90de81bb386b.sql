-- Add the 14 missing permissions to the 3 accounts with 63 permissions
INSERT INTO user_permissions (user_id, permission_name)
SELECT u.user_id, p.permission_name
FROM (
  VALUES 
    ('50a23348-3817-47ff-bf43-c0d3f3749a6a'::uuid),
    ('b0c727dd-b9bf-4470-840d-1f630e8f2b26'::uuid),
    ('ecff6451-e641-4baa-8f1d-d76709950025'::uuid)
) AS u(user_id)
CROSS JOIN (
  VALUES 
    ('edit_clients'), ('edit_jobs'),
    ('manage_calendar'), ('manage_quotes'), ('manage_team'), ('manage_vendors'),
    ('send_emails'),
    ('view_emails'), ('view_materials'), ('view_own_jobs'), ('view_quotes'),
    ('view_team'), ('view_vendors'), ('view_workroom')
) AS p(permission_name)
ON CONFLICT (user_id, permission_name) DO NOTHING;