import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useCustomPermissions, useUpdateCustomPermissions } from "@/hooks/useCustomPermissions";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, Save, RotateCcw, Info } from "lucide-react";
import { PermissionGrid } from "./PermissionGrid";
import { RolePermissionPreview } from "./RolePermissionPreview";
import { RoleGuide } from "./RoleGuide";
import { PermissionAuditLog } from "./PermissionAuditLog";
import { BulkPermissionManager } from "./BulkPermissionManager";
import { PermissionTemplates } from "./PermissionTemplates";
import { PermissionComparison } from "./PermissionComparison";
import { RealtimePermissionUpdates } from "./RealtimePermissionUpdates";
import { linkUserToAccount } from "@/hooks/useAccountLinking";

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

export const PermissionManager = () => {
  const { data: users = [] } = useUsers();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: updateCustomPermissions } = useUpdateCustomPermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("role-based");
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: currentCustomPermissions = [] } = useCustomPermissions(selectedUserId);

  const selectedUser = users.find(user => user.id === selectedUserId);
  
  // Ensure user is linked when selected so RLS and visibility work as expected
  useEffect(() => {
    const link = async () => {
      if (selectedUserId) {
        try {
          await linkUserToAccount(selectedUserId);
        } catch (e) {
          console.warn("Failed to link selected user:", selectedUserId, e);
        }
      }
    };
    link();
  }, [selectedUserId]);

  // Initialize custom permissions when user is selected
  useEffect(() => {
    if (selectedUser) {
      // Use existing custom permissions if they exist, otherwise use role permissions
      if (currentCustomPermissions.length > 0) {
        setCustomPermissions([...currentCustomPermissions]);
      } else {
        const rolePermissions = ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS] || [];
        setCustomPermissions([...rolePermissions]);
      }
      setHasChanges(false);
    }
  }, [selectedUser, currentCustomPermissions]);


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
    
    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["custom-permissions", selectedUser.id] });
    
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

  const handleSaveCustomPermissions = async () => {
    if (!selectedUser) return;

    try {
      // Link first to ensure permissions are scoped to the account and seeded if needed
      await linkUserToAccount(selectedUser.id);

      updateCustomPermissions({
        userId: selectedUser.id,
        permissions: customPermissions
      });

      setHasChanges(false);
    } catch (e) {
      console.error("Failed to save permissions:", e);
      toast({
        title: "Error",
        description: "Could not link user to account to save permissions.",
        variant: "destructive",
      });
    }
  };

  const handleResetToRole = () => {
    if (!selectedUser) return;
    
    const rolePermissions = ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS] || [];
    setCustomPermissions([...rolePermissions]);
    setHasChanges(false);
  };

  const handleApplyTemplate = (templatePermissions: string[]) => {
    setCustomPermissions([...templatePermissions]);
    setHasChanges(true);
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
            <SelectContent className="z-[9999] bg-popover border border-border shadow-lg">
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
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="role-based">Roles</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="comparison">Compare</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
                <TabsTrigger value="realtime">Live</TabsTrigger>
              </TabsList>

              <TabsContent value="role-based" className="space-y-4 mt-4">
                {/* Role Change */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Change Role</label>
                  <Select value={selectedUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-popover border border-border shadow-lg">
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <RolePermissionPreview role={selectedUser.role} />
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-4">
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

                <PermissionGrid 
                  permissions={customPermissions}
                  onToggle={handlePermissionToggle}
                />
              </TabsContent>

              <TabsContent value="templates" className="space-y-4 mt-4">
                <PermissionTemplates onApplyTemplate={handleApplyTemplate} />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4 mt-4">
                <PermissionComparison />
              </TabsContent>

              <TabsContent value="audit" className="space-y-4 mt-4">
                <PermissionAuditLog userId={selectedUser.id} />
              </TabsContent>

              <TabsContent value="realtime" className="space-y-4 mt-4">
                <RealtimePermissionUpdates />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Bulk Operations Section */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Bulk Operations</h4>
          <BulkPermissionManager />
        </div>

        <RoleGuide />
      </CardContent>
    </Card>
  );
};
