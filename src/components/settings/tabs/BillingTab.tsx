import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Calendar, Users, ExternalLink, Mail, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useSubscriptionDetails } from "@/hooks/useSubscriptionDetails";
import { useUserRole } from "@/hooks/useUserRole";
import { InvoicesTable } from "@/components/billing/InvoicesTable";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const BillingTab = () => {
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionDetails();
  const [isManaging, setIsManaging] = useState(false);
  const navigate = useNavigate();

  const isOwner = userRole?.role === 'Owner' || userRole?.isSystemOwner;

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsManaging(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    trial: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  // Loading state
  if (roleLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Access restricted for non-owners
  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            Only account owners can view billing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No subscription state
  if (!subscription?.hasSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Contact support to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="mailto:darius@interioapp.co.uk" className="text-primary hover:underline flex items-center gap-2">
            <Mail className="h-4 w-4" />
            darius@interioapp.co.uk
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {subscription.plan?.name || 'Starter Plan'}
              </CardTitle>
              <CardDescription className="mt-1">
                Your current subscription plan
              </CardDescription>
            </div>
            <Badge className={statusColors[subscription.status || 'active']}>
              {subscription.status === 'active' ? 'Active' : subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency(subscription.monthlyTotal || 0, subscription.currency)}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Active Seats</p>
              </div>
              <p className="text-2xl font-bold">{subscription.currentSeats || 1}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(subscription.pricePerSeat || 0, subscription.currency)}/seat
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Next Billing</p>
              </div>
              <p className="text-2xl font-bold">
                {subscription.nextBillingDate 
                  ? format(new Date(subscription.nextBillingDate), 'MMM dd')
                  : 'N/A'}
              </p>
              {subscription.daysRemaining !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {subscription.daysRemaining} days remaining
                </p>
              )}
            </div>
          </div>

          {/* Billing Period */}
          {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Current Period:</span>{' '}
                {format(new Date(subscription.currentPeriodStart), 'MMM dd, yyyy')} - {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
              </div>
            </>
          )}

          {/* Manage Subscription Button */}
          {subscription.isStripeManaged && (
            <Button onClick={handleManageSubscription} disabled={isManaging} className="w-full sm:w-auto">
              {isManaging ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <InvoicesTable />

      {/* Support */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Need help with billing?{' '}
            <a href="mailto:darius@interioapp.co.uk" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
