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

export const InviteUserDialog = ({ open, onOpenChange }: InviteUserDialogProps) => {
  const [formData, setFormData] = useState({
    invited_email: "",
    invited_name: "",
    role: "Staff",
    permissions: {
      manage_users: false,
      business_settings: false,
      view_reports: false,
      manage_projects: false,
      update_tasks: false,
    },
  });

  const createInvitation = useCreateInvitation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvitation.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          invited_email: "",
          invited_name: "",
          role: "Staff",
          permissions: {
            manage_users: false,
            business_settings: false,
            view_reports: false,
            manage_projects: false,
            update_tasks: false,
          },
        });
      },
    });
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }));
  };

  const rolePermissions = {
    Admin: {
      manage_users: true,
      business_settings: true,
      view_reports: true,
      manage_projects: true,
      update_tasks: true,
    },
    Manager: {
      manage_users: false,
      business_settings: false,
      view_reports: true,
      manage_projects: true,
      update_tasks: true,
    },
    Staff: {
      manage_users: false,
      business_settings: false,
      view_reports: false,
      manage_projects: false,
      update_tasks: true,
    },
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role as keyof typeof rolePermissions],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
              Permissions
            </Label>
            <div className="space-y-3 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manage_users"
                  checked={formData.permissions.manage_users}
                  onCheckedChange={(checked) => handlePermissionChange("manage_users", checked as boolean)}
                />
                <Label htmlFor="manage_users" className="text-sm">Manage Users</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="business_settings"
                  checked={formData.permissions.business_settings}
                  onCheckedChange={(checked) => handlePermissionChange("business_settings", checked as boolean)}
                />
                <Label htmlFor="business_settings" className="text-sm">Business Settings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="view_reports"
                  checked={formData.permissions.view_reports}
                  onCheckedChange={(checked) => handlePermissionChange("view_reports", checked as boolean)}
                />
                <Label htmlFor="view_reports" className="text-sm">View Reports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manage_projects"
                  checked={formData.permissions.manage_projects}
                  onCheckedChange={(checked) => handlePermissionChange("manage_projects", checked as boolean)}
                />
                <Label htmlFor="manage_projects" className="text-sm">Manage Projects</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update_tasks"
                  checked={formData.permissions.update_tasks}
                  onCheckedChange={(checked) => handlePermissionChange("update_tasks", checked as boolean)}
                />
                <Label htmlFor="update_tasks" className="text-sm">Update Tasks</Label>
              </div>
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