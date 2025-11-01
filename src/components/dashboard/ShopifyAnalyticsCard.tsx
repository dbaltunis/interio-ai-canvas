import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { ShoppingBag, DollarSign, Users, TrendingUp, RefreshCw, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const ShopifyAnalyticsCard = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics();
  const syncAnalytics = useSyncShopifyAnalytics();
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleProductSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: integration } = await supabase
        .from('shopify_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .single();

      if (!integration) {
        toast({
          title: "Not connected",
          description: "Please connect your Shopify store first",
          variant: "destructive",
        });
        return;
      }

      // Pull products from Shopify
      const { data, error } = await supabase.functions.invoke('shopify-pull-products', {
        body: {
          userId: user.id,
          syncSettings: {
            sync_inventory: integration.sync_inventory ?? true,
            sync_prices: integration.sync_prices ?? true,
            sync_images: integration.sync_images ?? true,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "✓ Products synced",
        description: `Imported ${data.imported || 0}, Updated ${data.updated || 0} products`,
      });

      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: analytics.analytics_data?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const lastSyncedDate = new Date(analytics.last_synced_at);
  const timeSinceSync = Math.floor((Date.now() - lastSyncedDate.getTime()) / 1000 / 60);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopify Store Analytics
            </CardTitle>
            <CardDescription>
              {analytics.shop_domain} • Last synced {timeSinceSync < 60 ? `${timeSinceSync}m` : `${Math.floor(timeSinceSync / 60)}h`} ago
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncAnalytics.mutate()}
            disabled={syncAnalytics.isPending}
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-4 w-4 ${syncAnalytics.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span className="text-sm">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{analytics.total_orders}</p>
            <p className="text-xs text-muted-foreground">
              {analytics.orders_this_month} this month
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.revenue_this_month)} this month
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">Customers</span>
            </div>
            <p className="text-2xl font-bold">{analytics.total_customers}</p>
            <p className="text-xs text-muted-foreground">
              Total registered
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="text-sm">Avg Order Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(analytics.avg_order_value)}</p>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
