import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { ShoppingCart, TrendingUp, DollarSign, Package, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ShopifyOrdersWidget = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Shopify Store Performance
            </CardTitle>
            <CardDescription>
              Sales & orders from {analytics.shop_domain}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://${analytics.shop_domain}/admin/orders`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Shopify
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-green-900 dark:text-green-100">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(analytics.total_revenue || 0)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {analytics.orders_this_month || 0} orders this month
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Total Orders</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {analytics.total_orders || 0}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              All time orders
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-900 dark:text-purple-100">Avg Order</p>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(analytics.avg_order_value || 0)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Average value
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-orange-600" />
              <p className="text-xs font-medium text-orange-900 dark:text-orange-100">Customers</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {analytics.total_customers || 0}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Total customers
            </p>
          </div>
        </div>

        {/* This Month Stats */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            This Month
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(analytics.revenue_this_month || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-xl font-bold text-foreground">
                {analytics.orders_this_month || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Last Synced */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Last synced: {formatDate(analytics.last_synced_at)}</span>
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            Connected
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
