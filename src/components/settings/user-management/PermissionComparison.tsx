import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useCustomPermissions } from "@/hooks/useCustomPermissions";
import { GitCompare, User } from "lucide-react";

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

export const PermissionComparison = () => {
  const { data: users = [] } = useUsers();
  const [user1Id, setUser1Id] = useState<string>("");
  const [user2Id, setUser2Id] = useState<string>("");
  
  const { data: user1Permissions = [] } = useCustomPermissions(user1Id);
  const { data: user2Permissions = [] } = useCustomPermissions(user2Id);
  
  const user1 = users.find(u => u.id === user1Id);
  const user2 = users.find(u => u.id === user2Id);
  
  // Get effective permissions (custom or role-based)
  const getEffectivePermissions = (user: any, customPermissions: string[]) => {
    if (customPermissions.length > 0) {
      return customPermissions;
    }
    return ROLE_PERMISSIONS[user?.role as keyof typeof ROLE_PERMISSIONS] || [];
  };
  
  const user1EffectivePermissions = user1 ? getEffectivePermissions(user1, user1Permissions) : [];
  const user2EffectivePermissions = user2 ? getEffectivePermissions(user2, user2Permissions) : [];
  
  // Calculate differences
  const allPermissions = Array.from(new Set([...user1EffectivePermissions, ...user2EffectivePermissions]));
  const commonPermissions = user1EffectivePermissions.filter(p => user2EffectivePermissions.includes(p));
  const user1OnlyPermissions = user1EffectivePermissions.filter(p => !user2EffectivePermissions.includes(p));
  const user2OnlyPermissions = user2EffectivePermissions.filter(p => !user1EffectivePermissions.includes(p));

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Owner': return 'default';
      case 'Admin': return 'secondary';
      case 'Manager': return 'outline';
      case 'Staff': return 'secondary';
      default: return 'outline';
    }
  };

  const getPermissionStatus = (permission: string) => {
    const inUser1 = user1EffectivePermissions.includes(permission);
    const inUser2 = user2EffectivePermissions.includes(permission);
    
    if (inUser1 && inUser2) return 'both';
    if (inUser1) return 'user1';
    if (inUser2) return 'user2';
    return 'neither';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'both': return 'bg-green-100 text-green-800 border-green-200';
      case 'user1': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user2': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Permission Comparison
        </CardTitle>
        <CardDescription>
          Compare permissions between two users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First User</label>
            <Select value={user1Id} onValueChange={setUser1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select first user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} disabled={user.id === user2Id}>
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Second User</label>
            <Select value={user2Id} onValueChange={setUser2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select second user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} disabled={user.id === user1Id}>
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
        </div>

        {user1 && user2 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-700">{commonPermissions.length}</div>
                <div className="text-sm text-green-600">Shared Permissions</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-700">{user1OnlyPermissions.length}</div>
                <div className="text-sm text-blue-600">Only {user1.name}</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-700">{user2OnlyPermissions.length}</div>
                <div className="text-sm text-purple-600">Only {user2.name}</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm">Both users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-sm">{user1.name} only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-sm">{user2.name} only</span>
              </div>
            </div>

            {/* Detailed Comparison */}
            <div className="space-y-3">
              <h4 className="font-medium">Detailed Permission Comparison</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allPermissions.sort().map((permission) => {
                  const status = getPermissionStatus(permission);
                  return (
                    <div key={permission} className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor(status)}`}>
                      <span className="font-medium">{permission.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        {status === 'both' && <span className="text-sm">✓ Both</span>}
                        {status === 'user1' && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-sm">{user1.name}</span>
                          </div>
                        )}
                        {status === 'user2' && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-sm">{user2.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {(!user1 || !user2) && (
          <div className="text-center text-muted-foreground py-12">
            Select two users to compare their permissions
          </div>
        )}
      </CardContent>
    </Card>
  );
};