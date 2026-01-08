import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateInvitation } from "@/hooks/useUserInvitations";
import { Mail, User, Shield, AlertCircle, CreditCard } from "lucide-react";
import { ROLE_PERMISSIONS, PERMISSION_LABELS } from "@/constants/permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteUserDialog = ({ open, onOpenChange }: InviteUserDialogProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<{
    invited_email: string;
    invited_name: string;
    role: string;
    customPermissions: string[];
  }>({
    invited_email: "",
    invited_name: "",
    role: "Staff",
    customPermissions: [...(ROLE_PERMISSIONS.Staff || [])],
  });
  const [confirmBilling, setConfirmBilling] = useState(false);

  const createInvitation = useCreateInvitation();

  // Check if current user is admin (admins don't need to pay for seats)
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  const requiresBilling = !isAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Require billing confirmation for non-admins
    if (requiresBilling && !confirmBilling) {
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
      skipBilling: isAdmin, // Admins don't need to add seats
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          invited_email: "",
          invited_name: "",
          role: "Staff",
          customPermissions: [...(ROLE_PERMISSIONS.Staff || [])],
        });
        setConfirmBilling(false);
      },
    });
  };

  const handleRoleChange = (role: string) => {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    setFormData(prev => ({
      ...prev,
      role,
      customPermissions: [...rolePermissions],
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
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your team with specific permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Billing warning for non-admin users */}
          {requiresBilling && (
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
              <CreditCard className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Additional seat charge:</strong> Adding a team member will add <strong>£99/month</strong> to your subscription. 
                This will be prorated for the current billing period.
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
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
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
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Billing confirmation checkbox for non-admins */}
          {requiresBilling && (
            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="confirm-billing"
                checked={confirmBilling}
                onCheckedChange={(checked) => setConfirmBilling(checked as boolean)}
              />
              <Label htmlFor="confirm-billing" className="text-sm leading-relaxed cursor-pointer">
                I understand that adding this team member will add <strong>£99/month</strong> to my subscription, 
                prorated for the current billing period.
              </Label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createInvitation.isPending || (requiresBilling && !confirmBilling)}
            >
              {createInvitation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};