import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShoppingBag } from "lucide-react";
import { ShopifyIntegration, useUpdateShopifyIntegration } from "@/hooks/useShopifyIntegration";

interface ShopifySyncTabProps {
  integration: ShopifyIntegration | null;
  formData: {
    shop_domain: string;
    auto_sync_enabled: boolean;
    sync_inventory: boolean;
    sync_prices: boolean;
    sync_images: boolean;
  };
  setFormData: (data: any) => void;
}

export const ShopifySyncTab = ({ integration, formData, setFormData }: ShopifySyncTabProps) => {
  const updateIntegration = useUpdateShopifyIntegration();

  const handleSaveSettings = async () => {
    if (!integration) return;
    
    await updateIntegration.mutateAsync({ 
      id: integration.id, 
      ...formData 
    });
  };

  if (!integration) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Shopify Integration</h3>
          <p className="text-gray-500">Connect your Shopify store first to configure sync settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
          <Button 
            onClick={handleSaveSettings} 
            disabled={updateIntegration.isPending} 
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};