import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Users, Eye, Search, Save, RotateCcw, Info, AlertTriangle } from "lucide-react";

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

const PERMISSION_CATEGORIES = {
  jobs: { label: 'Jobs & Quotes', icon: '💼', color: 'bg-blue-500' },
  clients: { label: 'Client Management', icon: '👥', color: 'bg-green-500' },
  calendar: { label: 'Calendar & Appointments', icon: '📅', color: 'bg-purple-500' },
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

export const PermissionManager = () => {
  const { data: users = [] } = useUsers();
  const { mutate: updateUser } = useUpdateUser();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("role-based");
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const selectedUser = users.find(user => user.id === selectedUserId);
  
  // Initialize custom permissions when user is selected
  useEffect(() => {
    if (selectedUser) {
      const rolePermissions = ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS] || [];
      setCustomPermissions([...rolePermissions]);
      setHasChanges(false);
    }
  }, [selectedUser]);

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

  const handleRoleChange = (newRole: string) => {
    if (!selectedUser) return;

    updateUser({
      userId: selectedUser.id,
      role: newRole
    });
    
    // Update local permissions to match new role
    const newRolePermissions = ROLE_PERMISSIONS[newRole as keyof typeof ROLE_PERMISSIONS] || [];
    setCustomPermissions([...newRolePermissions]);
    setHasChanges(false);
    
    toast({
      title: "Role updated",
      description: `User role changed to ${newRole}. Permissions updated automatically.`,
    });
  };

  const handlePermissionToggle = (permission: string, enabled: boolean) => {
    const newPermissions = enabled 
      ? [...customPermissions, permission]
      : customPermissions.filter(p => p !== permission);
    
    setCustomPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSaveCustomPermissions = () => {
    if (!selectedUser) return;
    
    // Here we would need to implement custom permission saving
    // For now, we'll show a toast indicating the feature
    toast({
      title: "Custom permissions",
      description: "Custom permission override will be implemented in the next update.",
    });
    setHasChanges(false);
  };

  const handleResetToRole = () => {
    if (!selectedUser) return;
    
    const rolePermissions = ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS] || [];
    setCustomPermissions([...rolePermissions]);
    setHasChanges(false);
  };

  const checkPermissionDependencies = (permission: string): string[] => {
    const details = PERMISSION_DETAILS[permission as keyof typeof PERMISSION_DETAILS];
    if (!details?.required) return [];
    
    return details.required.filter(req => !customPermissions.includes(req));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Owner': return 'default';
      case 'Admin': return 'secondary';
      case 'Manager': return 'outline';
      case 'Staff': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permission Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions for your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select User</label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user to manage..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.name}</span>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className="space-y-6">
            {/* Current User Info */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                {selectedUser.role}
              </Badge>
            </div>

            {/* Permission Management Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="role-based">Role-Based</TabsTrigger>
                <TabsTrigger value="custom">Custom Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="role-based" className="space-y-4 mt-4">
                {/* Role Change */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Change Role</label>
                  <Select value={selectedUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Permissions Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium">Permissions for {selectedUser.role}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS]?.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2 p-2 border rounded bg-muted/20">
                        <Checkbox checked={true} disabled />
                        <span className="text-sm">{PERMISSION_DETAILS[permission as keyof typeof PERMISSION_DETAILS]?.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-4">
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

                {/* Changes Alert */}
                {hasChanges && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>You have unsaved permission changes.</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleResetToRole}>
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                        <Button size="sm" onClick={handleSaveCustomPermissions}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Permission Categories */}
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([categoryKey, permissions]) => {
                    const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
                    if (!category || permissions.length === 0) return null;

                    return (
                      <div key={categoryKey} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <h5 className="font-medium text-sm">{category.label}</h5>
                          <span className="text-xs text-muted-foreground">({permissions.length})</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 pl-5">
                          {permissions.map(([permissionKey, details]) => {
                            const isEnabled = customPermissions.includes(permissionKey);
                            const missingDeps = checkPermissionDependencies(permissionKey);
                            const hasWarning = details.warning;
                            
                            return (
                              <div key={permissionKey} className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors ${isEnabled ? 'bg-muted/10' : ''}`}>
                                <Checkbox
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => handlePermissionToggle(permissionKey, !!checked)}
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
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Role Guide */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Role Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Badge variant="default">Owner</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Full system access including user management and all settings
              </p>
            </div>
            <div className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Badge variant="secondary">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Most permissions except sensitive business settings
              </p>
            </div>
            <div className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Badge variant="outline">Manager</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Day-to-day operations, inventory, and client management
              </p>
            </div>
            <div className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Badge variant="secondary">Staff</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Basic operations like viewing and creating jobs/clients
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};