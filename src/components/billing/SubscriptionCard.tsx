import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Users, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { useSubscriptionDetails } from "@/hooks/useSubscriptionDetails";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function SubscriptionCard() {
  const { data: subscription, isLoading, error } = useSubscriptionDetails();
  const [openingPortal, setOpeningPortal] = useState(false);

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast.error('Failed to open subscription management');
    } finally {
      setOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load subscription details</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription.hasSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Subscription
          </CardTitle>
          <CardDescription>No active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You don't have an active subscription yet. Contact your administrator or subscribe to access premium features.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    trial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {subscription.plan?.name || 'Starter'} Plan
            </CardTitle>
            <CardDescription>Your current subscription</CardDescription>
          </div>
          <Badge className={statusColors[subscription.status || 'active'] || statusColors.active}>
            {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1) || 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Cost</p>
            <p className="text-2xl font-bold">
              {subscription.currency === 'gbp' ? '£' : '$'}
              {subscription.monthlyTotal?.toFixed(2) || subscription.pricePerSeat?.toFixed(2) || '99.00'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3 w-3" />
              Active Seats
            </p>
            <p className="text-2xl font-bold">{subscription.currentSeats || 1}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Price Per Seat</p>
            <p className="text-lg font-semibold">
              {subscription.currency === 'gbp' ? '£' : '$'}
              {subscription.pricePerSeat?.toFixed(2) || '99.00'}/mo
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Next Billing
            </p>
            <p className="text-lg font-semibold">
              {subscription.nextBillingDate 
                ? format(new Date(subscription.nextBillingDate), 'MMM d, yyyy')
                : 'N/A'}
            </p>
          </div>
        </div>

        {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Current billing period: {format(new Date(subscription.currentPeriodStart), 'MMM d')} – {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
              {subscription.daysRemaining !== undefined && (
                <span className="ml-2 text-foreground font-medium">
                  ({subscription.daysRemaining} days remaining)
                </span>
              )}
            </p>
          </div>
        )}

        {subscription.isStripeManaged && (
          <Button 
            onClick={handleManageSubscription}
            disabled={openingPortal}
            className="w-full sm:w-auto"
          >
            {openingPortal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
