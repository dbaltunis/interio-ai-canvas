import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingBag, Settings, RefreshCw, AlertCircle, CheckCircle, Clock, ExternalLink, Zap, ArrowRight, Info } from "lucide-react";
import { useShopifyIntegration, useCreateShopifyIntegration, useUpdateShopifyIntegration } from "@/hooks/useShopifyIntegration";

interface ShopifyIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopifyIntegrationDialog = ({ open, onOpenChange }: ShopifyIntegrationDialogProps) => {
  const { data: integration, isLoading } = useShopifyIntegration();
  const createIntegration = useCreateShopifyIntegration();
  const updateIntegration = useUpdateShopifyIntegration();
  const [activeTab, setActiveTab] = useState("overview");

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
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading Shopify integration...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-brand-primary">
            <ShoppingBag className="h-6 w-6" />
            <span>Shopify Store Integration</span>
          </DialogTitle>
          <DialogDescription>
            Connect your Shopify store to automatically sync products, inventory levels, pricing, and track sales in real-time.
          </DialogDescription>
        </DialogHeader>

        {!integration && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Why connect Shopify?</strong> Automatically sync your store inventory, track sales, update stock levels, and manage products from one central location.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-brand-primary/20">
                <CardHeader>
                  <CardTitle className="text-brand-primary flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    What happens when you connect?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Import Products</h4>
                      <p className="text-sm text-muted-foreground">All your Shopify products will be synced to your inventory</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-brand-secondary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Real-time Sync</h4>
                      <p className="text-sm text-muted-foreground">Inventory levels update automatically when sales happen</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Unified Management</h4>
                      <p className="text-sm text-muted-foreground">Manage all products from one dashboard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-700 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    What you can sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product Information</span>
                    <Badge variant="secondary">Automatic</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inventory Levels</span>
                    <Badge variant="secondary">Real-time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pricing & Variants</span>
                    <Badge variant="secondary">Bi-directional</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product Images</span>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sales Tracking</span>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!integration && (
              <Card className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Ready to connect your store?</h3>
                      <p className="text-brand-light/90">Get started in just a few minutes</p>
                    </div>
                    <Button variant="secondary" onClick={() => setActiveTab("setup")}>
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-primary">Connect Your Shopify Store</CardTitle>
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
                      className="focus:border-brand-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
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
                      className="focus:border-brand-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
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
                      className="focus:border-brand-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      For securing webhook communications
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={createIntegration.isPending || updateIntegration.isPending} className="bg-brand-primary hover:bg-brand-primary/90">
                      {integration ? "Update Integration" : "Connect Shopify"}
                    </Button>
                  </div>
                </form>

                {!integration && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Step-by-step setup:</h4>
                        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                          <li>Go to your Shopify Admin → Apps → App and sales channel settings</li>
                          <li>Click "Develop apps" → "Create an app"</li>
                          <li>Configure Admin API permissions for products, inventory, orders</li>
                          <li>Install the app and copy the access token</li>
                          <li>Paste the token above to connect</li>
                        </ol>
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                          <a href="https://help.shopify.com/en/manual/apps/app-development/private-apps" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Shopify Guide
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            {integration ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-primary">Sync Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Sync</Label>
                      <p className="text-sm text-muted-foreground">Automatically sync changes in real-time</p>
                    </div>
                    <Switch
                      checked={formData.auto_sync_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_sync_enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Inventory Levels</Label>
                      <p className="text-sm text-muted-foreground">Keep stock quantities synchronized</p>
                    </div>
                    <Switch
                      checked={formData.sync_inventory}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_inventory: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Prices</Label>
                      <p className="text-sm text-muted-foreground">Keep pricing synchronized</p>
                    </div>
                    <Switch
                      checked={formData.sync_prices}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_prices: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Product Images</Label>
                      <p className="text-sm text-muted-foreground">Download and sync product images</p>
                    </div>
                    <Switch
                      checked={formData.sync_images}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_images: checked }))}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={updateIntegration.isPending} className="bg-brand-primary hover:bg-brand-primary/90">
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
                    <CardTitle className="flex items-center justify-between text-brand-primary">
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
                        <p className="text-muted-foreground">{(integration as any)?.shop_domain || "Not set"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Last Sync</p>
                        <p className="text-muted-foreground">
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
                    <Button className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled>
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