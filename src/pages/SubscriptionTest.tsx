import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscriptionFeatures } from '@/hooks/useSubscriptionFeatures';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SubscriptionTest = () => {
  const { features, hasFeature, isLoading } = useSubscriptionFeatures();

  const { data: addOns } = useQuery({
    queryKey: ['subscription-add-ons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_add_ons')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userAddOns } = useQuery({
    queryKey: ['user-subscription-add-ons'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_subscription_add_ons')
        .select(`
          *,
          add_on:subscription_add_ons(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription & Features Test Page</h1>
        <p className="text-muted-foreground">
          Test the Phase 1 subscription system, feature gates, and add-ons
        </p>
      </div>

      {/* Current Features Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Features</CardTitle>
          <CardDescription>
            Features available based on your subscription plan and add-ons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              crm: 'CRM',
              quoting: 'Quoting',
              manual_quotes: 'Manual Quotes',
              calendar: 'Calendar Sync',
              email: 'Email Integration',
              inventory: 'Inventory Management',
              window_treatments: 'Window Treatments',
              wallpapers: 'Wallpapers',
              shopify: 'Shopify Integration',
              erp_integrations: 'ERP Integrations',
            }).map(([key, label]) => {
              const active = hasFeature(key as any);
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    active ? 'bg-green-50 border-green-200' : 'bg-muted border-border'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                  {active ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Available Add-ons</CardTitle>
          <CardDescription>
            Premium features you can subscribe to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addOns?.map((addon) => {
              const isActive = userAddOns?.some((ua: any) => ua.add_on_id === addon.id);
              return (
                <div
                  key={addon.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{addon.name}</h3>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                    {isActive && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold">${addon.price_monthly}/mo</span>
                      <span className="text-muted-foreground"> or </span>
                      <span className="font-semibold">${addon.price_yearly}/yr</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {addon.feature_key}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Gate Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Gate Examples</CardTitle>
          <CardDescription>
            See how features are locked behind subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calendar Feature */}
          <div>
            <h4 className="font-medium mb-3">Calendar Integration</h4>
            <FeatureGate feature="calendar">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">
                  ✅ Calendar integration is active! You can sync with Google, Apple, and Microsoft calendars.
                </p>
              </div>
            </FeatureGate>
          </div>

          {/* Shopify Feature */}
          <div>
            <h4 className="font-medium mb-3">Shopify Integration</h4>
            <FeatureGate feature="shopify">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">
                  ✅ Shopify integration is active! Connect your store to sync products.
                </p>
                <Button className="mt-3" variant="outline" size="sm">
                  Connect Shopify Store
                </Button>
              </div>
            </FeatureGate>
          </div>

          {/* ERP Feature */}
          <div>
            <h4 className="font-medium mb-3">ERP Integrations</h4>
            <FeatureGate feature="erp_integrations">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">
                  ✅ ERP integrations are active! Connect to Xero, QuickBooks, and more.
                </p>
              </div>
            </FeatureGate>
          </div>

          {/* Wallpapers Feature */}
          <div>
            <h4 className="font-medium mb-3">Wallpapers Module</h4>
            <FeatureGate feature="wallpapers">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">
                  ✅ Wallpapers module is active! Create wallpaper quotes and measurements.
                </p>
              </div>
            </FeatureGate>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Raw feature data for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify({ features, userAddOns }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
