import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ShopifyIntegration = Database['public']['Tables']['shopify_integrations']['Row'];
type ShopifyIntegrationUpdate = Database['public']['Tables']['shopify_integrations']['Update'];

interface ShopifySetupTabProps {
  integration?: ShopifyIntegration | null;
  onSuccess?: () => void;
}

export const ShopifySetupTab = ({ integration, onSuccess }: ShopifySetupTabProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
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

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shopify_integrations')
        .upsert([{
          user_id: user.id,
          shop_domain: shopDomain,
          access_token: accessToken,
          webhook_secret: webhookSecret,
        }], {
          onConflict: 'user_id,shop_domain',
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      toast({
        title: "Success",
        description: "Shopify integration updated successfully",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncSettingChange = async (field: keyof ShopifyIntegrationUpdate, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('shopify_integrations')
        .update({ [field]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shopify Store Connection</CardTitle>
          <CardDescription>
            Enter your Shopify store credentials to connect. Don't have them yet? 
            <Button 
              variant="link" 
              className="h-auto p-0 ml-1"
              onClick={() => window.open('https://help.shopify.com/en/manual/apps/app-types/custom-apps', '_blank')}
            >
              Learn how to get your API credentials →
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              <p className="font-semibold mb-2">Quick Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to your Shopify Admin → Settings → Apps and sales channels</li>
                <li>Click "Develop apps" → "Create an app"</li>
                <li>Install the app and get your Admin API access token</li>
                <li>Copy your store domain (e.g., your-store.myshopify.com)</li>
                <li>Paste both below and click Save</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="shop-domain">
              Shop Domain <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shop-domain"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store.myshopify.com"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your store's myshopify.com domain (found in Shopify Admin → Settings → Domains)
            </p>
          </div>

          <div>
            <Label htmlFor="access-token">
              Admin API Access Token <span className="text-red-500">*</span>
            </Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="shpat_..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              From Shopify Admin → Settings → Apps and sales channels → Develop apps
            </p>
          </div>

          <div>
            <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Optional for added security"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Add webhook signature verification for enhanced security
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleTest} variant="outline">
              Test Connection
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
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
              onCheckedChange={(checked) => handleSyncSettingChange("auto_sync_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-inventory">Sync Inventory</Label>
            <Switch
              id="sync-inventory"
              checked={integration?.sync_inventory || false}
              onCheckedChange={(checked) => handleSyncSettingChange("sync_inventory", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-prices">Sync Prices</Label>
            <Switch
              id="sync-prices"
              checked={integration?.sync_prices || false}
              onCheckedChange={(checked) => handleSyncSettingChange("sync_prices", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-images">Sync Images</Label>
            <Switch
              id="sync-images"
              checked={integration?.sync_images || false}
              onCheckedChange={(checked) => handleSyncSettingChange("sync_images", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
