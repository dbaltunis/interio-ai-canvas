import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountWithDetails, SubscriptionType } from "@/types/subscriptions";
import { useUpdateSubscriptionType, useUpdateTrialDuration } from "@/hooks/useAdminAccounts";
import { format } from "date-fns";
import { Calendar, DollarSign, CreditCard } from "lucide-react";

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
                ${subscription.subscription_plans?.price_monthly || 0}
              </p>
            </div>
          </div>

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
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Partner, reseller, test, and lifetime subscriptions can have special payment terms.
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
