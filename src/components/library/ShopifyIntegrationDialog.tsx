
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingBag, Info } from "lucide-react";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { ShopifyGettingStartedGuide } from "./shopify/ShopifyGettingStartedGuide";
import { ShopifyOverviewTabEnhanced } from "./shopify/ShopifyOverviewTabEnhanced";
import { ShopifySetupTab } from "./shopify/ShopifySetupTab";
import { ShopifySyncTab } from "./shopify/ShopifySyncTab";
import { ShopifyStatusTab } from "./shopify/ShopifyStatusTab";
import { ShopifyWebhookSetupTab } from "./shopify/ShopifyWebhookSetupTab";
import { ShopifySuccessScreen } from "./shopify/ShopifySuccessScreen";
import { useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";

interface ShopifyIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopifyIntegrationDialog = ({ open, onOpenChange }: ShopifyIntegrationDialogProps) => {
  const { integration, isLoading, syncProducts } = useShopifyIntegrationReal();
  const syncAnalytics = useSyncShopifyAnalytics();
  const [activeTab, setActiveTab] = useState("guide");
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [formData, setFormData] = useState(() => ({
    shop_domain: integration?.shop_domain || "",
    auto_sync_enabled: integration?.auto_sync_enabled || false,
    sync_inventory: integration?.sync_inventory !== undefined ? integration.sync_inventory : true,
    sync_prices: integration?.sync_prices !== undefined ? integration.sync_prices : true,
    sync_images: integration?.sync_images !== undefined ? integration.sync_images : true,
  }));

  // Show getting started guide if not connected yet
  const showGettingStarted = !integration?.shop_domain || !integration?.access_token;

  const handleGetStarted = () => {
    setActiveTab("setup");
  };

  const handleSetupSuccess = () => {
    // Show success screen after OAuth connection
    setShowSuccessScreen(true);
    setActiveTab("overview");
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <ShopifyGettingStartedGuide 
              integration={integration}
              onNavigateToTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="overview">
            {showSuccessScreen && integration?.shop_domain ? (
              <ShopifySuccessScreen
                shopDomain={integration.shop_domain}
                onStartSync={() => {
                  setShowSuccessScreen(false);
                  syncProducts?.();
                }}
                onViewAnalytics={() => {
                  setShowSuccessScreen(false);
                  syncAnalytics.mutate();
                }}
                onConfigureSettings={() => {
                  setShowSuccessScreen(false);
                  setActiveTab("sync");
                }}
              />
            ) : (
              <ShopifyOverviewTabEnhanced 
                integration={integration} 
                onSyncProducts={syncProducts}
                onSyncAnalytics={() => syncAnalytics.mutate()}
              />
            )}
          </TabsContent>

          <TabsContent value="setup">
            <ShopifySetupTab 
              integration={integration} 
              onSuccess={handleSetupSuccess}
            />
          </TabsContent>

          <TabsContent value="webhooks">
            <ShopifyWebhookSetupTab integration={integration} />
          </TabsContent>

          <TabsContent value="sync">
            <ShopifySyncTab 
              integration={integration}
            />
          </TabsContent>

          <TabsContent value="status">
            <ShopifyStatusTab integration={integration} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
