import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileDown, Trash2, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser, useDeleteUser } from "@/hooks/useUpdateUser";
import { useHasPermission } from "@/hooks/usePermissions";
import type { User } from "@/hooks/useUsers";

interface BulkUserActionsProps {
  users: User[];
  selectedUsers: string[];
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
}

export const BulkUserActions = ({ users, selectedUsers, onSelectAll, onClearSelection }: BulkUserActionsProps) => {
  const [bulkAction, setBulkAction] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  
  const canManageUsers = useHasPermission('manage_users');
  const canExport = useHasPermission('view_analytics') || useHasPermission('manage_users');

  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const getCurrentUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  }, []);

  const exportUsers = useCallback(() => {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Phone'].join(','),
      ...selectedUserData.map(user => [
        user.name || '',
        user.email || '',
        user.role || '',
        user.status || '',
        user.phone || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [users, selectedUsers]);

  const executeBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    // Prevent self-targeting actions
    const currentUserId = await getCurrentUserId();
    const targetUsers = selectedUsers.filter(userId => userId !== currentUserId);
    
    if (targetUsers.length === 0) {
      toast({
        title: "Cannot perform action",
        description: "You cannot perform this action on yourself.",
        variant: "destructive",
      });
      return;
    }

    if (targetUsers.length !== selectedUsers.length) {
      toast({
        title: "Self-action prevented",
        description: "Your own account was excluded from this action for security.",
        variant: "default",
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
            return;
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
            return;
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
            return;
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

        case 'set_role_manager':
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to manage users.",
              variant: "destructive",
            });
            return;
          }
          await Promise.all(
            targetUsers.map(userId => 
              updateUser.mutateAsync({ userId, role: 'Manager' })
            )
          );
          toast({
            title: "Role updated",
            description: `${targetUsers.length} users set to Manager role.`,
          });
          break;

        case 'set_role_staff':
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to manage users.",
              variant: "destructive",
            });
            return;
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
          if (!canManageUsers) {
            toast({
              title: "Permission denied",
              description: "You don't have permission to delete users.",
              variant: "destructive",
            });
            return;
          }
          if (confirm(`Are you sure you want to delete ${targetUsers.length} users? This action cannot be undone.`)) {
            await Promise.all(
              targetUsers.map(userId => deleteUser.mutateAsync(userId))
            );
            toast({
              title: "Users deleted",
              description: `${targetUsers.length} users have been removed.`,
            });
          }
          break;
      }
      
      onClearSelection();
      setBulkAction("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to execute bulk action. Please try again.",
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
                
                <Separator className="my-1" />
                
                <SelectItem value="set_role_admin">Set Role: Admin</SelectItem>
                <SelectItem value="set_role_manager">Set Role: Manager</SelectItem>
                <SelectItem value="set_role_staff">Set Role: Staff</SelectItem>
                
                <Separator className="my-1" />
                
                <SelectItem value="delete" className="text-destructive">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Users
                  </div>
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        <Button
          onClick={executeBulkAction}
          disabled={!bulkAction || isExecuting}
          variant={bulkAction === "delete" ? "destructive" : "default"}
          size="sm"
        >
          {isExecuting ? "Processing..." : "Apply"}
        </Button>

        {canExport && (
          <Button
            onClick={exportUsers}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
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