
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
  const [isSyncing, setIsSyncing] = React.useState(false);

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
        title: "Sync Setting Updated",
        description: `${field.replace('sync_', '').replace('_', ' ')} sync ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get inventory items (exclude treatment options)
      const { data: inventory, error: invError } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .neq('category', 'treatment_option');

      if (invError) throw invError;

      // Call edge function with sync settings
      const { data, error: functionError } = await supabase.functions.invoke(
        'shopify-push-products',
        {
          method: 'POST',
          body: { 
            products: inventory,
            syncSettings: {
              sync_inventory: integration?.sync_inventory ?? true,
              sync_prices: integration?.sync_prices ?? true,
              sync_images: integration?.sync_images ?? true,
            }
          },
        }
      );

      if (functionError) throw functionError;

      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${data.synced || 0} products to Shopify`,
      });
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync products to Shopify',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
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
            <div>
              <Label htmlFor="sync-inventory" className="font-medium">Sync Inventory</Label>
              <p className="text-xs text-muted-foreground">Keep stock levels in sync</p>
            </div>
            <Switch
              id="sync-inventory"
              checked={integration?.sync_inventory || false}
              onCheckedChange={(checked) => handleSyncSettingChange("sync_inventory", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-prices" className="font-medium">Sync Prices</Label>
              <p className="text-xs text-muted-foreground">Update product pricing</p>
            </div>
            <Switch
              id="sync-prices"
              checked={integration?.sync_prices || false}
              onCheckedChange={(checked) => handleSyncSettingChange("sync_prices", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-images" className="font-medium">Sync Images</Label>
              <p className="text-xs text-muted-foreground">Upload product images</p>
            </div>
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
          <Button 
            className="w-full" 
            disabled={!integration?.is_connected || isSyncing}
            onClick={handleFullSync}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Run Full Sync'}
          </Button>
          {!integration?.is_connected && (
            <p className="text-sm text-muted-foreground mt-2">
              Connect your Shopify store first to enable sync functionality
            </p>
          )}
          {integration?.is_connected && (
            <p className="text-xs text-muted-foreground mt-2">
              This will push all products to Shopify respecting the settings above
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
