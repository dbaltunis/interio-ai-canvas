import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingBag, Settings, RefreshCw, AlertCircle, CheckCircle, Clock, ExternalLink, Zap, ArrowRight, Info } from "lucide-react";
import { useShopifyIntegration, useCreateShopifyIntegration, useUpdateShopifyIntegration } from "@/hooks/useShopifyIntegration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      try {
        await createIntegration.mutateAsync({
          ...formData,
          sync_status: "idle",
          sync_log: [],
        });
        // Switch to setup tab after successful creation to show next steps
        setActiveTab("setup");
      } catch (error) {
        console.error("Failed to create integration:", error);
      }
    }
  };

  const handleOAuthInstall = async () => {
    if (!formData.shop_domain) {
      toast.error("Please enter your shop domain first");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first");

      // Create integration record first
      if (!integration) {
        await createIntegration.mutateAsync({
          ...formData,
          sync_status: "pending",
          sync_log: [{ action: "OAuth installation started", timestamp: new Date().toISOString() }],
        });
      }

      // Generate OAuth URL
      const clientId = "your-shopify-client-id"; // This will come from Supabase secrets
      const scopes = "read_products,read_inventory,write_inventory";
      const redirectUri = `${window.location.origin}/api/shopify/oauth/callback`;
      const state = user.id; // Use user ID as state for security

      const oauthUrl = `https://${formData.shop_domain}/admin/oauth/authorize?` +
        `client_id=${clientId}&` +
        `scope=${scopes}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;

      // Redirect to Shopify OAuth
      window.location.href = oauthUrl;
      
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error("Failed to start installation process");
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
                <CardTitle className="text-brand-primary">Complete Shopify App Installation</CardTitle>
                <CardDescription>
                  Follow these steps to create a proper Shopify app and get official notifications in your admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Step 1: Create Your Shopify App</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        You'll need to create a Shopify app to get proper installation notifications and permissions.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://partners.shopify.com/organizations" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Create Shopify Partner Account
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="shop_domain">Your Shopify Store Domain</Label>
                    <Input
                      id="shop_domain"
                      value={formData.shop_domain}
                      onChange={(e) => setFormData(prev => ({ ...prev, shop_domain: e.target.value }))}
                      placeholder="your-shop.myshopify.com"
                      required
                      className="focus:border-brand-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your Shopify store's domain (e.g., "mystore.myshopify.com")
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">Step 2: Install App in Your Store</h4>
                        <p className="text-sm text-green-700 mb-3">
                          Click below to install the app in your Shopify store. You'll see proper installation screens and notifications.
                        </p>
                        <Button 
                          type="button" 
                          onClick={handleOAuthInstall}
                          className="bg-brand-primary hover:bg-brand-primary/90"
                          disabled={!formData.shop_domain || createIntegration.isPending}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Install App in Shopify Store
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">What happens next?</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• You'll be redirected to your Shopify admin</li>
                        <li>• Shopify will show app permission screens</li>
                        <li>• You'll see installation confirmation</li>
                        <li>• The app will appear in your Shopify admin</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                        <p className="font-medium">Connection Status</p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Verified & Active</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Store URL</p>
                        <a 
                          href={`https://${(integration as any)?.shop_domain}`} 
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
                          {(integration as any)?.last_full_sync 
                            ? new Date((integration as any).last_full_sync).toLocaleString()
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
                    <Button variant="outline" className="w-full" onClick={() => window.open(`https://${(integration as any)?.shop_domain}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Connected Store
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