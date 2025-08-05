import { Checkbox } from "@/components/ui/checkbox";

const ROLE_PERMISSIONS = {
  Owner: [
    'view_jobs', 'create_jobs', 'delete_jobs',
    'view_clients', 'create_clients', 'delete_clients', 
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_profile'
  ],
  Admin: [
    'view_jobs', 'create_jobs', 'delete_jobs',
    'view_clients', 'create_clients', 'delete_clients',
    'view_calendar', 'create_appointments', 'delete_appointments', 
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings',
    'view_profile'
  ],
  Manager: [
    'view_jobs', 'create_jobs',
    'view_clients', 'create_clients',
    'view_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics',
    'view_profile'
  ],
  Staff: [
    'view_jobs', 'create_jobs',
    'view_clients', 'create_clients', 
    'view_calendar',
    'view_inventory',
    'view_profile'
  ]
};

const PERMISSION_DETAILS = {
  view_jobs: { label: 'View Jobs', description: 'Can see all jobs and quotes' },
  create_jobs: { label: 'Create Jobs', description: 'Can create new jobs and quotes' },
  delete_jobs: { label: 'Delete Jobs', description: 'Can permanently delete jobs' },
  view_clients: { label: 'View Clients', description: 'Can see client information' },
  create_clients: { label: 'Create Clients', description: 'Can add new clients' },
  delete_clients: { label: 'Delete Clients', description: 'Can permanently delete clients' },
  view_calendar: { label: 'View Calendar', description: 'Can see appointments and calendar' },
  create_appointments: { label: 'Create Appointments', description: 'Can schedule new appointments' },
  delete_appointments: { label: 'Delete Appointments', description: 'Can cancel appointments' },
  view_inventory: { label: 'View Inventory', description: 'Can see inventory items' },
  manage_inventory: { label: 'Manage Inventory', description: 'Can add, edit, and remove inventory' },
  view_window_treatments: { label: 'View Treatments', description: 'Can see treatment templates' },
  manage_window_treatments: { label: 'Manage Treatments', description: 'Can create and edit treatment templates' },
  view_analytics: { label: 'View Analytics', description: 'Can see reports and analytics' },
  view_settings: { label: 'View Settings', description: 'Can access settings pages' },
  manage_settings: { label: 'Manage Settings', description: 'Can modify business settings' },
  manage_users: { label: 'Manage Users', description: 'Can invite and manage team members' },
  view_profile: { label: 'View Profile', description: 'Can access own profile settings' }
};

interface RolePermissionPreviewProps {
  role: string;
}

export const RolePermissionPreview = ({ role }: RolePermissionPreviewProps) => {
  const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Permissions for {role}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {rolePermissions.map((permission) => (
          <div key={permission} className="flex items-center space-x-2 p-2 border rounded bg-muted/20">
            <Checkbox checked={true} disabled />
            <span className="text-sm">{PERMISSION_DETAILS[permission as keyof typeof PERMISSION_DETAILS]?.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};