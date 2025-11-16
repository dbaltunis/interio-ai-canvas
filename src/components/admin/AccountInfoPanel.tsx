import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccountWithDetails, AccountType } from "@/types/subscriptions";
import { useUpdateAccountType } from "@/hooks/useAdminAccounts";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { format } from "date-fns";
import { User, Mail, Calendar, Users, Trash2 } from "lucide-react";

interface AccountInfoPanelProps {
  account: AccountWithDetails;
  onAccountDeleted?: () => void;
}

export function AccountInfoPanel({ account, onAccountDeleted }: AccountInfoPanelProps) {
  const updateAccountType = useUpdateAccountType();
  const deleteAccount = useDeleteAccount();

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
