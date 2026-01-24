import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountWithDetails, AccountType } from "@/types/subscriptions";
import { useUpdateAccountType, useInvitationEmailStatus, useResendInvitation } from "@/hooks/useAdminAccounts";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useBlockAccount, AccountStatus } from "@/hooks/useBlockAccount";
import { format } from "date-fns";
import { User, Mail, Calendar, Users, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Ban, ShieldCheck } from "lucide-react";

interface AccountInfoPanelProps {
  account: AccountWithDetails;
  onAccountDeleted?: () => void;
}

export function AccountInfoPanel({ account, onAccountDeleted }: AccountInfoPanelProps) {
  const updateAccountType = useUpdateAccountType();
  const deleteAccount = useDeleteAccount();
  const blockAccount = useBlockAccount();
  const { data: emailStatus, isLoading: emailStatusLoading } = useInvitationEmailStatus(account.user_id);
  const resendInvitation = useResendInvitation();
  const [blockReason, setBlockReason] = useState("");
  const [selectedBlockStatus, setSelectedBlockStatus] = useState<AccountStatus>("trial_ended");

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

  const handleBlockAccount = () => {
    if (window.confirm(
      `Are you sure you want to ${selectedBlockStatus === 'trial_ended' ? 'end the trial for' : 'block'} this account?\n\nThe user will see a popup message and won't be able to use the app.`
    )) {
      blockAccount.mutate({
        userId: account.user_id,
        status: selectedBlockStatus,
        reason: blockReason || undefined,
      });
    }
  };

  const handleUnblockAccount = () => {
    if (window.confirm(`Are you sure you want to unblock this account? The user will be able to access the app again.`)) {
      blockAccount.mutate({
        userId: account.user_id,
        status: 'active',
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
      return <Skeleton className="h-5 w-20 rounded-full" />;
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

      {/* Account Access Control Card */}
      <Card className="border-amber-500">
        <CardHeader>
          <CardTitle className="text-amber-600 flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status Display */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Current Status</p>
            {(account as any).account_status === 'active' || !(account as any).account_status ? (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <ShieldCheck className="h-3 w-3 mr-1" /> Active
              </Badge>
            ) : (account as any).account_status === 'trial_ended' ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                <Clock className="h-3 w-3 mr-1" /> Trial Ended
              </Badge>
            ) : (account as any).account_status === 'suspended' ? (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                <AlertCircle className="h-3 w-3 mr-1" /> Suspended
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 border-red-300">
                <XCircle className="h-3 w-3 mr-1" /> Blocked
              </Badge>
            )}
            {(account as any).blocked_reason && (
              <p className="text-xs text-muted-foreground mt-1">Reason: {(account as any).blocked_reason}</p>
            )}
          </div>

          <div>
            <p className="text-sm mb-2">Block or restrict access to this account</p>
            <p className="text-xs text-muted-foreground mb-4">
              Blocked users will see a popup message and cannot use the app until unblocked.
            </p>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Block Type</Label>
                <Select
                  value={selectedBlockStatus}
                  onValueChange={(value: AccountStatus) => setSelectedBlockStatus(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial_ended">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-amber-500" />
                        Trial Ended
                      </div>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        Suspended
                      </div>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Blocked
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Reason (optional)</Label>
                <Input 
                  placeholder="e.g., Trial expired, payment required..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
                  onClick={handleBlockAccount}
                  disabled={blockAccount.isPending}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {blockAccount.isPending ? "Processing..." : "Block Account"}
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={handleUnblockAccount}
                  disabled={blockAccount.isPending}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Unblock
                </Button>
              </div>
            </div>
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
