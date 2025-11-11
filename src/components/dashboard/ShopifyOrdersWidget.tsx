import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, DollarSign, ShoppingCart, Users, TrendingUp, RefreshCw, ExternalLink, Package } from "lucide-react";

export const ShopifyOrdersWidget = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics(true);
  const { integration } = useShopifyIntegrationReal();
  const { mutate: syncAnalytics, isPending: isSyncing } = useSyncShopifyAnalytics();

  const showSyncing = isLoading || isSyncing;
  const showEmptyState = !isLoading && !analytics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/95 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Store className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">Shopify Store Performance</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {integration?.shop_domain}
              {analytics?.last_synced_at && ` • Last synced ${formatDate(analytics.last_synced_at)}`}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <Badge variant={showSyncing ? "secondary" : "success"} className="text-xs">
              {showSyncing ? "Syncing..." : "Connected"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncAnalytics()}
              disabled={isSyncing}
              className="gap-1 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline text-xs">Sync</span>
            </Button>
            {integration?.shop_domain && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const url = `https://${integration.shop_domain}/admin`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="gap-1 px-2"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden lg:inline text-xs">Shopify Admin</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {showEmptyState ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/20" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Your Shopify store is connected! When customers place orders, they'll appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Orders Grid - Fully responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Total Revenue */}
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-full bg-green-500/10">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-xl font-bold">
                  {formatCurrency(analytics?.total_revenue || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {analytics?.orders_this_month || 0} orders this month
                </p>
              </div>

              {/* Total Orders */}
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-full bg-blue-500/10">
                    <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Orders</p>
                <p className="text-xl font-bold">
                  {analytics?.total_orders || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  All time orders
                </p>
              </div>

              {/* Average Order Value */}
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-full bg-purple-500/10">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-xl font-bold">
                  {formatCurrency(analytics?.avg_order_value || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Average value
                </p>
              </div>

              {/* Total Customers */}
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-full bg-orange-500/10">
                    <Users className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Customers</p>
                <p className="text-xl font-bold">
                  {analytics?.total_customers || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Unique customers
                </p>
              </div>
            </div>

            {/* This Month Revenue */}
            <div className="p-3 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <p className="text-sm font-semibold">This Month</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-bold truncate">
                    {formatCurrency(analytics?.revenue_this_month || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-lg font-bold">
                    {analytics?.orders_this_month || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
