import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/hooks/useUsers";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserDialog = ({ user, open, onOpenChange }: EditUserDialogProps) => {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Staff");
  const [isActive, setIsActive] = useState(true);
  const [phone, setPhone] = useState("");

  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;

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
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Update failed",
        description: "Failed to update user. Please try again.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name"
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
            <Select value={role} onValueChange={setRole}>
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
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={updateUser.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateUser.isPending || !displayName.trim()}
          >
            {updateUser.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};