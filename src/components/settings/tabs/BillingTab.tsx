import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  Crown, 
  Star, 
  Users, 
  FolderOpen, 
  Download, 
  AlertTriangle, 
  ExternalLink,
  CreditCard,
  FileText,
  Shield
} from "lucide-react";
import { format } from "date-fns";

interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  current_period_end: number;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
        unit_amount: number;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
}

interface StripeInvoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
}

export const BillingTab = () => {
  const { data: userProfile, isLoading: profileLoading } = useCurrentUserProfile();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [managingBilling, setManagingBilling] = useState(false);

  // Check if user is owner
  const isOwner = userProfile?.role === 'Owner';

  useEffect(() => {
    if (isOwner) {
      fetchBillingData();
    }
  }, [isOwner]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Get current subscription
      const { data: subData } = await supabase.functions.invoke('check-subscription');
      if (subData?.subscription) {
        setSubscription(subData.subscription);
      }

      // Get invoices
      const { data: invoiceData } = await supabase.functions.invoke('get-invoices');
      if (invoiceData?.invoices) {
        setInvoices(invoiceData.invoices);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setManagingBilling(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setManagingBilling(false);
    }
  };

  const downloadInvoice = (invoice: StripeInvoice) => {
    window.open(invoice.invoice_pdf, '_blank');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'trialing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'past_due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show access denied for non-owners
  if (!isOwner) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Only the account owner can access billing information and manage subscriptions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your current plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      subscription.items.data[0]?.price.unit_amount || 0,
                      'usd'
                    )}/{subscription.items.data[0]?.price.recurring?.interval || 'month'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next billing</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(subscription.current_period_end * 1000), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {managingBilling ? 'Opening...' : 'Manage Subscription'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {invoices.length > 0 
                  ? "Your subscription has expired or been cancelled. You can reactivate anytime to restore full access to premium features."
                  : "You're currently on the free plan. Upgrade to unlock advanced features and remove limitations."
                }
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleManageBilling} 
                  disabled={managingBilling}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {managingBilling ? 'Loading...' : invoices.length > 0 ? 'Reactivate Subscription' : 'Subscribe Now'}
                </Button>
                {invoices.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    View your billing history below and manage your subscription anytime
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History - Show even without active subscription if invoices exist */}
      {(subscription || invoices.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>
            {subscription 
              ? "Download your invoices and view payment history"
              : "Access your previous invoices and billing records"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Invoice #{invoice.number}
                        </span>
                        <Badge 
                          variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.created * 1000), "MMM dd, yyyy")} • 
                        {formatCurrency(invoice.amount_paid, invoice.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadInvoice(invoice)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                Your billing history will appear here once you subscribe to a plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Account Actions - Show different content based on subscription status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {subscription ? <AlertTriangle className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            {subscription ? 'Account Management' : 'Subscription Options'}
          </CardTitle>
          <CardDescription>
            {subscription 
              ? 'Manage your subscription and billing settings'
              : 'Start your subscription or manage your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription ? (
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Cancel Subscription</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      You can cancel your subscription at any time through the billing portal. 
                      Your access will continue until the end of your current billing period.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageBilling}
                      disabled={managingBilling}
                      className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      {managingBilling ? 'Opening...' : 'Manage Subscription'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">Upgrade to Premium</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoices.length > 0 
                        ? "Reactivate your subscription to regain access to all premium features."
                        : "Unlock advanced features, remove limitations, and access priority support."
                      }
                    </p>
                    <Button
                      size="sm"
                      onClick={handleManageBilling}
                      disabled={managingBilling}
                      className="mt-3"
                    >
                      {managingBilling ? 'Loading...' : invoices.length > 0 ? 'Reactivate Now' : 'Start Subscription'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchBillingData}
                disabled={loading}
              >
                Refresh Billing Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};