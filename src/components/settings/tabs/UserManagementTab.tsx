
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

export const UserManagementTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { data: invitations } = useUserInvitations();

  return (
    <div className="space-y-6">
      <TeamOverview />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserList 
          users={users} 
          onInviteUser={() => setIsInviteDialogOpen(true)} 
          isLoading={usersLoading}
        />
        <StatusManagement />
      </div>
      
      {invitations && invitations.length > 0 && (
        <PendingInvitations invitations={invitations} />
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
