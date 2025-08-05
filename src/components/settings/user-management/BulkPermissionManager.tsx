import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateCustomPermissions } from "@/hooks/useCustomPermissions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Save, RotateCcw } from "lucide-react";

const PERMISSION_GROUPS = {
  basic: {
    label: "Basic Access",
    permissions: ['view_jobs', 'view_clients', 'view_calendar', 'view_inventory', 'view_profile']
  },
  operations: {
    label: "Operations",
    permissions: ['create_jobs', 'create_clients', 'create_appointments', 'view_analytics']
  },
  management: {
    label: "Management",
    permissions: ['manage_inventory', 'manage_window_treatments', 'view_settings']
  },
  admin: {
    label: "Administration",
    permissions: ['delete_jobs', 'delete_clients', 'manage_settings', 'manage_users']
  }
};

export const BulkPermissionManager = () => {
  const { data: users = [] } = useUsers();
  const { mutate: updateCustomPermissions } = useUpdateCustomPermissions();
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");

  const filteredUsers = users.filter(user => 
    filterRole === "all" || user.role === filterRole
  );

  const handleUserToggle = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => 
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handlePermissionGroupToggle = (groupKey: string, checked: boolean) => {
    const group = PERMISSION_GROUPS[groupKey as keyof typeof PERMISSION_GROUPS];
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...group.permissions])]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => !group.permissions.includes(p)));
    }
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    );
  };

  const handleApplyPermissions = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to apply permissions.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Apply permissions to each selected user
      for (const userId of selectedUsers) {
        await new Promise((resolve, reject) => {
          updateCustomPermissions({
            userId,
            permissions: selectedPermissions
          }, {
            onSuccess: resolve,
            onError: reject
          });
        });
      }

      toast({
        title: "Permissions applied",
        description: `Successfully updated permissions for ${selectedUsers.length} user(s).`,
      });

      // Reset selections
      setSelectedUsers([]);
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Error applying bulk permissions:', error);
      toast({
        title: "Error",
        description: "Failed to apply permissions to some users. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSelectedUsers([]);
    setSelectedPermissions([]);
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
          <Users className="h-5 w-5" />
          Bulk Permission Management
        </CardTitle>
        <CardDescription>
          Apply permissions to multiple users at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Role</label>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Select Users ({selectedUsers.length} selected)</h4>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedUsers(filteredUsers.map(u => u.id))}
              >
                Select All
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedUsers([])}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/20">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleUserToggle(user.id, !!checked)}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="ml-2">
                    {user.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Groups */}
        <div className="space-y-3">
          <h4 className="font-medium">Permission Groups</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
              const isGroupSelected = group.permissions.every(p => selectedPermissions.includes(p));
              const isPartiallySelected = group.permissions.some(p => selectedPermissions.includes(p)) && !isGroupSelected;
              
              return (
                <div key={groupKey} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isGroupSelected}
                      // @ts-ignore - indeterminate is a valid property but not in types
                      ref={(el: any) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onCheckedChange={(checked) => handlePermissionGroupToggle(groupKey, !!checked)}
                    />
                    <span className="font-medium text-sm">{group.label}</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {group.permissions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={(checked) => handlePermissionToggle(permission, !!checked)}
                        />
                        <span className="text-xs text-muted-foreground">{permission.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleApplyPermissions}
            disabled={selectedUsers.length === 0 || selectedPermissions.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Apply to {selectedUsers.length} User(s)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};