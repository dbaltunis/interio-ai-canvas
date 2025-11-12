import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AccountWithDetails, AccountType } from "@/types/subscriptions";
import { useUpdateAccountType } from "@/hooks/useAdminAccounts";
import { format } from "date-fns";
import { User, Mail, Calendar, Users } from "lucide-react";

interface AccountInfoPanelProps {
  account: AccountWithDetails;
}

export function AccountInfoPanel({ account }: AccountInfoPanelProps) {
  const updateAccountType = useUpdateAccountType();

  const handleAccountTypeChange = (newType: AccountType) => {
    if (window.confirm(`Are you sure you want to change the account type to "${newType}"?`)) {
      updateAccountType.mutate({
        userId: account.user_id,
        accountType: newType,
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
    </div>
  );
}
