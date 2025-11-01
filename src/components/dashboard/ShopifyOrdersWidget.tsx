import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, DollarSign, ShoppingCart, Users, TrendingUp, RefreshCw, ExternalLink, Package, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const ShopifyOrdersWidget = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics(true);
  const { integration } = useShopifyIntegrationReal();
  const { mutate: syncAnalytics, isPending: isSyncing } = useSyncShopifyAnalytics();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);

  // Get product sync stats
  const { data: productStats } = useQuery({
    queryKey: ['shopify-product-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: inventory } = await supabase
        .from('inventory')
        .select('id, category')
        .eq('user_id', user.id);

      const categoryCount: Record<string, number> = {};
      inventory?.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      return {
        totalProducts: inventory?.length || 0,
        categories: Object.keys(categoryCount).length,
        topCategory: Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0],
      };
    },
  });

  const handleProductSync = async (direction: 'pull' | 'push') => {
    setIsSyncingProducts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (direction === 'pull') {
        const { data, error } = await supabase.functions.invoke('shopify-pull-products', {
          body: {
            userId: user.id,
            syncSettings: {
              sync_inventory: integration?.sync_inventory ?? true,
              sync_prices: integration?.sync_prices ?? true,
              sync_images: integration?.sync_images ?? true,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "✓ Products imported",
          description: `Imported ${data.imported || 0}, Updated ${data.updated || 0} products`,
        });
      } else {
        const { data: inventory } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', user.id);

        const { data, error } = await supabase.functions.invoke('shopify-push-products', {
          body: {
            products: inventory,
            syncSettings: {
              sync_inventory: integration?.sync_inventory ?? true,
              sync_prices: integration?.sync_prices ?? true,
              sync_images: integration?.sync_images ?? true,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "✓ Products exported",
          description: `Pushed ${inventory?.length || 0} products to Shopify`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['shopify-product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncingProducts(false);
    }
  };

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
          <div className="space-y-4">
            {/* Product Sync Section */}
            <div className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Product Sync</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {integration?.last_sync_at ? `Last: ${formatDate(integration.last_sync_at)}` : 'Not synced'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-md bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-1">InterioApp Inventory</div>
                  <div className="text-2xl font-bold text-primary">{productStats?.totalProducts || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {productStats?.categories || 0} categories • {productStats?.topCategory ? `Top: ${productStats.topCategory[0]}` : 'No products'}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Shopify Store</div>
                  <div className="text-2xl font-bold text-orange-600">?</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Click "Import" to check
                  </div>
                </div>
              </div>

              {(productStats?.totalProducts || 0) === 0 && (
                <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-600">
                  <strong>Note:</strong> Add products in Library/Inventory first, then use "Export to Shopify"
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProductSync('pull')}
                  disabled={isSyncingProducts}
                  className="flex-1 gap-1 h-9"
                  title="Import products from Shopify to InterioApp"
                >
                  <ArrowDownLeft className={`h-3 w-3 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                  <span className="text-xs">Import from Shopify</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProductSync('push')}
                  disabled={isSyncingProducts || (productStats?.totalProducts || 0) === 0}
                  className="flex-1 gap-1 h-9"
                  title="Export InterioApp products to Shopify"
                >
                  <ArrowUpRight className={`h-3 w-3 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                  <span className="text-xs">Export to Shopify</span>
                </Button>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics?.total_revenue || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.orders_this_month || 0} orders this month
                </p>
              </div>

              {/* Total Orders */}
              <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold">
                  {analytics?.total_orders || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All time orders
                </p>
              </div>

              {/* Average Order Value */}
              <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics?.avg_order_value || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Average value
                </p>
              </div>

              {/* Total Customers */}
              <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Customers</p>
                <p className="text-2xl font-bold">
                  {analytics?.total_customers || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique customers
                </p>
              </div>

              {/* This Month Revenue */}
              <div className="col-span-2 p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">This Month</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(analytics?.revenue_this_month || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-xl font-bold">
                      {analytics?.orders_this_month || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
