import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ShoppingCart, Package, RefreshCw, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database } from "@/integrations/supabase/types";

type ShopifyIntegration = Database['public']['Tables']['shopify_integrations']['Row'];

interface ShopifyOverviewTabEnhancedProps {
  integration: ShopifyIntegration | null;
  onSyncProducts?: () => void;
  onSyncAnalytics?: () => void;
}

export const ShopifyOverviewTabEnhanced = ({ 
  integration, 
  onSyncProducts,
  onSyncAnalytics 
}: ShopifyOverviewTabEnhancedProps) => {
  const isConnected = integration?.is_connected;

  return (
    <div className="space-y-6">
      {!isConnected && (
        <Alert>
          <AlertDescription>
            Connect your Shopify store in the Setup tab to enable bidirectional sync between InterioApp and your online store.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Shopify Integration Overview</CardTitle>
          <CardDescription>
            Seamlessly sync products, orders, and customers between InterioApp and your Shopify store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Orders → Jobs</CardTitle>
                    <CardDescription className="text-xs">Shopify to InterioApp</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• New orders create work orders automatically</p>
                <p>• Status: <Badge>Online Store Lead</Badge></p>
                <p>• Paid orders marked as <Badge variant="outline">Online Store Sale</Badge></p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Products → Shopify</CardTitle>
                    <CardDescription className="text-xs">InterioApp to Shopify</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Push inventory to your Shopify store</p>
                <p>• Sync pricing, descriptions, images</p>
                <p>• Update quantities automatically</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onSyncProducts} 
              disabled={!isConnected}
              className="flex-1"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Push Products to Shopify
            </Button>
            <Button 
              onClick={onSyncAnalytics} 
              disabled={!isConnected}
              className="flex-1"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Pull Shopify Orders
            </Button>
            <Button 
              onClick={onSyncAnalytics} 
              disabled={!isConnected}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Gets Synced</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Orders & Sales</p>
                <p className="text-sm text-muted-foreground">
                  Shopify orders automatically create work orders in InterioApp with appropriate statuses
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Customers & Leads</p>
                <p className="text-sm text-muted-foreground">
                  Shopify customers are added to your CRM automatically for lead tracking
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Products & Inventory</p>
                <p className="text-sm text-muted-foreground">
                  Push your InterioApp inventory to Shopify with one click, including variants, pricing, and images
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-green-600">Connected</Badge>
              <p className="text-sm text-muted-foreground">
                {integration.shop_domain}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last synced: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
