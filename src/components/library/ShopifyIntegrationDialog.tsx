
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Settings, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useShopifyIntegration, useCreateShopifyIntegration, useUpdateShopifyIntegration } from "@/hooks/useShopifyIntegration";

interface ShopifyIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopifyIntegrationDialog = ({ open, onOpenChange }: ShopifyIntegrationDialogProps) => {
  const { data: integration, isLoading } = useShopifyIntegration();
  const createIntegration = useCreateShopifyIntegration();
  const updateIntegration = useUpdateShopifyIntegration();

  const [formData, setFormData] = useState({
    shop_domain: (integration as any)?.shop_domain || "",
    access_token: (integration as any)?.access_token || "",
    webhook_secret: (integration as any)?.webhook_secret || "",
    auto_sync_enabled: (integration as any)?.auto_sync_enabled || false,
    sync_inventory: (integration as any)?.sync_inventory !== undefined ? (integration as any).sync_inventory : true,
    sync_prices: (integration as any)?.sync_prices !== undefined ? (integration as any).sync_prices : true,
    sync_images: (integration as any)?.sync_images !== undefined ? (integration as any).sync_images : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (integration) {
      await updateIntegration.mutateAsync({ ...formData, id: (integration as any).id });
    } else {
      await createIntegration.mutateAsync({
        ...formData,
        sync_status: "idle",
        sync_log: [],
      });
    }
  };

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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading Shopify integration...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Shopify Integration</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Shopify Store</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="shop_domain">Shop Domain</Label>
                    <Input
                      id="shop_domain"
                      value={formData.shop_domain}
                      onChange={(e) => setFormData(prev => ({ ...prev, shop_domain: e.target.value }))}
                      placeholder="your-shop.myshopify.com"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your Shopify store's domain (without https://)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="access_token">Private App Access Token</Label>
                    <Input
                      id="access_token"
                      type="password"
                      value={formData.access_token}
                      onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                      placeholder="shpat_..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Create a private app in your Shopify admin to get this token
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhook_secret"
                      value={formData.webhook_secret}
                      onChange={(e) => setFormData(prev => ({ ...prev, webhook_secret: e.target.value }))}
                      placeholder="Enter webhook secret"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      For securing webhook communications
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={createIntegration.isPending || updateIntegration.isPending}>
                      {integration ? "Update Integration" : "Connect Shopify"}
                    </Button>
                  </div>
                </form>

                {!integration && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Setup Instructions:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
                      <li>Go to your Shopify Admin → Apps → App and sales channel settings</li>
                      <li>Click "Develop apps" → "Create an app"</li>
                      <li>Configure Admin API permissions for products, inventory, etc.</li>
                      <li>Install the app and copy the access token</li>
                      <li>Paste the token above to connect</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            {integration ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sync Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Sync</Label>
                      <p className="text-sm text-gray-500">Automatically sync changes</p>
                    </div>
                    <Switch
                      checked={formData.auto_sync_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_sync_enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Inventory</Label>
                      <p className="text-sm text-gray-500">Keep stock levels in sync</p>
                    </div>
                    <Switch
                      checked={formData.sync_inventory}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_inventory: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Prices</Label>
                      <p className="text-sm text-gray-500">Keep pricing synchronized</p>
                    </div>
                    <Switch
                      checked={formData.sync_prices}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_prices: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Images</Label>
                      <p className="text-sm text-gray-500">Sync product images</p>
                    </div>
                    <Switch
                      checked={formData.sync_images}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_images: checked }))}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={updateIntegration.isPending}>
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Shopify Integration</h3>
                  <p className="text-gray-500">Connect your Shopify store first to configure sync settings</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            {integration ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Integration Status</span>
                      <div className="flex items-center space-x-2">
                        {getSyncStatusIcon((integration as any)?.sync_status || "idle")}
                        <Badge variant={(integration as any)?.sync_status === "error" ? "destructive" : "default"}>
                          {getSyncStatusText((integration as any)?.sync_status || "idle")}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Shop Domain</p>
                        <p className="text-gray-600">{(integration as any)?.shop_domain || "Not set"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Last Sync</p>
                        <p className="text-gray-600">
                          {(integration as any)?.last_full_sync 
                            ? new Date((integration as any).last_full_sync).toLocaleString()
                            : "Never"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sync Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" disabled>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Full Sync (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Test Connection (Coming Soon)
                    </Button>
                  </CardContent>
                </Card>

                {(integration as any)?.sync_log && (integration as any).sync_log.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {((integration as any)?.sync_log || []).slice(-5).map((log: any, index: number) => (
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
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Integration Found</h3>
                  <p className="text-gray-500">Set up your Shopify integration to view status information</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
