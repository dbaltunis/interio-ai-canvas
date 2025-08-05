import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Users, Eye } from "lucide-react";

const ROLE_PERMISSIONS = {
  Owner: [
    'view_jobs', 'create_jobs', 'delete_jobs',
    'view_clients', 'create_clients', 'delete_clients', 
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users'
  ],
  Admin: [
    'view_jobs', 'create_jobs', 'delete_jobs',
    'view_clients', 'create_clients', 'delete_clients',
    'view_calendar', 'create_appointments', 'delete_appointments', 
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings'
  ],
  Manager: [
    'view_jobs', 'create_jobs',
    'view_clients', 'create_clients',
    'view_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics'
  ],
  Staff: [
    'view_jobs', 'create_jobs',
    'view_clients', 'create_clients', 
    'view_calendar',
    'view_inventory'
  ]
};

const PERMISSION_LABELS = {
  view_jobs: 'View Jobs',
  create_jobs: 'Create Jobs',
  delete_jobs: 'Delete Jobs',
  view_clients: 'View Clients',
  create_clients: 'Create Clients',
  delete_clients: 'Delete Clients',
  view_calendar: 'View Calendar',
  create_appointments: 'Create Appointments',
  delete_appointments: 'Delete Appointments',
  view_inventory: 'View Inventory',
  manage_inventory: 'Manage Inventory',
  view_window_treatments: 'View Window Treatments',
  manage_window_treatments: 'Manage Window Treatments',
  view_analytics: 'View Analytics',
  view_settings: 'View Settings',
  manage_settings: 'Manage Settings',
  manage_users: 'Manage Users'
};

export const PermissionManager = () => {
  const { data: users = [] } = useUsers();
  const { mutate: updateUser } = useUpdateUser();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const selectedUser = users.find(user => user.id === selectedUserId);

  const handleRoleChange = (newRole: string) => {
    if (!selectedUser) return;

    updateUser({
      userId: selectedUser.id,
      role: newRole
    });
    
    toast({
      title: "Role updated",
      description: `User role changed to ${newRole}. Permissions will be updated automatically.`,
    });
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
          <div className="space-y-4">
            {/* Current Role */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                {selectedUser.role}
              </Badge>
            </div>

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

            {/* Permissions Preview */}
            <div className="space-y-3">
              <h4 className="font-medium">Permissions for {selectedUser.role}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS]?.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox checked={true} disabled />
                    <span className="text-sm">{PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Role Guide */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Role Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Badge variant="default">Owner</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Full system access including user management and all settings
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Badge variant="secondary">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Most permissions except sensitive business settings
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Badge variant="outline">Manager</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Day-to-day operations, inventory, and client management
              </p>
            </div>
            <div className="space-y-2">
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