import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminAccounts } from "@/hooks/useAdminAccounts";
import { AccountType } from "@/types/subscriptions";
import { Search, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { AccountDetailsDialog } from "@/components/admin/AccountDetailsDialog";
import { AccountWithDetails } from "@/types/subscriptions";

export default function AdminAccountManagement() {
  const [search, setSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountType | "all">("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string | "all">("all");
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null);

  const { data: accounts, isLoading } = useAdminAccounts({
    accountType: accountTypeFilter === "all" ? undefined : accountTypeFilter,
    subscriptionStatus: subscriptionStatusFilter === "all" ? undefined : subscriptionStatusFilter,
    search: search || undefined,
  });

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="secondary">No Subscription</Badge>;
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trial: "secondary",
      canceled: "destructive",
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getAccountTypeBadge = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      production: "bg-green-100 text-green-800",
      test: "bg-yellow-100 text-yellow-800",
      partner: "bg-blue-100 text-blue-800",
      reseller: "bg-purple-100 text-purple-800",
      internal: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={colors[type]} variant="outline">
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Test Account
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={accountTypeFilter} onValueChange={(value: any) => setAccountTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subscriptionStatusFilter} onValueChange={setSubscriptionStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subscription Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts ({accounts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts?.map((account) => (
              <div
                key={account.user_id}
                className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-muted/50 rounded-lg p-2 cursor-pointer transition-colors"
                onClick={() => setSelectedAccount(account)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{account.display_name || "No Name"}</p>
                    {getAccountTypeBadge(account.account_type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{account.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {getStatusBadge(account.subscription?.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.team_members_count} team member(s)
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Joined</p>
                    <p>{format(new Date(account.created_at), "MMM dd, yyyy")}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}

            {accounts?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No accounts found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Details Dialog */}
      {selectedAccount && (
        <AccountDetailsDialog
          account={selectedAccount}
          open={!!selectedAccount}
          onOpenChange={(open) => !open && setSelectedAccount(null)}
        />
      )}
    </div>
  );
}
