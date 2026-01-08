import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Users, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { useSubscriptionDetails } from "@/hooks/useSubscriptionDetails";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const SubscriptionSummary = () => {
  const { data: subscription, isLoading, error } = useSubscriptionDetails();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast.error('Failed to open subscription management portal');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error || !subscription?.hasSubscription) {
    return (
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">No active subscription found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    trial: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    past_due: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    canceled: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Your Subscription
          </CardTitle>
          <Badge className={statusColors[subscription.status || 'active']}>
            {subscription.status === 'trial' ? 'Trial' : 
             subscription.status === 'past_due' ? 'Past Due' :
             subscription.status === 'canceled' ? 'Canceled' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-medium">{subscription.plan?.name || 'Starter'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Seats</p>
            <p className="font-medium flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {subscription.currentSeats}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly Cost</p>
            <p className="font-medium">
              £{subscription.monthlyTotal || (subscription.currentSeats * subscription.pricePerSeat)}/month
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Next Billing</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {subscription.nextBillingDate 
                ? format(new Date(subscription.nextBillingDate), 'MMM d, yyyy')
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            Each additional team member costs <strong>£{subscription.pricePerSeat}/month</strong> (prorated for the current billing period)
          </p>
          
          {subscription.isStripeManaged && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleManageSubscription}
              disabled={isOpeningPortal}
            >
              {isOpeningPortal ? (
                "Opening..."
              ) : (
                <>
                  Manage Subscription
                  <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
