
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

type ShopifyIntegration = Database['public']['Tables']['shopify_integrations']['Row'];

interface ShopifySyncTabProps {
  integration?: ShopifyIntegration | null;
}

export const ShopifySyncTab = ({ integration }: ShopifySyncTabProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSyncSettingChange = async (field: string, value: boolean) => {
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" disabled={!integration?.is_connected}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Full Sync
          </Button>
          {!integration?.is_connected && (
            <p className="text-sm text-gray-500 mt-2">
              Connect your Shopify store first to enable sync functionality
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
