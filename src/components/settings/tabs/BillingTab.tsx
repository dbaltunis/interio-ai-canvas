import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserSubscription, useSubscriptionPlans, useCreateSubscription } from "@/hooks/useUserSubscription";
import { Calendar, Check, Crown, Star, Zap, Users, FolderOpen } from "lucide-react";
import { format } from "date-fns";

export const BillingTab = () => {
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const createSubscription = useCreateSubscription();

  const handleUpgrade = (planId: string) => {
    createSubscription.mutate(planId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'past_due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Users className="h-5 w-5" />;
      case 'professional': return <Star className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  if (subscriptionLoading || plansLoading) {
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
            <Calendar className="h-5 w-5" />
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
                  {getPlanIcon(subscription.plan.name)}
                  <div>
                    <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{subscription.plan.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">
                    ${subscription.plan.price_monthly}/month
                  </p>
                </div>
                
                {subscription.current_period_end && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {subscription.status === 'trial' ? 'Trial ends' : 'Next billing'}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatDate(subscription.trial_ends_at || subscription.current_period_end)}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Users</p>
                  <p className="text-lg font-semibold">
                    {subscription.plan.max_users === -1 ? 'Unlimited' : subscription.plan.max_users}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Manage Billing
                </Button>
                <Button variant="outline" size="sm">
                  Download Invoice
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Choose a plan below to get started with premium features
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  subscription?.plan_id === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                {subscription?.plan_id === plan.id && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                    Current Plan
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">${plan.price_monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                  {plan.price_yearly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.price_yearly}/year (save 17%)
                    </p>
                  )}
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={subscription?.plan_id === plan.id ? "outline" : "default"}
                  disabled={subscription?.plan_id === plan.id || createSubscription.isPending}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {subscription?.plan_id === plan.id
                    ? "Current Plan"
                    : plan.price_monthly === 0
                    ? "Start Free"
                    : "Upgrade"
                  }
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};