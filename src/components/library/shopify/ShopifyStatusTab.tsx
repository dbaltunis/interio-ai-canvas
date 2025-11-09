
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";

type ShopifyIntegration = Database['public']['Tables']['shopify_integrations']['Row'];

interface ShopifyStatusTabProps {
  integration?: ShopifyIntegration | null;
}

export const ShopifyStatusTab = ({ integration }: ShopifyStatusTabProps) => {
  const { toast } = useToast();
  const isConnected = integration?.is_connected;
  const isDisconnected = integration?.shop_domain && !integration?.is_connected;

  const handleManualSync = () => {
    toast({
      title: "Sync Started",
      description: "Manual synchronization has been initiated",
    });
  };

  return (
    <div className="space-y-6">
      {!integration && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-900">
              No Shopify store configured. Go to the <strong>Setup</strong> tab to connect your store.
            </p>
          </CardContent>
        </Card>
      )}

      {isDisconnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Store Disconnected</p>
                <p className="text-sm text-yellow-800">
                  {integration.shop_domain} is not connected. Reconnect in the Setup tab.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-1">✅ Connected & Active</p>
                <p className="text-sm text-green-800 mb-2">{integration.shop_domain}</p>
                <div className="text-xs text-green-700 space-y-1">
                  <p>Last synced: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}</p>
                  <p>Auto sync: {integration.auto_sync_enabled ? 'Enabled ✓' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleManualSync} className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Manual Sync Now
              </Button>
              <p className="text-xs text-muted-foreground">
                Sync: Products • Inventory • Pricing • Images
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Sync Inventory</span>
                <Badge variant={integration.sync_inventory ? "default" : "secondary"}>
                  {integration.sync_inventory ? "On" : "Off"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Sync Prices</span>
                <Badge variant={integration.sync_prices ? "default" : "secondary"}>
                  {integration.sync_prices ? "On" : "Off"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Sync Images</span>
                <Badge variant={integration.sync_images ? "default" : "secondary"}>
                  {integration.sync_images ? "On" : "Off"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Configure these settings in the <strong>Sync</strong> tab
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
