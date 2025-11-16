
import { useState } from "react";
import { InviteUserDialog } from "../InviteUserDialog";
import { useUserInvitations } from "@/hooks/useUserInvitations";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "../user-management/UserList";
import { PendingInvitations } from "../user-management/PendingInvitations";

import { RolePermissions } from "../user-management/RolePermissions";
import { PermissionManager } from "../user-management/PermissionManager";
import { TeamOverview } from "../user-management/TeamOverview";
import { CostVisibilitySettings } from "../CostVisibilitySettings";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const UserManagementTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { data: invitations = [] } = useUserInvitations();

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Team Overview - Clean and informative */}
      <TeamOverview />
      
      {/* Settings Inheritance Info */}
      <Alert className="bg-brand-accent/10 border-brand-accent">
        <Info className="h-4 w-4 text-brand-accent" />
        <AlertDescription className="text-sm">
          <strong>Settings Inheritance:</strong> Team members automatically inherit business settings, 
          measurement units, email settings, product templates, and inventory from the organization account. 
          They can create custom settings if needed with appropriate permissions.
        </AlertDescription>
      </Alert>
      
      {/* Cost Visibility Settings - Security & Access Control */}
      <CostVisibilitySettings />
      
      {/* Core Team Management - Primary actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserList 
          users={users} 
          onInviteUser={() => setIsInviteDialogOpen(true)} 
          isLoading={usersLoading}
        />
        
        {/* Show pending invitations prominently if there are any */}
        {pendingInvitations.length > 0 && (
          <PendingInvitations invitations={pendingInvitations} />
        )}
      </div>
      
      {/* Advanced Management - Collapsible for less clutter */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Advanced Role & Permission Management
            {isAdvancedOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RolePermissions />
            <PermissionManager />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
      />
    </div>
  );
};
