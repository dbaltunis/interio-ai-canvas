import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const ShopifyProductsSyncWidget = () => {
  const [isSyncingImport, setIsSyncingImport] = useState(false);
  const [isSyncingExport, setIsSyncingExport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['shopify-sync-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get total products in inventory
      const { data: inventory, error: invError } = await supabase
        .from('inventory')
        .select('id, category')
        .eq('user_id', user.id);

      if (invError) throw invError;

      // Get categories breakdown
      const categoryCount: Record<string, number> = {};
      inventory?.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Get last sync time
      const { data: integration } = await supabase
        .from('shopify_integrations')
        .select('last_sync_at, shop_domain')
        .eq('user_id', user.id)
        .single();

      return {
        totalProducts: inventory?.length || 0,
        categories: categoryCount,
        lastSyncAt: integration?.last_sync_at,
        shopDomain: integration?.shop_domain,
      };
    },
  });

  const handleSync = async (direction: 'pull' | 'push') => {
    const isImport = direction === 'pull';
    const setLoading = isImport ? setIsSyncingImport : setIsSyncingExport;
    
    setLoading(true);
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

      if (isImport) {
        const { data, error } = await supabase.functions.invoke('shopify-pull-products', {
          body: {
            userId: user.id,
            syncSettings: {
              sync_inventory: integration.sync_inventory,
              sync_prices: integration.sync_prices,
              sync_images: integration.sync_images,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "✓ Products imported",
          description: `Imported ${data.imported || 0}, Updated ${data.updated || 0} products from Shopify`,
        });
      } else {
        // Validate products before export
        const { data: inventory } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', user.id);

        const invalidProducts = inventory?.filter(p => !p.name || !p.sku) || [];
        if (invalidProducts.length > 0) {
          toast({
            title: "Validation failed",
            description: `${invalidProducts.length} product(s) are missing name or SKU. Please fix them before exporting.`,
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
          description: `Successfully synced ${data.synced || 0} products to Shopify${data.errors > 0 ? ` (${data.errors} errors)` : ''}`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['shopify-sync-stats'] });
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeSinceSync = stats?.lastSyncAt 
    ? Math.floor((Date.now() - new Date(stats.lastSyncAt).getTime()) / 1000 / 60)
    : null;

  const topCategories = Object.entries(stats?.categories || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Sync Status
          </div>
          {stats?.shopDomain && (
            <Badge variant="outline" className="text-xs">
              {stats.shopDomain}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Sync Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Products in InterioApp</div>
            <div className="text-3xl font-bold text-primary">{stats?.totalProducts || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.totalProducts === 0 ? 'No products yet' : 'Ready to sync'}
            </div>
          </div>
          
          <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
            <div className="text-sm text-muted-foreground mb-1">Last Synced</div>
            <div className="text-xl font-bold">
              {timeSinceSync !== null ? (
                timeSinceSync < 60 ? `${timeSinceSync}m ago` : `${Math.floor(timeSinceSync / 60)}h ago`
              ) : (
                'Never'
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {timeSinceSync === null ? 'No sync yet' : 'Auto-sync enabled'}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-3">Top Product Categories</div>
            <div className="space-y-2">
              {topCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sync Actions */}
        <div className="space-y-2 pt-4 border-t">
          <Button
            onClick={() => handleSync('pull')}
            disabled={isSyncingImport || isSyncingExport}
            className="w-full"
            variant="outline"
          >
            <ArrowDownLeft className={`mr-2 h-4 w-4 ${isSyncingImport ? 'animate-spin' : ''}`} />
            Import from Shopify
          </Button>
          <Button
            onClick={() => handleSync('push')}
            disabled={isSyncingImport || isSyncingExport || (stats?.totalProducts || 0) === 0}
            className="w-full"
            variant="outline"
          >
            <ArrowUpRight className={`mr-2 h-4 w-4 ${isSyncingExport ? 'animate-spin' : ''}`} />
            Export to Shopify
          </Button>
        </div>

        {stats?.totalProducts === 0 && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              No products found. Add products to your Shopify store or InterioApp inventory to start syncing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
