import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateInvitation } from "@/hooks/useUserInvitations";
import { Mail, User, Shield, Info } from "lucide-react";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_PERMISSIONS = {
  Admin: [
    'view_jobs', 'create_jobs', 'delete_jobs',
    'view_clients', 'create_clients', 'delete_clients',
    'view_calendar', 'create_appointments', 'delete_appointments', 
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings',
    'view_shopify', 'manage_shopify',
    'view_emails',
    'view_profile'
  ],
  Manager: [
    'view_jobs', 'create_jobs',
    'view_clients', 'create_clients',
    'view_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics',
    'view_shopify',
    'view_emails',
    'view_profile'
  ],
  Staff: [
    'view_jobs', 'create_jobs',
    'view_clients', 'create_clients', 
    'view_calendar',
    'view_inventory', 'view_profile'
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
  manage_users: 'Manage Users',
  view_shopify: 'View Online Store',
  manage_shopify: 'Manage Online Store',
  view_emails: 'View Emails',
  view_profile: 'View Profile'
};

export const InviteDialog = ({ open, onOpenChange }: InviteDialogProps) => {
  const [formData, setFormData] = useState({
    invited_email: "",
    invited_name: "",
    role: "Staff",
    customPermissions: [...(ROLE_PERMISSIONS.Staff || [])],
  });

  const createInvitation = useCreateInvitation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invited_email) {
      return;
    }

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
          customPermissions: [...(ROLE_PERMISSIONS.Staff || [])],
        });
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
            Send an invitation email with a secure link to join your team
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            The invited user will receive an email with instructions to create their account and join your team.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
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
            <p className="text-xs text-muted-foreground">
              We'll send the invitation to this email address
            </p>
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
            <Label>
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-popover border border-border shadow-lg">
                <SelectItem value="Admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">Full access except user management</span>
                  </div>
                </SelectItem>
                <SelectItem value="Manager">
                  <div className="flex flex-col">
                    <span className="font-medium">Manager</span>
                    <span className="text-xs text-muted-foreground">Can manage projects and inventory</span>
                  </div>
                </SelectItem>
                <SelectItem value="Staff">
                  <div className="flex flex-col">
                    <span className="font-medium">Staff</span>
                    <span className="text-xs text-muted-foreground">Basic access to assigned tasks</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions for {formData.role}
            </Label>
            <div className="grid grid-cols-1 gap-2 pl-6 max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/50">
              {rolePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.customPermissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                  />
                  <Label htmlFor={permission} className="text-sm cursor-pointer">
                    {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInvitation.isPending || !formData.invited_email}>
              {createInvitation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
