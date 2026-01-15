import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccountWithDetails, SubscriptionType } from "@/types/subscriptions";
import { useUpdateSubscriptionType, useUpdateTrialDuration } from "@/hooks/useAdminAccounts";
import { useAdminAccountInvoices } from "@/hooks/useAdminAccountInvoices";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, DollarSign, CreditCard, Users, FileText, ExternalLink, Download, Loader2 } from "lucide-react";

interface SubscriptionPanelProps {
  account: AccountWithDetails;
}

export function SubscriptionPanel({ account }: SubscriptionPanelProps) {
  const [adminNotes, setAdminNotes] = useState(account.subscription?.admin_notes || "");
  const [trialEndDate, setTrialEndDate] = useState(
    account.subscription?.trial_ends_at
      ? format(new Date(account.subscription.trial_ends_at), "yyyy-MM-dd")
      : ""
  );

  const updateSubscriptionType = useUpdateSubscriptionType();
  const updateTrialDuration = useUpdateTrialDuration();

  // Fetch invoices for this account
  const { data: invoices, isLoading: invoicesLoading } = useAdminAccountInvoices(
    account.subscription?.stripe_customer_id
  );

  // Fetch team members for this account
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ["adminAccountTeamMembers", account.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, role, created_at, parent_account_id")
        .eq("parent_account_id", account.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSubscriptionTypeChange = (newType: SubscriptionType) => {
    if (!account.subscription) return;

    if (window.confirm(`Are you sure you want to change the subscription type to "${newType}"?`)) {
      updateSubscriptionType.mutate({
        subscriptionId: account.subscription.id,
        subscriptionType: newType,
      });
    }
  };

  const handleSaveNotes = () => {
    if (!account.subscription) return;

    updateSubscriptionType.mutate({
      subscriptionId: account.subscription.id,
      subscriptionType: account.subscription.subscription_type as SubscriptionType,
      adminNotes,
    });
  };

  const handleUpdateTrialDate = () => {
    if (!account.subscription || !trialEndDate) return;

    if (window.confirm(`Update trial end date to ${trialEndDate}?`)) {
      updateTrialDuration.mutate({
        subscriptionId: account.subscription.id,
        trialEndsAt: new Date(trialEndDate).toISOString(),
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      open: "secondary",
      void: "outline",
      uncollectible: "destructive",
      draft: "outline",
    };
    return <Badge variant={variants[status || ""] || "secondary"}>{status || "unknown"}</Badge>;
  };

  if (!account.subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No subscription found for this account.
          </p>
          <Button className="w-full mt-4">Create Trial Subscription</Button>
        </CardContent>
      </Card>
    );
  }

  const subscription = account.subscription;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-sm text-muted-foreground">
                {subscription.subscription_plans?.name || "Unknown Plan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="capitalize">
              {subscription.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Monthly Price</p>
              <p className="text-sm text-muted-foreground">
                £{subscription.subscription_plans?.price_monthly || 0}
              </p>
            </div>
          </div>

          {subscription.stripe_customer_id && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Stripe Customer</p>
                <a 
                  href={`https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {subscription.stripe_customer_id}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {subscription.trial_ends_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Trial Ends</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(subscription.trial_ends_at), "PPP")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members ({account.team_members_count || 0} seats)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading team members...
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>{member.display_name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role || "Team Member"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(member.created_at), "PP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No team members added yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!subscription.stripe_customer_id ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No Stripe customer linked - trial account.
            </p>
          ) : invoicesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading invoices...
            </div>
          ) : invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.number || invoice.id.slice(0, 12)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.created * 1000), "PP")}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No invoices found.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm mb-2">Current Type:</p>
            <Badge className="capitalize">{subscription.subscription_type || "standard"}</Badge>
          </div>

          <div>
            <p className="text-sm mb-2">Change Subscription Type:</p>
            <Select
              value={subscription.subscription_type || "standard"}
              onValueChange={(value: SubscriptionType) => handleSubscriptionTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
                <SelectItem value="invoice">Invoice (Annual)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Partner, reseller, test, lifetime, and invoice subscriptions have special payment terms.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trial Duration Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm mb-2">Trial End Date:</p>
            <Input
              type="date"
              value={trialEndDate}
              onChange={(e) => setTrialEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateTrialDate} disabled={!trialEndDate}>
            Update Trial Duration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add notes about this subscription..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSaveNotes}>Save Notes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
