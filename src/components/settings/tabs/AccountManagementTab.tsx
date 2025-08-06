import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  useAccountSettings, 
  useChildAccounts, 
  useAccessRequests, 
  useProcessAccessRequest 
} from "@/hooks/useAccountSettings";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { AccountSettingsForm } from "../AccountSettingsForm";
import { AccessRequestCard } from "../AccessRequestCard";
import { ChildAccountCard } from "../ChildAccountCard";
import { InviteChildAccountDialog } from "../InviteChildAccountDialog";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Crown,
  Settings
} from "lucide-react";
import { useState } from "react";

export const AccountManagementTab = () => {
  const { data: userProfile } = useCurrentUserProfile();
  const { data: accountSettings } = useAccountSettings();
  const { data: childAccounts } = useChildAccounts();
  const { data: accessRequests } = useAccessRequests();
  const processAccessRequest = useProcessAccessRequest();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Mock for now - will use actual parent_account_id after migration
  const isParentAccount = true;
  const pendingRequests = accessRequests?.filter(req => req.status === 'pending') || [];

  const handleProcessRequest = async (
    requestId: string, 
    action: 'approve' | 'reject', 
    role?: string
  ) => {
    await processAccessRequest.mutateAsync({ requestId, action, role });
  };

  return (
    <div className="space-y-6">
      {/* Account Type Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>Account Type</CardTitle>
            </div>
            <Badge variant={isParentAccount ? "default" : "secondary"}>
              {isParentAccount ? "Parent Account" : "Child Account"}
            </Badge>
          </div>
          <CardDescription>
            {isParentAccount 
              ? "You have full administrative control and can manage child accounts."
              : "This account is managed under a parent account with limited permissions."
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription>
            Configure your account preferences and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm />
        </CardContent>
      </Card>

      {/* Parent Account Features */}
      {isParentAccount && (
        <>
          {/* Pending Access Requests */}
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <CardTitle>Pending Access Requests</CardTitle>
                  </div>
                  <Badge variant="outline">{pendingRequests.length}</Badge>
                </div>
                <CardDescription>
                  Review and approve access requests from users wanting to join your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request) => (
                  <AccessRequestCard
                    key={request.id}
                    request={request}
                    onApprove={(role) => handleProcessRequest(request.id, 'approve', role)}
                    onReject={() => handleProcessRequest(request.id, 'reject')}
                    isProcessing={processAccessRequest.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Child Accounts Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Child Accounts</CardTitle>
                </div>
                <Button 
                  onClick={() => setShowInviteDialog(true)}
                  size="sm"
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Account
                </Button>
              </div>
              <CardDescription>
                Manage accounts that are part of your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {childAccounts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No child accounts yet.</p>
                  <p className="text-sm">Invite users to join your organization.</p>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Child accounts will be displayed here after setup.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Account Limits</CardTitle>
              </div>
              <CardDescription>
                Current usage and limits for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Child Accounts</span>
                <span className="text-sm text-muted-foreground">
                  {childAccounts?.length || 0} / {accountSettings?.max_child_accounts || 'Unlimited'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm text-muted-foreground">
                  2.1 GB / 10 GB
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <InviteChildAccountDialog 
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      />
    </div>
  );
};