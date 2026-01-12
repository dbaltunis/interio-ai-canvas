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
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PermissionManager = () => {
  const { user } = useAuth();
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

  // Permission checks - following the same pattern as jobs
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-permission-manager', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[PermissionManager] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if manage_team is explicitly in user_permissions table
  const hasManageTeamPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_team'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow manage if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include manage_team)
  const canManageTeam =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasManageTeamPermission
          : hasManageTeamPermission;
  
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

    // Check permission before changing role
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage team members.",
        variant: "destructive",
      });
      return;
    }
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }

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
    // Check permission before toggling
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage team permissions.",
        variant: "destructive",
      });
      return;
    }
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }

    const newPermissions = enabled 
      ? [...customPermissions, permission]
      : customPermissions.filter(p => p !== permission);
    
    setCustomPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSaveCustomPermissions = async () => {
    if (!selectedUser) return;

    // Check permission before saving
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage team permissions.",
        variant: "destructive",
      });
      return;
    }
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }

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
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={handleRoleChange}
                    disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
                  >
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleResetToRole}
                          disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveCustomPermissions}
                          disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
                        >
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
                  disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
                  userRole={selectedUser?.role}
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
