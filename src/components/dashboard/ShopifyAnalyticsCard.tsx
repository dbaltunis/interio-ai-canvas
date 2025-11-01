import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { ShoppingBag, DollarSign, Users, TrendingUp, RefreshCw, Package, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export const ShopifyAnalyticsCard = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics();
  const syncAnalytics = useSyncShopifyAnalytics();
  const { integration } = useShopifyIntegrationReal();
  const [isSyncingImport, setIsSyncingImport] = useState(false);
  const [isSyncingExport, setIsSyncingExport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get product sync stats
  const { data: productStats } = useQuery({
    queryKey: ['shopify-product-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: inventory } = await supabase
        .from('enhanced_inventory_items')
        .select('id, category')
        .eq('user_id', user.id)
        .eq('active', true)
        .neq('category', 'treatment_option');

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
    const isImport = direction === 'pull';
    const setLoading = isImport ? setIsSyncingImport : setIsSyncingExport;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isImport) {
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
        // Validate products before export (exclude treatment options)
        const { data: inventory } = await supabase
          .from('enhanced_inventory_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .neq('category', 'treatment_option');

        // Only validate names (SKU optional for non-stocked items)
        const invalidProducts = inventory?.filter(p => !p.name || p.name.trim() === '') || [];
        if (invalidProducts.length > 0) {
          toast({
            title: "Validation failed",
            description: `${invalidProducts.length} product(s) missing names. Add names first.`,
            variant: "destructive",
          });
          return;
        }

        const { data, error } = await supabase.functions.invoke('shopify-push-products', {
          body: { products: inventory }
        });

        if (error) throw error;

        toast({
          title: "✓ Products exported",
          description: `Synced ${data.synced || 0} products${data.errors > 0 ? ` (${data.errors} errors)` : ''}`,
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
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const lastSyncedDate = new Date(analytics.last_synced_at);
  const timeSinceSync = Math.floor((Date.now() - lastSyncedDate.getTime()) / 1000 / 60);

  return (
    <Card className="h-full flex flex-col border-primary/20 bg-gradient-to-br from-card to-card/95">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
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
      <CardContent className="flex-1 space-y-4">
        {/* Product Sync Section */}
        <div className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Product Sync Status</h3>
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
                {productStats?.categories || 0} categories{productStats?.topCategory ? ` • Top: ${productStats.topCategory[0]}` : ''}
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
              disabled={isSyncingImport || isSyncingExport}
              className="flex-1 gap-1 h-9"
              title="Import products from Shopify to InterioApp"
            >
              <ArrowDownLeft className={`h-3 w-3 ${isSyncingImport ? 'animate-spin' : ''}`} />
              <span className="text-xs">Import from Shopify</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleProductSync('push')}
              disabled={isSyncingImport || isSyncingExport || (productStats?.totalProducts || 0) === 0}
              className="flex-1 gap-1 h-9"
              title="Export InterioApp products to Shopify"
            >
              <ArrowUpRight className={`h-3 w-3 ${isSyncingExport ? 'animate-spin' : ''}`} />
              <span className="text-xs">Export to Shopify</span>
            </Button>
          </div>
        </div>

        {/* Analytics Grid */}
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
