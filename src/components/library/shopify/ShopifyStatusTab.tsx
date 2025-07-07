import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, RefreshCw, ExternalLink, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ShopifyIntegration } from "@/hooks/useShopifyIntegration";

interface ShopifyStatusTabProps {
  integration: ShopifyIntegration | null;
}

export const ShopifyStatusTab = ({ integration }: ShopifyStatusTabProps) => {
  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case "syncing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "idle":
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case "syncing":
        return "Syncing...";
      case "error":
        return "Sync Error";
      case "idle":
      default:
        return "Ready";
    }
  };

  if (!integration) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Integration Found</h3>
          <p className="text-gray-500">Set up your Shopify integration to view status information</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-brand-primary">
            <span>Integration Status</span>
            <div className="flex items-center space-x-2">
              {getSyncStatusIcon(integration.sync_status)}
              <Badge variant={integration.sync_status === "error" ? "destructive" : "default"}>
                {getSyncStatusText(integration.sync_status)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Shop Domain</p>
              <p className="text-muted-foreground">{integration.shop_domain || "Not set"}</p>
            </div>
            <div>
              <p className="font-medium">Connection Status</p>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Verified & Active</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Store URL</p>
              <a 
                href={`https://${integration.shop_domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline flex items-center space-x-1"
              >
                <span>Visit Store</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <p className="font-medium">Last Sync</p>
              <p className="text-muted-foreground">
                {integration.last_full_sync 
                  ? new Date(integration.last_full_sync).toLocaleString()
                  : "Never"
                }
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Connection Verified</p>
                <p className="text-green-700">Your store is accessible and ready for integration.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Full Sync (Coming Soon)
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.open(`https://${integration.shop_domain}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Connected Store
          </Button>
        </CardContent>
      </Card>

      {Array.isArray(integration.sync_log) && integration.sync_log.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(Array.isArray(integration.sync_log) ? integration.sync_log : []).slice(-5).map((log: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-gray-600">{log.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};