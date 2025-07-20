
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyIntegration } from "@/hooks/useShopifyIntegration";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

interface ShopifyStatusTabProps {
  integration?: ShopifyIntegration | null;
}

export const ShopifyStatusTab = ({ integration }: ShopifyStatusTabProps) => {
  const { toast } = useToast();

  const handleManualSync = () => {
    toast({
      title: "Sync Started",
      description: "Manual synchronization has been initiated",
    });
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'idle':
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'syncing':
        return <Badge variant="secondary">Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'idle':
      default:
        return <Badge variant="default">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Connection Status</span>
            {getSyncStatusIcon(integration?.sync_status || 'idle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Store Domain:</span>
              <span className="font-medium">
                {integration?.shop_domain || 'Not configured'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getSyncStatusBadge(integration?.sync_status || 'idle')}
            </div>

            <div className="flex items-center justify-between">
              <span>Auto Sync:</span>
              <Badge variant={integration?.auto_sync_enabled ? "default" : "secondary"}>
                {integration?.auto_sync_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Last Sync:</span>
              <span className="text-sm text-gray-500">
                {integration?.last_sync_at 
                  ? new Date(integration.last_sync_at).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Last Full Sync:</span>
              <span className="text-sm text-gray-500">
                {integration?.last_full_sync 
                  ? new Date(integration.last_full_sync).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleManualSync} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Manual Sync
            </Button>
            
            <div className="text-sm text-gray-600">
              <p>Manual sync will update:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {integration?.sync_inventory && <li>Inventory levels</li>}
                {integration?.sync_prices && <li>Product prices</li>}
                {integration?.sync_images && <li>Product images</li>}
                {integration?.sync_products && <li>Product catalog</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Products Synced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Orders Imported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Inventory Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
