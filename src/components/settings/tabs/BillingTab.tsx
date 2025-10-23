import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useAvailableAddOns, useUserAddOns, useActivateAddOn, useDeactivateAddOn } from "@/hooks/useUserAddOns";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  TrendingUp, 
  Package, 
  Mail, 
  Zap, 
  Check, 
  ArrowUpRight,
  Infinity,
  ShoppingCart,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

export const BillingTab = () => {
  const { data: userProfile } = useCurrentUserProfile();
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { inventory, emails, isLoading: usageLoading } = useUsageLimits();
  const { data: availableAddOns } = useAvailableAddOns();
  const { data: userAddOns } = useUserAddOns();
  const activateAddOn = useActivateAddOn();
  const deactivateAddOn = useDeactivateAddOn();
  const navigate = useNavigate();

  const isOwner = userProfile?.role === 'Owner';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAddOnsByType = (type: 'capacity' | 'integration' | 'feature') => {
    return availableAddOns?.filter(addon => addon.add_on_type === type) || [];
  };

  const isAddOnActive = (addOnId: string) => {
    return userAddOns?.some(ua => ua.add_on_id === addOnId);
  };

  if (subscriptionLoading || usageLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {subscription?.plan.name || 'Free Plan'}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {formatCurrency(subscription?.plan.price_monthly || 0)}/user/month
              </CardDescription>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {subscription?.status || 'trial'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Active Users</p>
              <p className="text-2xl font-bold">
                {(subscription?.plan as any)?.included_users || 1}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency((subscription?.plan.price_monthly || 0) * ((subscription?.plan as any)?.included_users || 1))}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Next Billing</p>
              <p className="text-2xl font-bold">
                {subscription?.current_period_end 
                  ? format(new Date(subscription.current_period_end), 'MMM dd')
                  : 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Included in your plan:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>CRM & Client Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Manual Quotation System</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Up to {inventory.unlimited ? '∞' : inventory.limit} inventory items</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>{emails.unlimited ? 'Unlimited' : emails.limit} emails/month</span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/settings/subscription')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade to Business Plan ($99/user)
          </Button>
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            Track your resource consumption and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inventory Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Inventory Items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {inventory.used} / {inventory.unlimited ? <Infinity className="h-4 w-4 inline" /> : inventory.limit}
                </span>
                {inventory.percentage >= 80 && !inventory.unlimited && (
                  <Badge variant="destructive" className="text-xs">
                    {Math.round(inventory.percentage)}%
                  </Badge>
                )}
              </div>
            </div>
            {!inventory.unlimited && (
              <>
                <Progress value={inventory.percentage} className="h-2" />
                {!inventory.canAdd && (
                  <p className="text-sm text-destructive">
                    Limit reached. Add Inventory Boost to continue adding products.
                  </p>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Email Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Emails Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {emails.used} / {emails.unlimited ? <Infinity className="h-4 w-4 inline" /> : emails.limit}
                </span>
                {emails.percentage >= 80 && !emails.unlimited && (
                  <Badge variant="destructive" className="text-xs">
                    {Math.round(emails.percentage)}%
                  </Badge>
                )}
              </div>
            </div>
            {!emails.unlimited && (
              <>
                <Progress value={emails.percentage} className="h-2" />
                {!emails.canSend && (
                  <p className="text-sm text-destructive">
                    Limit reached. Add an Email Pack to continue sending.
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add-Ons Marketplace */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add-Ons & Upgrades
          </CardTitle>
          <CardDescription>
            Enhance your workspace with additional capacity and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="capacity">
            <TabsList className="w-full">
              <TabsTrigger value="capacity" className="flex-1">
                <Package className="h-4 w-4 mr-2" />
                Capacity
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="features" className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
            </TabsList>

            <TabsContent value="capacity" className="space-y-4 mt-4">
              {getAddOnsByType('capacity').map(addon => {
                const isActive = isAddOnActive(addon.id);
                return (
                  <div key={addon.id} className="border rounded-lg p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {addon.name}
                        {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                      </h4>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold">{formatCurrency(addon.price_monthly)}/mo</p>
                      {isActive ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const userAddOn = userAddOns?.find(ua => ua.add_on_id === addon.id);
                            if (userAddOn) deactivateAddOn.mutate(userAddOn.id);
                          }}
                          disabled={deactivateAddOn.isPending}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => activateAddOn.mutate(addon.id)}
                          disabled={activateAddOn.isPending}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 mt-4">
              {getAddOnsByType('integration').map(addon => {
                const isActive = isAddOnActive(addon.id);
                return (
                  <div key={addon.id} className="border rounded-lg p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {addon.name}
                        {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                      </h4>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold">{formatCurrency(addon.price_monthly)}/mo</p>
                      {isActive ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const userAddOn = userAddOns?.find(ua => ua.add_on_id === addon.id);
                            if (userAddOn) deactivateAddOn.mutate(userAddOn.id);
                          }}
                          disabled={deactivateAddOn.isPending}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => activateAddOn.mutate(addon.id)}
                          disabled={activateAddOn.isPending}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              {getAddOnsByType('feature').map(addon => {
                const isActive = isAddOnActive(addon.id);
                return (
                  <div key={addon.id} className="border rounded-lg p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {addon.name}
                        {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                      </h4>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold">{formatCurrency(addon.price_monthly)}/mo</p>
                      {isActive ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const userAddOn = userAddOns?.find(ua => ua.add_on_id === addon.id);
                            if (userAddOn) deactivateAddOn.mutate(userAddOn.id);
                          }}
                          disabled={deactivateAddOn.isPending}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => activateAddOn.mutate(addon.id)}
                          disabled={activateAddOn.isPending}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Active Add-Ons */}
      {userAddOns && userAddOns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Your Active Add-Ons
            </CardTitle>
            <CardDescription>
              Manage your subscribed add-ons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAddOns.map(userAddOn => (
                <div key={userAddOn.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{userAddOn.add_on?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Active since {format(new Date(userAddOn.activated_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deactivateAddOn.mutate(userAddOn.id)}
                    disabled={deactivateAddOn.isPending}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
