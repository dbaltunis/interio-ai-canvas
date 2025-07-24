
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, RefreshCw, Settings, Zap, Globe, Database } from "lucide-react";

export const InventoryIntegrationManager = () => {
  const [integrations, setIntegrations] = useState([
    { id: 1, name: "Shopify", type: "ecommerce", status: "connected", lastSync: "2024-01-15 10:30" },
    { id: 2, name: "WooCommerce", type: "ecommerce", status: "disconnected", lastSync: null },
    { id: 3, name: "BigCommerce", type: "ecommerce", status: "pending", lastSync: null },
    { id: 4, name: "Custom API", type: "api", status: "connected", lastSync: "2024-01-15 09:15" }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'ecommerce': return <ShoppingBag className="h-4 w-4" />;
      case 'api': return <Database className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Management</CardTitle>
          <CardDescription>Connect your inventory to external platforms and APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="platforms">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="sync">Sync Settings</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="platforms" className="space-y-4">
              <div className="grid gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(integration.type)}
                          <div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{integration.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          {integration.status === 'connected' && (
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync
                            </Button>
                          )}
                        </div>
                      </div>
                      {integration.lastSync && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last sync: {integration.lastSync}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sync Settings</CardTitle>
                  <CardDescription>Configure how your inventory syncs with external platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-sync">Auto Sync</Label>
                      <p className="text-sm text-gray-600">Automatically sync inventory changes</p>
                    </div>
                    <Switch id="auto-sync" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync-prices">Sync Prices</Label>
                      <p className="text-sm text-gray-600">Update prices on external platforms</p>
                    </div>
                    <Switch id="sync-prices" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync-stock">Sync Stock Levels</Label>
                      <p className="text-sm text-gray-600">Update stock quantities in real-time</p>
                    </div>
                    <Switch id="sync-stock" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync-images">Sync Images</Label>
                      <p className="text-sm text-gray-600">Upload product images to platforms</p>
                    </div>
                    <Switch id="sync-images" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="sync-frequency">Sync Frequency</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="batch-size">Batch Size</Label>
                      <Input id="batch-size" type="number" placeholder="100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Configuration</CardTitle>
                  <CardDescription>Set up webhooks for real-time inventory updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://your-app.com/webhook/inventory"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <Input 
                      id="webhook-secret" 
                      type="password"
                      placeholder="Enter webhook secret"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Webhook Events</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="stock-update" />
                        <label htmlFor="stock-update" className="text-sm">Stock Level Updates</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="price-update" />
                        <label htmlFor="price-update" className="text-sm">Price Changes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="new-product" />
                        <label htmlFor="new-product" className="text-sm">New Products</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Test Webhook
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
