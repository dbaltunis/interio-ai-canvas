
import { useState } from "react";
import { InviteUserDialog } from "../InviteUserDialog";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "../user-management/UserList";

export const UserManagementTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <UserList 
        users={users} 
        onInviteUser={() => setIsInviteDialogOpen(true)} 
        isLoading={usersLoading}
      />

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
      />
    </div>
  );
};
