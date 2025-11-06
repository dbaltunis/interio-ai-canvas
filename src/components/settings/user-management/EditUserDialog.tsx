import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User as UserIcon, Shield } from "lucide-react";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/hooks/useUsers";
import { CustomPermissionsManager } from "./CustomPermissionsManager";

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Custom Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
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
            <Select value={role} onValueChange={setRole} disabled={user?.role === 'Owner'}>
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
              disabled={updateUser.isPending || !displayName.trim()}
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
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};