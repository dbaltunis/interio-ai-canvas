import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User as UserIcon, Shield, LayoutDashboard } from "lucide-react";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/hooks/useUsers";
import { CustomPermissionsManager } from "./CustomPermissionsManager";
import { DashboardConfigManager } from "./DashboardConfigManager";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserDialog = ({ user, open, onOpenChange }: EditUserDialogProps) => {
  const { user: currentUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Staff");
  const [isActive, setIsActive] = useState(true);
  const [phone, setPhone] = useState("");

  const updateUser = useUpdateUser();
  const { toast } = useToast();

  // Permission checks - following the same pattern as jobs
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-edit-user', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', currentUser.id);
      if (error) {
        console.error('[EditUserDialog] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!currentUser && !permissionsLoading,
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

  const handleSave = async () => {
    if (!user) return;

    // Check permission before saving
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage team members.",
        variant: "destructive",
      });
      return;
    }
    // Don't allow saving while permissions are loading
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }

    // Prevent demoting Owner to a non-Owner role
    if (user.role === 'Owner' && role !== 'Owner') {
      toast({
        title: "Cannot demote Owner",
        description: "Owners cannot be changed to other roles. Transfer ownership first or delete the user.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUser.mutateAsync({
        userId: user.id,
        display_name: displayName,
        role,
        is_active: isActive,
        phone_number: phone || undefined,
      });
      
      toast({
        title: "User updated",
        description: `${displayName}'s profile has been updated successfully.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Show specific error message from database
      const errorMessage = error?.message || "Failed to update user. Please try again.";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Update local state when user prop changes
  useEffect(() => {
    if (user && open) {
      setDisplayName(user.name || "");
      setRole(user.role || "Staff");
      setIsActive(user.status === "Active");
      setPhone(user.phone || "");
    }
  }, [user, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User - {user?.name}</DialogTitle>
          <DialogDescription>
            Update user information and custom permissions.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
          {explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam && (
            <Alert variant="destructive">
              <AlertDescription>
                You don't have permission to manage team members.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name"
              disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email (Read-only)</Label>
            <Input
              id="email"
              value={user?.email || "Protected Email"}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={role} 
              onValueChange={setRole} 
              disabled={user?.role === 'Owner' || (explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-popover border border-border shadow-lg">
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
            {user?.role === 'Owner' && (
              <p className="text-xs text-muted-foreground">
                Owner role cannot be changed. Transfer ownership or delete this user first.
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateUser.isPending || !displayName.trim() || (explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam)}
            >
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            {user && (
              <CustomPermissionsManager 
                userId={user.id}
                userRole={role}
                userName={displayName || user.name || "User"}
                canManageTeam={canManageTeam}
                isPermissionLoaded={explicitPermissions !== undefined && !permissionsLoading && !roleLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="mt-4">
            {user && (
              <DashboardConfigManager 
                userId={user.id}
                userName={displayName || user.name || "User"}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};