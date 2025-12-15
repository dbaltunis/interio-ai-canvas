/**
 * Centralized Permission System
 * Single source of truth for all role permissions and permission details
 * Keep this in sync with database function get_default_permissions_for_role
 */

// Permission Categories with display metadata
export const PERMISSION_CATEGORIES = {
  jobs: { label: 'Jobs & Quotes', icon: '💼', color: 'bg-blue-500' },
  clients: { label: 'Client Management', icon: '👥', color: 'bg-green-500' },
  calendar: { label: 'Calendar & Appointments', icon: '📅', color: 'bg-primary' },
  inventory: { label: 'Inventory', icon: '📦', color: 'bg-orange-500' },
  treatments: { label: 'Window Treatments', icon: '🪟', color: 'bg-teal-500' },
  analytics: { label: 'Analytics & Reports', icon: '📊', color: 'bg-indigo-500' },
  settings: { label: 'Settings', icon: '⚙️', color: 'bg-gray-500' },
  admin: { label: 'Administration', icon: '🔐', color: 'bg-red-500' },
  profile: { label: 'Profile', icon: '👤', color: 'bg-cyan-500' },
  communication: { label: 'Communication', icon: '💬', color: 'bg-purple-500' },
  financial: { label: 'Financial', icon: '💰', color: 'bg-yellow-500' },
  team: { label: 'Team Management', icon: '👥', color: 'bg-pink-500' },
} as const;

// Permission details with labels, descriptions, categories, dependencies, and warnings
export const PERMISSION_DETAILS: Record<string, {
  label: string;
  description: string;
  category: keyof typeof PERMISSION_CATEGORIES;
  required: string[];
  warning?: boolean;
}> = {
  // Jobs & Quotes
  view_jobs: { label: 'View Jobs', description: 'Can see all jobs and quotes', category: 'jobs', required: [] },
  create_jobs: { label: 'Create Jobs', description: 'Can create new jobs and quotes', category: 'jobs', required: ['view_jobs'] },
  delete_jobs: { label: 'Delete Jobs', description: 'Can permanently delete jobs', category: 'jobs', required: ['view_jobs'], warning: true },
  view_all_jobs: { label: 'View All Jobs', description: 'Can see jobs from all team members', category: 'jobs', required: ['view_jobs'] },
  view_all_projects: { label: 'View All Projects', description: 'Can see projects from all team members', category: 'jobs', required: ['view_jobs'] },
  edit_all_jobs: { label: 'Edit All Jobs', description: 'Can edit jobs from all team members', category: 'jobs', required: ['view_jobs'] },
  edit_own_jobs: { label: 'Edit Own Jobs', description: 'Can edit own jobs only', category: 'jobs', required: ['view_jobs'] },
  
  // Client Management
  view_clients: { label: 'View Clients', description: 'Can see client information', category: 'clients', required: [] },
  create_clients: { label: 'Create Clients', description: 'Can add new clients', category: 'clients', required: ['view_clients'] },
  delete_clients: { label: 'Delete Clients', description: 'Can permanently delete clients', category: 'clients', required: ['view_clients'], warning: true },
  view_all_clients: { label: 'View All Clients', description: 'Can see clients from all team members', category: 'clients', required: ['view_clients'] },
  edit_all_clients: { label: 'Edit All Clients', description: 'Can edit clients from all team members', category: 'clients', required: ['view_clients'] },
  edit_own_clients: { label: 'Edit Own Clients', description: 'Can edit own clients only', category: 'clients', required: ['view_clients'] },
  
  // Calendar & Appointments
  view_calendar: { label: 'View Calendar', description: 'Can see appointments and calendar', category: 'calendar', required: [] },
  create_appointments: { label: 'Create Appointments', description: 'Can schedule new appointments', category: 'calendar', required: ['view_calendar'] },
  delete_appointments: { label: 'Delete Appointments', description: 'Can cancel appointments', category: 'calendar', required: ['view_calendar'] },
  
  // Inventory
  view_inventory: { label: 'View Inventory', description: 'Can see inventory items', category: 'inventory', required: [] },
  manage_inventory: { label: 'Manage Inventory', description: 'Can add, edit, and remove inventory', category: 'inventory', required: ['view_inventory'] },
  
  // Window Treatments
  view_window_treatments: { label: 'View Treatments', description: 'Can see treatment templates', category: 'treatments', required: [] },
  manage_window_treatments: { label: 'Manage Treatments', description: 'Can create and edit treatment templates', category: 'treatments', required: ['view_window_treatments'] },
  
  // Analytics
  view_analytics: { label: 'View Analytics', description: 'Can see reports and analytics', category: 'analytics', required: [] },
  
  // Settings
  view_settings: { label: 'View Settings', description: 'Can access settings pages', category: 'settings', required: [] },
  manage_settings: { label: 'Manage Settings', description: 'Can modify business settings', category: 'settings', required: ['view_settings'] },
  
  // Administration
  manage_users: { label: 'Manage Users', description: 'Can invite and manage team members', category: 'admin', required: [], warning: true },
  manage_admin_accounts: { label: 'Manage Admin Accounts', description: 'Can manage admin-level accounts', category: 'admin', required: ['manage_users'], warning: true },
  view_all_accounts: { label: 'View All Accounts', description: 'Can view all accounts in the system', category: 'admin', required: [], warning: true },
  manage_system_settings: { label: 'Manage System Settings', description: 'Can modify system-wide settings', category: 'admin', required: ['manage_settings'], warning: true },
  
  // Profile
  view_profile: { label: 'View Profile', description: 'Can access own profile settings', category: 'profile', required: [] },
  
  // Shopify / Online Store
  view_shopify: { label: 'View Online Store', description: 'Can see Shopify store data', category: 'settings', required: [] },
  manage_shopify: { label: 'Manage Online Store', description: 'Can manage Shopify store settings', category: 'settings', required: ['view_shopify'] },
  
  // Emails
  view_emails: { label: 'View Emails', description: 'Can see email communications', category: 'communication', required: [] },
  manage_emails: { label: 'Manage Emails', description: 'Can send and manage email communications', category: 'communication', required: ['view_emails'] },
  
  // NEW: Communication - Messages
  view_messages: { label: 'View Messages', description: 'Can see team messages and communication', category: 'communication', required: [] },
  
  // NEW: Financial - Markups
  view_markups: { label: 'View Markups', description: 'Can see cost prices, profit margins, and markups in quotes', category: 'financial', required: ['view_jobs'], warning: true },
  
  // NEW: Team - Performance
  view_team_performance: { label: 'View Team Performance', description: 'Can see other team members sales KPIs and metrics', category: 'team', required: [], warning: true },
};

// Permission labels for quick lookup
export const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PERMISSION_DETAILS).map(([key, details]) => [key, details.label])
);

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'System Owner': [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_shopify', 'manage_shopify',
    'view_emails', 'manage_emails',
    'view_profile',
    'manage_admin_accounts', 'view_all_accounts', 'manage_system_settings',
    'view_messages', 'view_markups', 'view_team_performance'
  ],
  Owner: [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_shopify', 'manage_shopify',
    'view_emails', 'manage_emails',
    'view_profile',
    'view_messages', 'view_markups', 'view_team_performance'
  ],
  Admin: [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_shopify', 'manage_shopify',
    'view_emails', 'manage_emails',
    'view_profile',
    'view_messages', 'view_markups', 'view_team_performance'
  ],
  Manager: [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'view_all_clients',
    'view_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings',
    'view_emails', 'manage_emails',
    'view_profile',
    'view_messages', 'view_markups', 'view_team_performance'
  ],
  Staff: [
    'view_jobs', 'create_jobs', 'edit_own_jobs',
    'view_clients', 'create_clients', 'edit_own_clients',
    'view_calendar',
    'view_inventory',
    'view_window_treatments',
    'view_settings',
    'view_emails',
    'view_profile',
    'view_messages' // Staff gets messages but NOT view_markups or view_team_performance
  ],
  User: [
    'view_profile'
  ]
};

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type PermissionName = keyof typeof PERMISSION_DETAILS;

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: string): string[] => {
  return ROLE_PERMISSIONS[role] || ['view_profile'];
};

// Helper function to check if a permission exists
export const isValidPermission = (permission: string): permission is PermissionName => {
  return permission in PERMISSION_DETAILS;
};

// Get all permission names
export const ALL_PERMISSIONS = Object.keys(PERMISSION_DETAILS) as PermissionName[];
