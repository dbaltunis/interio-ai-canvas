import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { RefreshCw, Upload, Download, ArrowRightLeft, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

export const ShopifySyncManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { integration } = useShopifyIntegrationReal();
  const [open, setOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<string>("");

  const handlePullFromShopify = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus("Fetching products from Shopify...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setSyncProgress(20);
      setSyncStatus("Importing products...");

      const { data, error } = await supabase.functions.invoke('shopify-pull-products', {
        method: 'POST',
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

      setSyncProgress(100);
      setSyncStatus("Import complete!");
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      
      toast({
        title: 'Products Imported',
        description: `Successfully imported ${data.imported || 0} products from Shopify`,
      });
      
      setTimeout(() => setOpen(false), 2000);
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import products from Shopify',
        variant: 'destructive',
      });
      setSyncStatus("Import failed");
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
        setSyncStatus("");
      }, 2000);
    }
  };

  const handlePushToShopify = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus("Loading products...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setSyncProgress(20);
      setSyncStatus("Fetching inventory...");

      const { data: inventory, error: invError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);

      if (invError) throw invError;

      setSyncProgress(40);
      setSyncStatus(`Pushing ${inventory.length} products to Shopify...`);

      const { data, error: functionError } = await supabase.functions.invoke('shopify-push-products', {
        method: 'POST',
        body: { 
          products: inventory,
          syncSettings: {
            sync_inventory: integration?.sync_inventory ?? true,
            sync_prices: integration?.sync_prices ?? true,
            sync_images: integration?.sync_images ?? true,
          }
        }
      });

      if (functionError) throw functionError;

      setSyncProgress(100);
      setSyncStatus("Export complete!");

      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      
      toast({
        title: 'Products Pushed',
        description: `Successfully synced ${data.synced || 0} products to Shopify`,
      });
      
      setTimeout(() => setOpen(false), 2000);
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to push products to Shopify',
        variant: 'destructive',
      });
      setSyncStatus("Export failed");
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
        setSyncStatus("");
      }, 2000);
    }
  };

  const handleBidirectionalSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus("Starting bidirectional sync...");
    
    try {
      // First pull from Shopify
      setSyncStatus("Importing from Shopify...");
      await handlePullFromShopify();
      
      setSyncProgress(50);
      
      // Then push to Shopify
      setSyncStatus("Exporting to Shopify...");
      await handlePushToShopify();
      
      setSyncProgress(100);
      setSyncStatus("Sync complete!");
      
      toast({
        title: 'Bidirectional Sync Complete',
        description: 'All products synced successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!integration?.is_connected) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Shopify Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shopify Product Sync</DialogTitle>
          <DialogDescription>
            Manage product synchronization between InterioApp and your Shopify store: {integration.shop_domain}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Sync</TabsTrigger>
            <TabsTrigger value="settings">Sync Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            {isSyncing && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{syncStatus}</span>
                      <span className="text-sm text-muted-foreground">{syncProgress}%</span>
                    </div>
                    <Progress value={syncProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handlePullFromShopify}>
                <CardHeader>
                  <Download className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Import from Shopify</CardTitle>
                  <CardDescription className="text-xs">
                    Pull all products from your Shopify store into InterioApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled={isSyncing}>
                    <Download className="h-4 w-4 mr-2" />
                    Import Products
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handlePushToShopify}>
                <CardHeader>
                  <Upload className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Export to Shopify</CardTitle>
                  <CardDescription className="text-xs">
                    Push all InterioApp products to your Shopify store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled={isSyncing}>
                    <Upload className="h-4 w-4 mr-2" />
                    Export Products
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handleBidirectionalSync}>
                <CardHeader>
                  <ArrowRightLeft className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">Full Sync</CardTitle>
                  <CardDescription className="text-xs">
                    Sync products both ways for complete synchronization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled={isSyncing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Full Sync
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">What Gets Synced?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Product names & descriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.sync_prices ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.sync_inventory ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Stock levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.sync_images ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Images</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>SKU & categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Product variants</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900 mb-1">Handling Large Catalogs</p>
                    <p className="text-amber-800 text-xs">
                      Syncing thousands of products may take several minutes. The system processes in batches to ensure reliability.
                      You can continue working while sync runs in the background.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Sync Settings</CardTitle>
                <CardDescription className="text-xs">
                  Configure what data to sync. Changes apply immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Inventory Sync</p>
                    <p className="text-xs text-muted-foreground">Sync stock levels</p>
                  </div>
                  <Badge variant={integration.sync_inventory ? "default" : "secondary"}>
                    {integration.sync_inventory ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Price Sync</p>
                    <p className="text-xs text-muted-foreground">Sync product pricing</p>
                  </div>
                  <Badge variant={integration.sync_prices ? "default" : "secondary"}>
                    {integration.sync_prices ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Image Sync</p>
                    <p className="text-xs text-muted-foreground">Sync product images</p>
                  </div>
                  <Badge variant={integration.sync_images ? "default" : "secondary"}>
                    {integration.sync_images ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {integration.last_sync_at 
                      ? new Date(integration.last_sync_at).toLocaleString()
                      : 'Never synced'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => window.open('/settings?section=shopify-statuses', '_blank')}>
                Configure Sync Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};