import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingBag, Info } from "lucide-react";
import { useShopifyIntegration } from "@/hooks/useShopifyIntegration";
import { ShopifyOverviewTab } from "./shopify/ShopifyOverviewTab";
import { ShopifySetupTab } from "./shopify/ShopifySetupTab";
import { ShopifySyncTab } from "./shopify/ShopifySyncTab";
import { ShopifyStatusTab } from "./shopify/ShopifyStatusTab";

interface ShopifyIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopifyIntegrationDialog = ({ open, onOpenChange }: ShopifyIntegrationDialogProps) => {
  const { data: integration, isLoading } = useShopifyIntegration();
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState(() => ({
    shop_domain: integration?.shop_domain || "",
    auto_sync_enabled: integration?.auto_sync_enabled || false,
    sync_inventory: integration?.sync_inventory !== undefined ? integration.sync_inventory : true,
    sync_prices: integration?.sync_prices !== undefined ? integration.sync_prices : true,
    sync_images: integration?.sync_images !== undefined ? integration.sync_images : true,
  }));

  const handleGetStarted = () => {
    setActiveTab("setup");
  };

  const handleSetupSuccess = () => {
    setActiveTab("status");
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

          <TabsContent value="overview">
            <ShopifyOverviewTab 
              integration={integration} 
              onGetStarted={handleGetStarted}
            />
          </TabsContent>

          <TabsContent value="setup">
            <ShopifySetupTab 
              integration={integration} 
              onSuccess={handleSetupSuccess}
            />
          </TabsContent>

          <TabsContent value="sync">
            <ShopifySyncTab 
              integration={integration}
              formData={formData}
              setFormData={setFormData}
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