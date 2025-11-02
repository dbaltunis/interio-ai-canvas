import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Info, CheckCircle2, XCircle } from "lucide-react";
import { useCustomPermissions, useUpdateCustomPermissions } from "@/hooks/useCustomPermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { useState } from "react";

interface PermissionCategory {
  name: string;
  permissions: Array<{
    id: string;
    label: string;
    description: string;
    requiredBy?: string[];
  }>;
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: "Jobs & Projects",
    permissions: [
      { id: "view_jobs", label: "View Jobs", description: "View job listings" },
      { id: "create_jobs", label: "Create Jobs", description: "Create new jobs", requiredBy: ["view_jobs"] },
      { id: "delete_jobs", label: "Delete Jobs", description: "Delete jobs", requiredBy: ["view_jobs"] },
      { id: "view_all_jobs", label: "View All Jobs", description: "View jobs created by other users" },
      { id: "view_all_projects", label: "View All Projects", description: "View projects created by other users" },
    ]
  },
  {
    name: "Clients",
    permissions: [
      { id: "view_clients", label: "View Clients", description: "View client listings" },
      { id: "create_clients", label: "Create Clients", description: "Create new clients", requiredBy: ["view_clients"] },
      { id: "delete_clients", label: "Delete Clients", description: "Delete clients", requiredBy: ["view_clients"] },
      { id: "view_all_clients", label: "View All Clients", description: "View clients created by other users" },
    ]
  },
  {
    name: "Calendar & Appointments",
    permissions: [
      { id: "view_calendar", label: "View Calendar", description: "View calendar and appointments" },
      { id: "create_appointments", label: "Create Appointments", description: "Schedule appointments", requiredBy: ["view_calendar"] },
      { id: "delete_appointments", label: "Delete Appointments", description: "Remove appointments", requiredBy: ["view_calendar"] },
    ]
  },
  {
    name: "Inventory",
    permissions: [
      { id: "view_inventory", label: "View Inventory", description: "View inventory items" },
      { id: "manage_inventory", label: "Manage Inventory", description: "Add, edit, and delete inventory", requiredBy: ["view_inventory"] },
    ]
  },
  {
    name: "Window Treatments",
    permissions: [
      { id: "view_window_treatments", label: "View Treatments", description: "View window treatment templates" },
      { id: "manage_window_treatments", label: "Manage Treatments", description: "Create and edit templates", requiredBy: ["view_window_treatments"] },
    ]
  },
  {
    name: "Communications",
    permissions: [
      { id: "view_emails", label: "View Emails", description: "Access email campaigns and metrics" },
    ]
  },
  {
    name: "Integrations",
    permissions: [
      { id: "view_shopify", label: "View Online Store", description: "View Shopify integration and store data" },
      { id: "manage_shopify", label: "Manage Online Store", description: "Sync products and manage Shopify integration", requiredBy: ["view_shopify"] },
    ]
  },
  {
    name: "Analytics & Reports",
    permissions: [
      { id: "view_analytics", label: "View Analytics", description: "Access analytics and reports" },
    ]
  },
  {
    name: "System & Settings",
    permissions: [
      { id: "view_settings", label: "View Settings", description: "Access settings pages" },
      { id: "manage_settings", label: "Manage Settings", description: "Modify system settings", requiredBy: ["view_settings"] },
      { id: "manage_users", label: "Manage Users", description: "Invite and manage team members" },
    ]
  },
];

interface CustomPermissionsManagerProps {
  userId: string;
  userRole: string;
  userName: string;
}

export const CustomPermissionsManager = ({ userId, userRole, userName }: CustomPermissionsManagerProps) => {
  const { data: currentUserRole } = useUserRole();
  const { data: userPermissions, isLoading } = useCustomPermissions(userId);
  const updatePermissions = useUpdateCustomPermissions();
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());

  // Only Owner and Admin can manage custom permissions
  if (!currentUserRole?.isOwner && !currentUserRole?.isAdmin) {
    return null;
  }

  // Owner role cannot be customized
  if (userRole === 'Owner') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Custom Permissions</CardTitle>
          </div>
          <CardDescription>
            Owner accounts have all permissions by default and cannot be customized.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    setPendingChanges(prev => new Set([...prev, permissionId]));
    
    try {
      let permissionsToUpdate = [permissionId];
      
      // If enabling, check for required permissions
      if (enabled) {
        const category = PERMISSION_CATEGORIES.find(cat => 
          cat.permissions.some(p => p.id === permissionId)
        );
        const permission = category?.permissions.find(p => p.id === permissionId);
        
        if (permission?.requiredBy) {
          const missingRequired = permission.requiredBy.filter(
            req => !userPermissions?.includes(req)
          );
          if (missingRequired.length > 0) {
            permissionsToUpdate = [...missingRequired, permissionId];
            toast.info(`Added required permissions: ${missingRequired.join(', ')}`);
          }
        }
      }
      
      // If disabling, check for dependent permissions
      if (!enabled) {
        const dependents = PERMISSION_CATEGORIES
          .flatMap(cat => cat.permissions)
          .filter(p => p.requiredBy?.includes(permissionId) && userPermissions?.includes(p.id))
          .map(p => p.id);
        
        if (dependents.length > 0) {
          permissionsToUpdate = [permissionId, ...dependents];
          toast.info(`Removed dependent permissions: ${dependents.join(', ')}`);
        }
      }

      const newPermissions = enabled
        ? [...(userPermissions || []), ...permissionsToUpdate].filter((v, i, a) => a.indexOf(v) === i)
        : (userPermissions || []).filter(p => !permissionsToUpdate.includes(p));

      await updatePermissions.mutateAsync({
        userId,
        permissions: newPermissions,
      });
      
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setPendingChanges(prev => {
        const updated = new Set(prev);
        updated.delete(permissionId);
        return updated;
      });
    }
  };

  const isPermissionEnabled = (permissionId: string) => {
    return userPermissions?.includes(permissionId) || false;
  };

  const isPermissionPending = (permissionId: string) => {
    return pendingChanges.has(permissionId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Custom Permissions for {userName}</CardTitle>
            <CardDescription>
              Customize specific permissions for this {userRole}. Defaults are based on role.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <div className="font-medium mb-1">Custom Permission System</div>
            <div className="text-sm">
              Enable or disable specific permissions to override the default {userRole} role permissions.
              Some permissions require others to function properly.
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {PERMISSION_CATEGORIES.map((category) => (
            <div key={category.name} className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-base">{category.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {category.permissions.filter(p => isPermissionEnabled(p.id)).length} / {category.permissions.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {category.permissions.map((permission) => {
                  const isEnabled = isPermissionEnabled(permission.id);
                  const isPending = isPermissionPending(permission.id);
                  
                  return (
                    <div 
                      key={permission.id}
                      className="flex items-center justify-between space-x-4 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={`perm-${permission.id}`} 
                            className="text-base font-medium cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                          {isEnabled ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                        {permission.requiredBy && permission.requiredBy.length > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Required by: {permission.requiredBy.map(id => 
                              PERMISSION_CATEGORIES
                                .flatMap(c => c.permissions)
                                .find(p => p.id === id)?.label
                            ).join(', ')}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={`perm-${permission.id}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                        disabled={updatePermissions.isPending || isLoading || isPending}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md bg-muted p-4 space-y-2">
          <div className="font-medium text-sm">Current Permission Count:</div>
          <div className="text-sm">
            <span className="font-semibold text-primary">
              {userPermissions?.length || 0}
            </span>
            {" "}custom permissions active for this user
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
