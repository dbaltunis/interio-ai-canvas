import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";

const PERMISSION_CATEGORIES = {
  jobs: { label: 'Jobs & Quotes', icon: '💼', color: 'bg-blue-500' },
  clients: { label: 'Client Management', icon: '👥', color: 'bg-green-500' },
  calendar: { label: 'Calendar & Appointments', icon: '📅', color: 'bg-primary' },
  inventory: { label: 'Inventory', icon: '📦', color: 'bg-orange-500' },
  treatments: { label: 'Window Treatments', icon: '🪟', color: 'bg-teal-500' },
  analytics: { label: 'Analytics & Reports', icon: '📊', color: 'bg-indigo-500' },
  settings: { label: 'Settings', icon: '⚙️', color: 'bg-gray-500' },
  admin: { label: 'Administration', icon: '🔐', color: 'bg-red-500' },
  profile: { label: 'Profile', icon: '👤', color: 'bg-cyan-500' }
};

const PERMISSION_DETAILS = {
  view_jobs: { label: 'View Jobs', description: 'Can see all jobs and quotes', category: 'jobs', required: [] },
  create_jobs: { label: 'Create Jobs', description: 'Can create new jobs and quotes', category: 'jobs', required: ['view_jobs'] },
  delete_jobs: { label: 'Delete Jobs', description: 'Can permanently delete jobs', category: 'jobs', required: ['view_jobs'], warning: true },
  view_clients: { label: 'View Clients', description: 'Can see client information', category: 'clients', required: [] },
  create_clients: { label: 'Create Clients', description: 'Can add new clients', category: 'clients', required: ['view_clients'] },
  delete_clients: { label: 'Delete Clients', description: 'Can permanently delete clients', category: 'clients', required: ['view_clients'], warning: true },
  view_calendar: { label: 'View Calendar', description: 'Can see appointments and calendar', category: 'calendar', required: [] },
  create_appointments: { label: 'Create Appointments', description: 'Can schedule new appointments', category: 'calendar', required: ['view_calendar'] },
  delete_appointments: { label: 'Delete Appointments', description: 'Can cancel appointments', category: 'calendar', required: ['view_calendar'] },
  view_inventory: { label: 'View Inventory', description: 'Can see inventory items', category: 'inventory', required: [] },
  manage_inventory: { label: 'Manage Inventory', description: 'Can add, edit, and remove inventory', category: 'inventory', required: ['view_inventory'] },
  view_window_treatments: { label: 'View Treatments', description: 'Can see treatment templates', category: 'treatments', required: [] },
  manage_window_treatments: { label: 'Manage Treatments', description: 'Can create and edit treatment templates', category: 'treatments', required: ['view_window_treatments'] },
  view_analytics: { label: 'View Analytics', description: 'Can see reports and analytics', category: 'analytics', required: [] },
  view_settings: { label: 'View Settings', description: 'Can access settings pages', category: 'settings', required: [] },
  manage_settings: { label: 'Manage Settings', description: 'Can modify business settings', category: 'settings', required: ['view_settings'] },
  manage_users: { label: 'Manage Users', description: 'Can invite and manage team members', category: 'admin', required: [], warning: true },
  view_profile: { label: 'View Profile', description: 'Can access own profile settings', category: 'profile', required: [] }
};

interface PermissionGridProps {
  permissions: string[];
  onToggle: (permission: string, enabled: boolean) => void;
}

export const PermissionGrid = ({ permissions, onToggle }: PermissionGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    const allPermissions = Object.entries(PERMISSION_DETAILS);
    if (!searchTerm) return allPermissions;
    
    return allPermissions.filter(([key, details]) => 
      details.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, Array<[string, any]>> = {};
    filteredPermissions.forEach(([key, details]) => {
      if (!grouped[details.category]) {
        grouped[details.category] = [];
      }
      grouped[details.category].push([key, details]);
    });
    return grouped;
  }, [filteredPermissions]);

  const checkPermissionDependencies = (permission: string): string[] => {
    const details = PERMISSION_DETAILS[permission as keyof typeof PERMISSION_DETAILS];
    if (!details?.required) return [];
    
    return details.required.filter(req => !permissions.includes(req));
  };

  return (
    <div className="space-y-4">
      {/* Search Permissions */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Permission Categories */}
      <div className="space-y-4">
        {Object.entries(permissionsByCategory).map(([categoryKey, categoryPermissions]) => {
          const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
          if (!category || categoryPermissions.length === 0) return null;

          return (
            <div key={categoryKey} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <h5 className="font-medium text-sm">{category.label}</h5>
                <span className="text-xs text-muted-foreground">({categoryPermissions.length})</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pl-5">
                {categoryPermissions.map(([permissionKey, details]) => {
                  const isEnabled = permissions.includes(permissionKey);
                  const missingDeps = checkPermissionDependencies(permissionKey);
                  const hasWarning = details.warning;
                  
                  return (
                    <div key={permissionKey} className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors ${isEnabled ? 'bg-muted/10' : ''}`}>
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) => onToggle(permissionKey, !!checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{details.label}</span>
                          {hasWarning && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{details.description}</p>
                        {missingDeps.length > 0 && isEnabled && (
                          <p className="text-xs text-red-500">
                            Missing dependencies: {missingDeps.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-3" />
            </div>
          );
        })}
      </div>
    </div>
  );
};