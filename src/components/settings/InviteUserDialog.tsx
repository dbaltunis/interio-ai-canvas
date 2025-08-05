import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateInvitation } from "@/hooks/useUserInvitations";
import { Mail, User, Shield } from "lucide-react";

interface InviteUserDialogProps {
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

export const InviteUserDialog = ({ open, onOpenChange }: InviteUserDialogProps) => {
  const [formData, setFormData] = useState({
    invited_email: "",
    invited_name: "",
    role: "Staff",
    customPermissions: [] as string[],
  });

  const createInvitation = useCreateInvitation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
          customPermissions: [],
        });
      },
    });
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      customPermissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [],
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};