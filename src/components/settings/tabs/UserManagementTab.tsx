
import { useState } from "react";
import { InviteUserDialog } from "../InviteUserDialog";
import { useUserInvitations } from "@/hooks/useUserInvitations";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "../user-management/UserList";
import { PendingInvitations } from "../user-management/PendingInvitations";
import { StatusManagement } from "../user-management/StatusManagement";
import { RolePermissions } from "../user-management/RolePermissions";

export const UserManagementTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const [statuses, setStatuses] = useState([
    { id: 1, name: "Draft", color: "gray", category: "Quote", action: "editable", description: "Initial quote creation" },
    { id: 2, name: "Quote", color: "blue", category: "Quote", action: "editable", description: "Quote ready to send" },
    { id: 3, name: "Sent", color: "yellow", category: "Quote", action: "view_only", description: "Quote sent to client" },
    { id: 4, name: "Order", color: "green", category: "Project", action: "locked", description: "Quote accepted, job locked" },
    { id: 5, name: "In Progress", color: "orange", category: "Project", action: "progress_only", description: "Work in progress" },
    { id: 6, name: "Completed", color: "green", category: "Project", action: "completed", description: "Job completed" },
    { id: 7, name: "Lost Order", color: "red", category: "Quote", action: "requires_reason", description: "Quote lost, reason required" },
  ]);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const { data: invitations } = useUserInvitations();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserList 
          users={users} 
          onInviteUser={() => setIsInviteDialogOpen(true)} 
          isLoading={usersLoading}
        />
        <StatusManagement statuses={statuses} onStatusUpdate={setStatuses} />
      </div>
      
      {invitations && invitations.length > 0 && (
        <PendingInvitations invitations={invitations} />
      )}
      
      <RolePermissions />

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
      />
    </div>
  );
};
