import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { ShoppingBag, DollarSign, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ShopifyAnalyticsCard = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics();
  const syncAnalytics = useSyncShopifyAnalytics();

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
    <Card className="glass-morphism border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
                <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Shopify Store Analytics
            </CardTitle>
            <CardDescription className="mt-2">
              {analytics.shop_domain} • Last synced {timeSinceSync < 60 ? `${timeSinceSync}m` : `${Math.floor(timeSinceSync / 60)}h`} ago
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncAnalytics.mutate()}
            disabled={syncAnalytics.isPending}
            className="hover-lift"
          >
            <RefreshCw className={`h-4 w-4 ${syncAnalytics.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
            <div className="flex items-center text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-2">
                <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics.total_orders}</p>
            <p className="text-xs text-muted-foreground">
              {analytics.orders_this_month} this month
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
            <div className="flex items-center text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 mr-2">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatCurrency(analytics.total_revenue)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.revenue_this_month)} this month
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
            <div className="flex items-center text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 mr-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium">Customers</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics.total_customers}</p>
            <p className="text-xs text-muted-foreground">
              Total registered
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
            <div className="flex items-center text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 mr-2">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium">Avg Order Value</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatCurrency(analytics.avg_order_value)}</p>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
