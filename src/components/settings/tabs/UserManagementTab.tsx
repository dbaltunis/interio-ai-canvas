
import { useState } from "react";
import { InviteUserDialog } from "../InviteUserDialog";
import { useUserInvitations } from "@/hooks/useUserInvitations";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "../user-management/UserList";
import { PendingInvitations } from "../user-management/PendingInvitations";
import { StatusManagement } from "../user-management/StatusManagement";
import { RolePermissions } from "../user-management/RolePermissions";
import { PermissionManager } from "../user-management/PermissionManager";
import { TeamOverview } from "../user-management/TeamOverview";
import { UserManagementStats } from "../user-management/UserManagementStats";

export const UserManagementTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { data: invitations = [] } = useUserInvitations();

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length;

  return (
    <div className="space-y-6">
      <TeamOverview />
      
      <UserManagementStats 
        totalUsers={users.length}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        pendingInvitations={pendingInvitations.length}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserList 
          users={users} 
          onInviteUser={() => setIsInviteDialogOpen(true)} 
          isLoading={usersLoading}
        />
        <StatusManagement />
      </div>
      
      {pendingInvitations.length > 0 && (
        <PendingInvitations invitations={pendingInvitations} />
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RolePermissions />
        <PermissionManager />
      </div>

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
      />
    </div>
  );
};
