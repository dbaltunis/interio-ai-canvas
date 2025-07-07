import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink, CheckCircle, Zap } from "lucide-react";
import { useCreateShopifyIntegration, ShopifyIntegration } from "@/hooks/useShopifyIntegration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShopifySetupTabProps {
  integration: ShopifyIntegration | null;
  onSuccess: () => void;
}

export const ShopifySetupTab = ({ integration, onSuccess }: ShopifySetupTabProps) => {
  const createIntegration = useCreateShopifyIntegration();
  const [shopDomain, setShopDomain] = useState("");

  const handleOAuthInstall = async () => {
    if (!shopDomain) {
      toast.error("Please enter your shop domain first");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first");

      // Clean the shop domain (remove whitespace)
      const cleanShopDomain = shopDomain.trim();

      // Create integration record first
      if (!integration) {
        await createIntegration.mutateAsync({
          shop_domain: cleanShopDomain,
          auto_sync_enabled: false,
          sync_inventory: true,
          sync_prices: true,
          sync_images: true,
          sync_status: "pending",
          sync_log: [{ action: "OAuth installation started", timestamp: new Date().toISOString() }] as any,
        });
      }

      // Generate OAuth URL using your actual credentials
      const clientId = "0dfe36a9f7e074caf6c4b971371edf7e"; // Your actual client ID
      const scopes = "read_products,read_inventory,write_inventory";
      const redirectUri = `https://a26f4d10-3397-4eb3-b434-f6455cad76b9.supabase.co/functions/v1/shopify-oauth`;
      const state = user.id; // Use user ID as state for security

      const oauthUrl = `https://${cleanShopDomain}/admin/oauth/authorize?` +
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

  return (
    <div className="space-y-4">
      <Alert className="border-orange-200 bg-orange-50">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <strong>🚧 Development Mode</strong> This integration is currently in development for multi-tenant use. The final version will support seamless installation for all your clients' Shopify stores.
        </AlertDescription>
      </Alert>
      
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

        <div className="space-y-4">
          <div>
            <Label htmlFor="shop_domain">Your Shopify Store Domain</Label>
            <Input
              id="shop_domain"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store-name.myshopify.com"
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
                  disabled={!shopDomain || createIntegration.isPending}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Install App in Shopify Store
                </Button>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
};