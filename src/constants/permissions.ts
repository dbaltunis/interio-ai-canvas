/**
 * Centralized Permission System
 * Single source of truth for all role permissions and permission details
 * 
 * Scope indicators:
 * - "All" = can access everyone's data in the organization
 * - "Assigned" = can only access data assigned to them
 * - "Own" = can only access data they created
 */

// Permission Categories with display metadata
export const PERMISSION_CATEGORIES = {
  jobs: { label: 'Jobs & Quotes', icon: '📋', color: 'bg-blue-500' },
  clients: { label: 'Clients', icon: '👥', color: 'bg-green-500' },
  calendar: { label: 'Calendar', icon: '📅', color: 'bg-primary' },
  inventory: { label: 'Inventory & Products', icon: '📦', color: 'bg-orange-500' },
  financial: { label: 'Financial & Pricing', icon: '💰', color: 'bg-yellow-500' },
  team: { label: 'Team', icon: '👤', color: 'bg-pink-500' },
  settings: { label: 'Settings', icon: '⚙️', color: 'bg-gray-500' },
} as const;

// Permission details with labels, descriptions, categories, dependencies, and warnings
export const PERMISSION_DETAILS: Record<string, {
  label: string;
  description: string;
  category: keyof typeof PERMISSION_CATEGORIES;
  required: string[];
  warning?: boolean;
  scope?: 'all' | 'assigned' | 'own';
}> = {
  // ===== JOBS & QUOTES =====
  view_all_jobs: { 
    label: 'View All Jobs', 
    description: 'See all jobs created by any team member', 
    category: 'jobs', 
    required: [],
    scope: 'all'
  },
  view_assigned_jobs: { 
    label: 'View Assigned Jobs', 
    description: 'See only jobs assigned to them', 
    category: 'jobs', 
    required: [],
    scope: 'assigned'
  },
  create_jobs: { 
    label: 'Create Jobs', 
    description: 'Create new jobs and quotes', 
    category: 'jobs', 
    required: [] 
  },
  edit_all_jobs: { 
    label: 'Edit Any Job', 
    description: 'Modify jobs created by any team member', 
    category: 'jobs', 
    required: [],
    scope: 'all'
  },
  edit_assigned_jobs: { 
    label: 'Edit Assigned Jobs', 
    description: 'Modify only jobs assigned to them', 
    category: 'jobs', 
    required: [],
    scope: 'assigned'
  },
  delete_jobs: { 
    label: 'Delete Jobs', 
    description: 'Permanently remove jobs (cannot be undone)', 
    category: 'jobs', 
    required: [], 
    warning: true 
  },
  
  // ===== CLIENTS =====
  view_all_clients: { 
    label: 'View All Clients', 
    description: 'See all clients in the organization', 
    category: 'clients', 
    required: [],
    scope: 'all'
  },
  view_assigned_clients: { 
    label: 'View Assigned Clients', 
    description: 'See only clients assigned to them', 
    category: 'clients', 
    required: [],
    scope: 'assigned'
  },
  create_clients: { 
    label: 'Create Clients', 
    description: 'Add new clients to the system', 
    category: 'clients', 
    required: [] 
  },
  edit_all_clients: { 
    label: 'Edit Any Client', 
    description: 'Modify any client record', 
    category: 'clients', 
    required: [],
    scope: 'all'
  },
  edit_assigned_clients: { 
    label: 'Edit Assigned Clients', 
    description: 'Modify only clients assigned to them', 
    category: 'clients', 
    required: [],
    scope: 'assigned'
  },
  delete_clients: { 
    label: 'Delete Clients', 
    description: 'Permanently remove clients (cannot be undone)', 
    category: 'clients', 
    required: [], 
    warning: true 
  },
  
  // ===== CALENDAR =====
  view_all_calendar: { 
    label: 'View Team Calendar', 
    description: 'See appointments from all team members', 
    category: 'calendar', 
    required: [],
    scope: 'all'
  },
  view_own_calendar: { 
    label: 'View Own Calendar', 
    description: 'See only their own appointments', 
    category: 'calendar', 
    required: [],
    scope: 'own'
  },
  create_appointments: { 
    label: 'Create Appointments', 
    description: 'Schedule new appointments', 
    category: 'calendar', 
    required: [] 
  },
  
  // ===== INVENTORY & PRODUCTS =====
  view_inventory: { 
    label: 'View Inventory', 
    description: 'Browse products, fabrics, and materials', 
    category: 'inventory', 
    required: [] 
  },
  manage_inventory: { 
    label: 'Manage Inventory', 
    description: 'Add, edit, and delete products', 
    category: 'inventory', 
    required: ['view_inventory'] 
  },
  view_templates: { 
    label: 'View Templates', 
    description: 'See treatment templates and pricing', 
    category: 'inventory', 
    required: [] 
  },
  manage_templates: { 
    label: 'Manage Templates', 
    description: 'Create and modify treatment templates', 
    category: 'inventory', 
    required: ['view_templates'] 
  },
  
  // ===== FINANCIAL & PRICING =====
  view_selling_prices: { 
    label: 'View Selling Prices', 
    description: 'See customer-facing prices in quotes', 
    category: 'financial', 
    required: [] 
  },
  view_cost_prices: { 
    label: 'View Cost Prices', 
    description: 'See supplier costs and purchase prices', 
    category: 'financial', 
    required: [], 
    warning: true 
  },
  view_profit_margins: { 
    label: 'View Profit Margins', 
    description: 'See markup percentages and profit calculations', 
    category: 'financial', 
    required: ['view_cost_prices'], 
    warning: true 
  },
  manage_pricing: { 
    label: 'Manage Pricing', 
    description: 'Change prices, markups, and discounts', 
    category: 'financial', 
    required: ['view_profit_margins'], 
    warning: true 
  },
  
  // ===== TEAM =====
  view_team_members: { 
    label: 'View Team Members', 
    description: 'See list of team members', 
    category: 'team', 
    required: [] 
  },
  view_team_performance: { 
    label: 'View Team Performance', 
    description: 'See sales metrics and KPIs for all team members', 
    category: 'team', 
    required: [], 
    warning: true 
  },
  send_team_messages: { 
    label: 'Send Team Messages', 
    description: 'Communicate with other team members', 
    category: 'team', 
    required: [] 
  },
  manage_team: { 
    label: 'Manage Team', 
    description: 'Invite users, change roles, and set permissions', 
    category: 'team', 
    required: [], 
    warning: true 
  },
  
  // ===== SETTINGS =====
  view_settings: { 
    label: 'View Settings', 
    description: 'Access settings pages (read-only)', 
    category: 'settings', 
    required: [] 
  },
  manage_business_settings: { 
    label: 'Manage Business Settings', 
    description: 'Change company info, tax rates, units', 
    category: 'settings', 
    required: ['view_settings'] 
  },
  manage_integrations: { 
    label: 'Manage Integrations', 
    description: 'Connect email, Shopify, and other services', 
    category: 'settings', 
    required: ['view_settings'], 
    warning: true 
  },
};

// Permission labels for quick lookup
export const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PERMISSION_DETAILS).map(([key, details]) => [key, details.label])
);

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'System Owner': [
    // Full access to everything
    'view_all_jobs', 'view_assigned_jobs', 'create_jobs', 'edit_all_jobs', 'edit_assigned_jobs', 'delete_jobs',
    'view_all_clients', 'view_assigned_clients', 'create_clients', 'edit_all_clients', 'edit_assigned_clients', 'delete_clients',
    'view_all_calendar', 'view_own_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory', 'view_templates', 'manage_templates',
    'view_selling_prices', 'view_cost_prices', 'view_profit_margins', 'manage_pricing',
    'view_team_members', 'view_team_performance', 'send_team_messages', 'manage_team',
    'view_settings', 'manage_business_settings', 'manage_integrations'
  ],
  Owner: [
    // Full access to everything
    'view_all_jobs', 'view_assigned_jobs', 'create_jobs', 'edit_all_jobs', 'edit_assigned_jobs', 'delete_jobs',
    'view_all_clients', 'view_assigned_clients', 'create_clients', 'edit_all_clients', 'edit_assigned_clients', 'delete_clients',
    'view_all_calendar', 'view_own_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory', 'view_templates', 'manage_templates',
    'view_selling_prices', 'view_cost_prices', 'view_profit_margins', 'manage_pricing',
    'view_team_members', 'view_team_performance', 'send_team_messages', 'manage_team',
    'view_settings', 'manage_business_settings', 'manage_integrations'
  ],
  Admin: [
    // Full access except some sensitive settings
    'view_all_jobs', 'view_assigned_jobs', 'create_jobs', 'edit_all_jobs', 'edit_assigned_jobs', 'delete_jobs',
    'view_all_clients', 'view_assigned_clients', 'create_clients', 'edit_all_clients', 'edit_assigned_clients', 'delete_clients',
    'view_all_calendar', 'view_own_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory', 'view_templates', 'manage_templates',
    'view_selling_prices', 'view_cost_prices', 'view_profit_margins', 'manage_pricing',
    'view_team_members', 'view_team_performance', 'send_team_messages', 'manage_team',
    'view_settings', 'manage_business_settings'
  ],
  Manager: [
    // Team oversight, can see costs but not manage all settings
    'view_all_jobs', 'view_assigned_jobs', 'create_jobs', 'edit_all_jobs', 'edit_assigned_jobs',
    'view_all_clients', 'view_assigned_clients', 'create_clients', 'edit_all_clients', 'edit_assigned_clients',
    'view_all_calendar', 'view_own_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory', 'view_templates',
    'view_selling_prices', 'view_cost_prices', 'view_profit_margins',
    'view_team_members', 'view_team_performance', 'send_team_messages',
    'view_settings'
  ],
  Staff: [
    // Limited to assigned work only, no cost visibility
    'view_assigned_jobs', 'create_jobs', 'edit_assigned_jobs',
    'view_assigned_clients', 'create_clients', 'edit_assigned_clients',
    'view_own_calendar', 'create_appointments',
    'view_inventory', 'view_templates',
    'view_selling_prices', // Can see what to quote customers
    'view_team_members', 'send_team_messages',
    'view_settings'
  ],
  User: [
    // Minimal access
    'view_assigned_jobs',
    'view_assigned_clients',
    'view_own_calendar',
    'view_settings'
  ]
};

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type PermissionName = keyof typeof PERMISSION_DETAILS;

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: string): string[] => {
  return ROLE_PERMISSIONS[role] || ['view_settings'];
};

// Helper function to check if a permission exists
export const isValidPermission = (permission: string): permission is PermissionName => {
  return permission in PERMISSION_DETAILS;
};

// Get all permission names
export const ALL_PERMISSIONS = Object.keys(PERMISSION_DETAILS) as PermissionName[];

// Group permissions by category for UI display
export const getPermissionsByCategory = () => {
  const grouped: Record<string, { key: string; details: typeof PERMISSION_DETAILS[string] }[]> = {};
  
  for (const [key, details] of Object.entries(PERMISSION_DETAILS)) {
    const category = details.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, details });
  }
  
  return grouped;
};
