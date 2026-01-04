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
import { useHasPermission } from "@/hooks/usePermissions";

export const ShopifyAnalyticsCard = () => {
  const { data: analytics, isLoading } = useShopifyAnalytics();
  const syncAnalytics = useSyncShopifyAnalytics();
  const { integration } = useShopifyIntegrationReal();
  const [isSyncingImport, setIsSyncingImport] = useState(false);
  const [isSyncingExport, setIsSyncingExport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canManageShopify = useHasPermission('manage_shopify');

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
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
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
    <Card variant="analytics" className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">Shopify Store Analytics</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {analytics.shop_domain} • Last synced {timeSinceSync < 60 ? `${timeSinceSync}m` : `${Math.floor(timeSinceSync / 60)}h`} ago
            </p>
          </div>
          {canManageShopify && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => syncAnalytics.mutate()}
              disabled={syncAnalytics.isPending}
              title="Refresh analytics data"
              className="h-7 w-7 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncAnalytics.isPending ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Product Sync - Compact inline */}
        {canManageShopify && (
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30">
            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">{productStats?.totalProducts || 0} products</span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleProductSync('pull')}
              disabled={isSyncingImport || isSyncingExport}
              className="h-6 px-2"
            >
              <ArrowDownLeft className={`h-3 w-3 ${isSyncingImport ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleProductSync('push')}
              disabled={isSyncingImport || isSyncingExport || (productStats?.totalProducts || 0) === 0}
              className="h-6 px-2"
            >
              <ArrowUpRight className={`h-3 w-3 ${isSyncingExport ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {/* Analytics Grid - Simplified */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg border border-border/50 bg-card">
            <div className="text-[10px] text-muted-foreground mb-0.5">Revenue</div>
            <p className="text-lg font-bold">{formatCurrency(analytics.total_revenue)}</p>
          </div>

          <div className="p-2 rounded-lg border border-border/50 bg-card">
            <div className="text-[10px] text-muted-foreground mb-0.5">Orders</div>
            <p className="text-lg font-bold">{analytics.total_orders}</p>
          </div>

          <div className="p-2 rounded-lg border border-border/50 bg-card">
            <div className="text-[10px] text-muted-foreground mb-0.5">Customers</div>
            <p className="text-lg font-bold">{analytics.total_customers}</p>
          </div>

          <div className="p-2 rounded-lg border border-border/50 bg-card">
            <div className="text-[10px] text-muted-foreground mb-0.5">Avg Order</div>
            <p className="text-lg font-bold">{formatCurrency(analytics.avg_order_value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
