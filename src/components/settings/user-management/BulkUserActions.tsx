import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserCheck, UserX, Download, ChevronDown } from "lucide-react";
import { User } from "@/hooks/useUsers";
import { useUpdateUser, useDeleteUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";

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
    if (!bulkAction || selectedUsers.length === 0) return;

    setIsExecuting(true);
    try {
      switch (bulkAction) {
        case 'activate':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUser.mutateAsync({ userId, is_active: true })
            )
          );
          toast({
            title: "Users activated",
            description: `${selectedUsers.length} users have been activated.`,
          });
          break;

        case 'deactivate':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUser.mutateAsync({ userId, is_active: false })
            )
          );
          toast({
            title: "Users deactivated",
            description: `${selectedUsers.length} users have been deactivated.`,
          });
          break;

        case 'set_role_admin':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUser.mutateAsync({ userId, role: 'Admin' })
            )
          );
          toast({
            title: "Role updated",
            description: `${selectedUsers.length} users set to Admin role.`,
          });
          break;

        case 'set_role_staff':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUser.mutateAsync({ userId, role: 'Staff' })
            )
          );
          toast({
            title: "Role updated",
            description: `${selectedUsers.length} users set to Staff role.`,
          });
          break;

        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
            await Promise.all(
              selectedUsers.map(userId => deleteUser.mutateAsync(userId))
            );
            toast({
              title: "Users deleted",
              description: `${selectedUsers.length} users have been removed.`,
            });
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
        <Select value={bulkAction} onValueChange={setBulkAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Bulk Actions" />
          </SelectTrigger>
          <SelectContent>
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
            <SelectItem value="delete" className="text-destructive">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Users
              </div>
            </SelectItem>
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

        <Button
          onClick={exportUsers}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>

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