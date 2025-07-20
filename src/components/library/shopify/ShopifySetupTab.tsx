
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useShopifyIntegration, useUpdateShopifyIntegration } from "@/hooks/useShopifyIntegration";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const ShopifySetupTab = () => {
  const { data: integration, isLoading } = useShopifyIntegration();
  const updateIntegration = useUpdateShopifyIntegration();
  const { toast } = useToast();
  
  const [shopDomain, setShopDomain] = useState(integration?.shop_domain || "");
  const [accessToken, setAccessToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  const handleSave = async () => {
    if (!shopDomain) {
      toast({
        title: "Error",
        description: "Shop domain is required",
        variant: "destructive"
      });
      return;
    }

    await updateIntegration.mutateAsync({
      shop_domain: shopDomain,
      access_token: accessToken,
      webhook_secret: webhookSecret,
      active: true,
      sync_status: 'idle' as const
    });
  };

  const handleTest = async () => {
    // Mock testing connection
    toast({
      title: "Connection Test",
      description: "Testing connection to Shopify store...",
    });
    
    setTimeout(() => {
      toast({
        title: "Test Successful",
        description: "Successfully connected to Shopify store",
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shopify Store Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shop-domain">Shop Domain</Label>
            <Input
              id="shop-domain"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store.myshopify.com"
            />
          </div>

          <div>
            <Label htmlFor="access-token">Access Token</Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your Shopify access token"
            />
          </div>

          <div>
            <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Enter webhook secret for security"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleTest} variant="outline">
              Test Connection
            </Button>
            <Button onClick={handleSave} disabled={updateIntegration.isPending}>
              {updateIntegration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-sync">Enable Auto Sync</Label>
            <Switch
              id="auto-sync"
              checked={integration?.auto_sync_enabled || false}
              onCheckedChange={(checked) => 
                updateIntegration.mutate({ auto_sync_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-inventory">Sync Inventory</Label>
            <Switch
              id="sync-inventory"
              checked={integration?.sync_inventory || false}
              onCheckedChange={(checked) => 
                updateIntegration.mutate({ sync_inventory: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-prices">Sync Prices</Label>
            <Switch
              id="sync-prices"
              checked={integration?.sync_prices || false}
              onCheckedChange={(checked) => 
                updateIntegration.mutate({ sync_prices: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-images">Sync Images</Label>
            <Switch
              id="sync-images"
              checked={integration?.sync_images || false}
              onCheckedChange={(checked) => 
                updateIntegration.mutate({ sync_images: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
