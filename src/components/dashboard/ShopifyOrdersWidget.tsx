import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, DollarSign, ShoppingCart, Users, TrendingUp, RefreshCw, ExternalLink, Package } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const ShopifyOrdersWidget = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics(true);
  const { integration } = useShopifyIntegrationReal();
  const { mutate: syncAnalytics, isPending: isSyncing } = useSyncShopifyAnalytics();
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';

  const showSyncing = isLoading || isSyncing;
  const showEmptyState = !isLoading && !analytics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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
    <Card className="border-border/40 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Store className="h-4 w-4" />
            Shopify Performance
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant={showSyncing ? "secondary" : "success"} className="text-xs h-5">
              {showSyncing ? "Syncing" : "Live"}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => syncAnalytics()}
              disabled={isSyncing}
              className="h-6 w-6"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {showEmptyState ? (
          <div className="text-center py-6">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Revenue */}
            <div className="p-2 rounded-md border bg-card/50">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <p className="text-sm font-semibold truncate">
                {formatCurrency(analytics?.total_revenue || 0)}
              </p>
            </div>

            {/* Orders */}
            <div className="p-2 rounded-md border bg-card/50">
              <div className="flex items-center gap-1.5 mb-1">
                <ShoppingCart className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">Orders</span>
              </div>
              <p className="text-sm font-semibold">{analytics?.total_orders || 0}</p>
            </div>

            {/* Avg Order */}
            <div className="p-2 rounded-md border bg-card/50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3 w-3 text-purple-600" />
                <span className="text-xs text-muted-foreground">Avg Order</span>
              </div>
              <p className="text-sm font-semibold truncate">
                {formatCurrency(analytics?.avg_order_value || 0)}
              </p>
            </div>

            {/* Customers */}
            <div className="p-2 rounded-md border bg-card/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-muted-foreground">Customers</span>
              </div>
              <p className="text-sm font-semibold">{analytics?.total_customers || 0}</p>
            </div>
          </div>
        )}
        
        {/* Footer with store link */}
        {integration?.shop_domain && (
          <div className="mt-2 pt-2 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">{integration.shop_domain}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(`https://${integration.shop_domain}/admin`, '_blank')}
              className="h-6 px-2 text-xs gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Admin
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
