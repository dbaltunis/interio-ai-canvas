import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserCheck, UserX, Download, ChevronDown } from "lucide-react";
import { User } from "@/hooks/useUsers";
import { useUpdateUser, useDeleteUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";

interface BulkUserActionsProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
}

export const BulkUserActions = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onClearSelection,
}: BulkUserActionsProps) => {
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  
  // Permission checks
  const canExport = useHasPermission('export_data');
  const canManageUsers = useHasPermission('manage_users');
  
  // For now, allow delete if user can manage users - we'll add proper delete permission later
  const canDelete = canManageUsers;
  
  // Get current user ID to prevent self-actions
  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const exportUsers = () => {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Phone'].join(','),
      ...selectedUserData.map(user => 
        [user.name, user.email, user.role, user.status, user.phone || ''].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const executeBulkAction = async () => {
    console.log('Executing bulk action:', bulkAction, 'on users:', selectedUsers);
    if (!bulkAction || selectedUsers.length === 0) {
      console.log('No action or no users selected');
      return;
    }

    // Prevent self-targeting actions
    const currentUserId = await getCurrentUserId();
    console.log('Current user ID:', currentUserId);
    const targetUsers = selectedUsers.filter(userId => userId !== currentUserId);
    console.log('Target users after filtering self:', targetUsers);
    
    if (targetUsers.length === 0) {
      console.log('No target users after filtering self');
      toast({
        title: "Cannot perform action",
        description: "You cannot perform this action on yourself.",
        variant: "destructive",
      });
      return;
    }

    if (targetUsers.length !== selectedUsers.length) {
      console.log('Self was excluded from action');
      toast({
        title: "Self-action prevented",
        description: "Your own account was excluded from this action for security.",
      });
    }

    setIsExecuting(true);
    try {
      switch (bulkAction) {
        case 'activate':
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to manage users.",
              variant: "destructive",
            });
            break;
          }
          await Promise.all(
            targetUsers.map(userId => 
              updateUser.mutateAsync({ userId, is_active: true })
            )
          );
          toast({
            title: "Users activated",
            description: `${targetUsers.length} users have been activated.`,
          });
          break;

        case 'deactivate':
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to manage users.",
              variant: "destructive",
            });
            break;
          }
          await Promise.all(
            targetUsers.map(userId => 
              updateUser.mutateAsync({ userId, is_active: false })
            )
          );
          toast({
            title: "Users deactivated",
            description: `${targetUsers.length} users have been deactivated.`,
          });
          break;

        case 'set_role_admin':
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to manage users.",
              variant: "destructive",
            });
            break;
          }
          await Promise.all(
            targetUsers.map(userId => 
              updateUser.mutateAsync({ userId, role: 'Admin' })
            )
          );
          toast({
            title: "Role updated",
            description: `${targetUsers.length} users set to Admin role.`,
          });
          break;

        case 'set_role_staff':
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to manage users.",
              variant: "destructive",
            });
            break;
          }
          await Promise.all(
            targetUsers.map(userId => 
              updateUser.mutateAsync({ userId, role: 'Staff' })
            )
          );
          toast({
            title: "Role updated",
            description: `${targetUsers.length} users set to Staff role.`,
          });
          break;

        case 'delete':
          console.log('Delete action triggered. Can delete:', canDelete);
          if (!canDelete) {
            console.log('Permission denied for delete');
            toast({
              title: "Permission denied",
              description: "You don't have permission to delete users.",
              variant: "destructive",
            });
            break;
          }
          console.log('Asking for confirmation to delete users:', targetUsers);
          if (confirm(`Are you sure you want to delete ${targetUsers.length} users? This action cannot be undone.`)) {
            console.log('User confirmed deletion, proceeding...');
            try {
              await Promise.all(
                targetUsers.map(async (userId) => {
                  console.log('Deleting user:', userId);
                  return deleteUser.mutateAsync(userId);
                })
              );
              console.log('All users deleted successfully');
              toast({
                title: "Users deleted",
                description: `${targetUsers.length} users have been removed.`,
              });
            } catch (error) {
              console.error('Error during deletion:', error);
              throw error;
            }
          } else {
            console.log('User cancelled deletion');
          }
          break;
      }
      
      onClearSelection();
      setBulkAction("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute bulk action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (selectedUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
          className={someSelected ? "data-[state=checked]:bg-muted" : ""}
        />
        <span className="text-sm font-medium">
          {selectedUsers.length} selected
        </span>
        <Badge variant="outline">{selectedUsers.length} of {users.length}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Select value={bulkAction || "none"} onValueChange={(value) => setBulkAction(value === "none" ? "" : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Bulk Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" disabled>Select Action</SelectItem>
            {canManageUsers && (
              <>
                <SelectItem value="activate">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Activate Users
                  </div>
                </SelectItem>
                <SelectItem value="deactivate">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Deactivate Users
                  </div>
                </SelectItem>
                <SelectItem value="set_role_admin">Set Role: Admin</SelectItem>
                <SelectItem value="set_role_staff">Set Role: Staff</SelectItem>
              </>
            )}
            {canDelete && (
              <SelectItem value="delete" className="text-destructive">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Users
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Button
          onClick={executeBulkAction}
          disabled={!bulkAction || isExecuting}
          variant={bulkAction === 'delete' ? 'destructive' : 'default'}
          size="sm"
        >
          {isExecuting ? 'Processing...' : 'Apply'}
        </Button>

        {canExport && (
          <Button
            onClick={exportUsers}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}

        <Button
          onClick={onClearSelection}
          variant="ghost"
          size="sm"
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
};