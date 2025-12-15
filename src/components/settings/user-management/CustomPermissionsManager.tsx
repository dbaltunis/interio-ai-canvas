import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useCustomPermissions, useUpdateCustomPermissions } from "@/hooks/useCustomPermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { useState } from "react";
import { 
  PERMISSION_DETAILS, 
  PERMISSION_CATEGORIES, 
  getPermissionsByCategory,
  getPermissionsForRole 
} from "@/constants/permissions";

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
  if (userRole === 'Owner' || userRole === 'System Owner') {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
        <p className="font-medium">Owner accounts have full access</p>
        <p className="text-sm">Permissions cannot be restricted for this role.</p>
      </div>
    );
  }

  const permissionsByCategory = getPermissionsByCategory();
  const roleDefaults = getPermissionsForRole(userRole);

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    setPendingChanges(prev => new Set([...prev, permissionId]));
    
    try {
      const permission = PERMISSION_DETAILS[permissionId];
      let permissionsToUpdate = [permissionId];
      
      // If enabling, also enable required permissions
      if (enabled && permission?.required?.length) {
        const missingRequired = permission.required.filter(
          req => !userPermissions?.includes(req)
        );
        if (missingRequired.length > 0) {
          permissionsToUpdate = [...missingRequired, permissionId];
          toast.info(`Also enabled: ${missingRequired.map(r => PERMISSION_DETAILS[r]?.label).join(', ')}`);
        }
      }

      const newPermissions = enabled
        ? [...(userPermissions || []), ...permissionsToUpdate].filter((v, i, a) => a.indexOf(v) === i)
        : (userPermissions || []).filter(p => !permissionsToUpdate.includes(p));

      await updatePermissions.mutateAsync({
        userId,
        permissions: newPermissions,
      });
      
      toast.success("Permission updated");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permission");
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

  const isRoleDefault = (permissionId: string) => {
    return roleDefaults.includes(permissionId);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-muted">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Customize permissions for <strong>{userName}</strong>. 
          Default permissions for {userRole} role are shown with a badge.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {Object.entries(permissionsByCategory).map(([categoryKey, permissions]) => {
          const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
          if (!category) return null;
          
          const enabledCount = permissions.filter(p => isPermissionEnabled(p.key)).length;
          
          return (
            <div key={categoryKey} className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b">
                <span className="text-lg">{category.icon}</span>
                <h4 className="font-medium">{category.label}</h4>
                <Badge variant="outline" className="text-xs ml-auto">
                  {enabledCount}/{permissions.length}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {permissions.map(({ key, details }) => {
                  const isEnabled = isPermissionEnabled(key);
                  const isPending = pendingChanges.has(key);
                  const isDefault = isRoleDefault(key);
                  
                  return (
                    <div 
                      key={key}
                      className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-colors ${
                        isEnabled ? 'bg-muted/30 border-primary/20' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Label 
                            htmlFor={`perm-${key}`} 
                            className="font-medium cursor-pointer"
                          >
                            {details.label}
                          </Label>
                          {details.scope && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                details.scope === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                details.scope === 'assigned' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {details.scope === 'all' ? 'All' : 
                               details.scope === 'assigned' ? 'Assigned Only' : 
                               'Own Only'}
                            </Badge>
                          )}
                          {isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                          {details.warning && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {details.description}
                        </p>
                      </div>
                      <Switch
                        id={`perm-${key}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handlePermissionToggle(key, checked)}
                        disabled={updatePermissions.isPending || isLoading || isPending}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
