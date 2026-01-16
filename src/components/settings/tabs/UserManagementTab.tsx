import { useState } from "react";
import { InviteUserDialog } from "../InviteUserDialog";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "../user-management/UserList";
import { SubscriptionSummary } from "../user-management/SubscriptionSummary";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

export const UserManagementTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Management</h3>
          <p className="text-sm text-muted-foreground">Invite members and manage permissions</p>
        </div>
        <SectionHelpButton sectionId="team" />
      </div>

      <SubscriptionSummary />
      
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
