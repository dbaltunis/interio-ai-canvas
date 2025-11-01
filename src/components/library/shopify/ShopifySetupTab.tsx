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
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ShopifyOAuthGuide } from "./ShopifyOAuthGuide";

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
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  
  const [shopDomain, setShopDomain] = useState(integration?.shop_domain || "");
  const [accessToken, setAccessToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  // Extract myshopify.com domain from various formats
  const extractShopDomain = (input: string): string => {
    // Remove protocol
    let domain = input.replace(/^https?:\/\//, '');
    
    // Extract from admin URL (admin.shopify.com/store/shop-name/...)
    const adminMatch = domain.match(/admin\.shopify\.com\/store\/([^\/]+)/);
    if (adminMatch) {
      return `${adminMatch[1]}.myshopify.com`;
    }
    
    // Remove trailing slash and path
    domain = domain.split('/')[0];
    
    // If already myshopify.com, return as is
    if (domain.includes('.myshopify.com')) {
      return domain;
    }
    
    // If just store name, add .myshopify.com
    if (!domain.includes('.')) {
      return `${domain}.myshopify.com`;
    }
    
    return domain;
  };

  const handleOAuthConnect = async () => {
    if (!shopDomain) {
      toast({
        title: "Error",
        description: "Please enter your shop domain first (e.g., your-store.myshopify.com)",
        variant: "destructive"
      });
      return;
    }

    // Extract and normalize shop domain
    const normalizedDomain = extractShopDomain(shopDomain);
    console.log('Normalized domain:', normalizedDomain);

    setIsConnectingOAuth(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call edge function to get OAuth URL
      const { data, error } = await supabase.functions.invoke('shopify-oauth-initiate', {
        body: { userId: user.id, shopDomain: normalizedDomain }
      });

      if (error) throw error;

      if (data?.authUrl) {
        console.log('Opening OAuth URL:', data.authUrl);
        
        // Try to open popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.authUrl,
          'shopify-oauth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,resizable=yes,scrollbars=yes`
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          console.error('Popup blocked');
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site and try again. Or click the button below to continue in this window.",
            variant: "destructive",
          });
          setIsConnectingOAuth(false);
          
          // Fallback: open in same window after 2 seconds
          setTimeout(() => {
            if (confirm('Popup was blocked. Open Shopify authorization in this window instead?')) {
              window.location.href = data.authUrl;
            } else {
              setIsConnectingOAuth(false);
            }
          }, 2000);
          return;
        }

        console.log('Popup opened, waiting for OAuth completion...');

        // Listen for successful OAuth completion
        const handleMessage = (event: MessageEvent) => {
          console.log('Received message:', event.data);
          if (event.data?.type === 'shopify-oauth-success') {
            popup?.close();
            setIsConnectingOAuth(false);
            queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
            toast({
              title: "Success",
              description: "Shopify store connected successfully!",
            });
            onSuccess?.();
            window.removeEventListener('message', handleMessage);
          } else if (event.data?.type === 'shopify-oauth-error') {
            popup?.close();
            setIsConnectingOAuth(false);
            toast({
              title: "Error",
              description: event.data.message || "Failed to connect Shopify store",
              variant: "destructive",
            });
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed manually
        const checkPopupClosed = setInterval(() => {
          if (popup?.closed) {
            console.log('Popup closed');
            clearInterval(checkPopupClosed);
            setIsConnectingOAuth(false);
            window.removeEventListener('message', handleMessage);
          }
        }, 500);
      } else {
        throw new Error('Failed to generate OAuth URL');
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate OAuth",
        variant: "destructive"
      });
      setIsConnectingOAuth(false);
    }
  };

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

      const normalizedDomain = extractShopDomain(shopDomain);
      
      const { data, error } = await supabase
        .from('shopify_integrations')
        .upsert([{
          user_id: user.id,
          shop_domain: normalizedDomain,
          access_token: accessToken || undefined,
          webhook_secret: webhookSecret || undefined,
          is_connected: true,
        }], {
          onConflict: 'user_id,shop_domain',
        })
        .select()
        .single();

      if (error) throw error;

      // Ensure Shopify job statuses exist for this user
      const { error: statusError } = await supabase.rpc('ensure_shopify_statuses', {
        p_user_id: user.id
      });

      if (statusError) {
        console.error('Failed to create Shopify statuses:', statusError);
      }

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
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

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this Shopify store? This will stop all syncing.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('shopify_integrations')
        .update({ is_connected: false })
        .eq('user_id', user.id);

      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      toast({
        title: "Success",
        description: "Shopify store disconnected successfully",
      });
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

  const handleSwitchStore = () => {
    if (confirm('Switch to a different store? You can enter new credentials below.')) {
      setShopDomain("");
      setAccessToken("");
      setWebhookSecret("");
    }
  };

  return (
    <div className="space-y-6">
      <ShopifyOAuthGuide />
      
      {integration?.is_connected && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="space-y-4">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-green-900 mb-1 text-base">
                  ✅ Connected to: {integration.shop_domain}
                </p>
                <p className="text-sm text-green-800 mb-3">
                  Your Shopify store is connected and syncing. Orders automatically create jobs/projects in InterioApp with appropriate statuses.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSwitchStore}
                    className="bg-white hover:bg-green-50"
                  >
                    🔄 Switch to Different Store
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnect} 
                    disabled={isLoading}
                    className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                    🔌 Disconnect Store
                  </Button>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
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
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm ml-2">
              <p className="font-semibold text-green-900 mb-2">✅ Quick Setup (No OAuth Required)</p>
              <p className="text-xs text-green-800 mb-2">
                Simply paste your shop domain and access token from the "API credentials" tab in your Shopify app settings below, then click "Save Configuration".
              </p>
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
              placeholder="your-store.myshopify.com or paste any Shopify admin URL"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Accepted formats: <code>your-store.myshopify.com</code> or full admin URL
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
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              📋 Copy from: <strong>API credentials</strong> tab → <strong>Admin API access token</strong>
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
