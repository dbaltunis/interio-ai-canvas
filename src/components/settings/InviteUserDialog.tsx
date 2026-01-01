import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateInvitation } from "@/hooks/useUserInvitations";
import { Mail, User, Shield } from "lucide-react";
import { ROLE_PERMISSIONS, PERMISSION_LABELS } from "@/constants/permissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteUserDialog = ({ open, onOpenChange }: InviteUserDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<{
    invited_email: string;
    invited_name: string;
    role: string;
    customPermissions: string[];
  }>({
    invited_email: "",
    invited_name: "",
    role: "Staff",
    customPermissions: [...(ROLE_PERMISSIONS.Staff || [])], // Initialize with Staff permissions
  });

  const createInvitation = useCreateInvitation();

  // Permission checks - following the same pattern as jobs
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-invite-dialog', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[InviteUserDialog] Error fetching explicit permissions:', error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check permission before submitting
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canManageTeam) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to invite team members.",
        variant: "destructive",
      });
      return;
    }
    // Don't allow submitting while permissions are loading
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }
    
    // Convert permissions array to object format expected by backend
    const permissionsObj = formData.customPermissions.reduce((acc, permission) => {
      acc[permission] = true;
      return acc;
    }, {} as Record<string, boolean>);

    createInvitation.mutate({
      invited_email: formData.invited_email,
      invited_name: formData.invited_name,
      role: formData.role,
      permissions: permissionsObj,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          invited_email: "",
          invited_name: "",
          role: "Staff",
          customPermissions: [...(ROLE_PERMISSIONS.Staff || [])], // Reset to Staff permissions
        });
      },
    });
  };

  const handleRoleChange = (role: string) => {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    setFormData(prev => ({
      ...prev,
      role,
      customPermissions: [...rolePermissions], // Always copy array to ensure state update
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      customPermissions: checked 
        ? [...prev.customPermissions, permission]
        : prev.customPermissions.filter(p => p !== permission)
    }));
  };

  const rolePermissions = ROLE_PERMISSIONS[formData.role as keyof typeof ROLE_PERMISSIONS] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Invite User
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your team with specific permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam && (
            <Alert variant="destructive">
              <AlertDescription>
                You don't have permission to invite team members.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.invited_email}
                onChange={(e) => setFormData(prev => ({ ...prev, invited_email: e.target.value }))}
                className="pl-10"
                required
                disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name (Optional)</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={formData.invited_name}
              onChange={(e) => setFormData(prev => ({ ...prev, invited_name: e.target.value }))}
              disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={handleRoleChange}
              disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-popover border border-border shadow-lg">
                <SelectItem value="Admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">Can view store revenue, sales data, and manage Shopify</span>
                  </div>
                </SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions for {formData.role}
            </Label>
            <div className="grid grid-cols-1 gap-2 pl-6 max-h-48 overflow-y-auto">
              {rolePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.customPermissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                    disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam}
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createInvitation.isPending || (explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canManageTeam)}
            >
              {createInvitation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};