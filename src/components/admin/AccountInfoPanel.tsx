import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccountWithDetails, AccountType } from "@/types/subscriptions";
import { useUpdateAccountType, useInvitationEmailStatus, useResendInvitation } from "@/hooks/useAdminAccounts";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { format } from "date-fns";
import { User, Mail, Calendar, Users, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface AccountInfoPanelProps {
  account: AccountWithDetails;
  onAccountDeleted?: () => void;
}

export function AccountInfoPanel({ account, onAccountDeleted }: AccountInfoPanelProps) {
  const updateAccountType = useUpdateAccountType();
  const deleteAccount = useDeleteAccount();
  const { data: emailStatus, isLoading: emailStatusLoading } = useInvitationEmailStatus(account.user_id);
  const resendInvitation = useResendInvitation();

  const handleAccountTypeChange = (newType: AccountType) => {
    if (window.confirm(`Are you sure you want to change the account type to "${newType}"?`)) {
      updateAccountType.mutate({
        userId: account.user_id,
        accountType: newType,
      });
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm(
      `⚠️ WARNING: This will permanently delete the account for ${account.display_name || account.email} and all associated data.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to proceed?`
    )) {
      deleteAccount.mutate(account.user_id, {
        onSuccess: () => {
          onAccountDeleted?.();
        }
      });
    }
  };

  const handleResendInvitation = () => {
    if (window.confirm(`This will generate a new password and send a new invitation email to ${account.email}. Continue?`)) {
      resendInvitation.mutate({ userId: account.user_id });
    }
  };

  const getEmailStatusBadge = () => {
    if (emailStatusLoading) {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Loading...</Badge>;
    }

    if (!emailStatus || emailStatus.status === 'none') {
      return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> No invitation sent</Badge>;
    }

    switch (emailStatus.status) {
      case 'sent':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> 
            Sent {emailStatus.sent_at ? format(new Date(emailStatus.sent_at), "MMM d, h:mm a") : ''}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Display Name</p>
              <p className="text-sm text-muted-foreground">{account.display_name || "Not set"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{account.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(account.created_at), "PPP")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-sm text-muted-foreground">{account.team_members_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitation Email Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitation Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              {getEmailStatusBadge()}
              {emailStatus?.error && (
                <p className="text-xs text-destructive mt-1">{emailStatus.error}</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResendInvitation}
              disabled={resendInvitation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${resendInvitation.isPending ? 'animate-spin' : ''}`} />
              {resendInvitation.isPending ? 'Sending...' : 'Resend Invitation'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Resending will generate a new temporary password and send login credentials to the user's email.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm mb-2">Current Type:</p>
            <Badge className="capitalize">{account.account_type}</Badge>
          </div>

          <div>
            <p className="text-sm mb-2">Change Account Type:</p>
            <Select
              value={account.account_type}
              onValueChange={(value: AccountType) => handleAccountTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              This determines how the account is classified in the system.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm mb-2">Delete Account</p>
            <p className="text-xs text-muted-foreground mb-4">
              Permanently delete this account and all associated data. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
