
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUpdateShopifyIntegration, ShopifyIntegration } from "@/hooks/useShopifyIntegration";
import { RefreshCw } from "lucide-react";

interface ShopifySyncTabProps {
  integration?: ShopifyIntegration | null;
  formData?: any;
  setFormData?: (data: any) => void;
}

export const ShopifySyncTab = ({ integration }: ShopifySyncTabProps) => {
  const updateIntegration = useUpdateShopifyIntegration();

  const handleSyncSettingChange = (setting: string, value: boolean) => {
    updateIntegration.mutate({ [setting]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-products">Sync Products</Label>
            <Switch
              id="sync-products"
              checked={integration?.sync_products || false}
              onCheckedChange={(checked) => handleSyncSettingChange("sync_products", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" disabled={!integration?.active}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Full Sync
          </Button>
          {!integration?.active && (
            <p className="text-sm text-gray-500 mt-2">
              Connect your Shopify store first to enable sync functionality
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
