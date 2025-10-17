import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useBusinessSettings, useUpdateBusinessSettings, type FeatureFlags, type InventoryConfig } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Layers, Archive, Calendar, MapPin } from "lucide-react";

export const FeatureFlagsSettings = () => {
  const { data: settings, isLoading } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const { toast } = useToast();

  const features: FeatureFlags = (settings?.features_enabled as unknown as FeatureFlags) || {
    inventory_management: false,
    auto_extract_materials: false,
    leftover_tracking: false,
    order_batching: false,
    multi_location_inventory: false,
  };

  const inventoryConfig: InventoryConfig = (settings?.inventory_config as unknown as InventoryConfig) || {
    track_leftovers: true,
    waste_buffer_percentage: 5,
    auto_reorder_enabled: false,
    reorder_threshold_percentage: 20,
    default_location: "main_warehouse",
  };

  const handleFeatureToggle = async (featureKey: keyof FeatureFlags, enabled: boolean) => {
    if (!settings) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        features_enabled: {
          ...features,
          [featureKey]: enabled,
        },
      });

      toast({
        title: "Feature updated",
        description: `${featureKey.replace(/_/g, ' ')} has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature setting",
        variant: "destructive",
      });
    }
  };

  const handleInventoryConfigChange = async (configKey: keyof InventoryConfig, value: any) => {
    if (!settings) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        inventory_config: {
          ...inventoryConfig,
          [configKey]: value,
        },
      });

      toast({
        title: "Configuration updated",
        description: `${configKey.replace(/_/g, ' ')} has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Please set up your business settings first
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Material Management Features</CardTitle>
          <CardDescription>
            Enable or disable features based on your business needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="inventory_management">Inventory Management</Label>
                <p className="text-sm text-muted-foreground">
                  Track stock levels and manage inventory
                </p>
              </div>
            </div>
            <Switch
              id="inventory_management"
              checked={features.inventory_management}
              onCheckedChange={(checked) => handleFeatureToggle('inventory_management', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-3">
              <Layers className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="auto_extract_materials">Auto-Extract Materials</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically calculate materials from project treatments
                </p>
              </div>
            </div>
            <Switch
              id="auto_extract_materials"
              checked={features.auto_extract_materials}
              onCheckedChange={(checked) => handleFeatureToggle('auto_extract_materials', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-3">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="leftover_tracking">Leftover Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track and manage leftover materials from projects
                </p>
              </div>
            </div>
            <Switch
              id="leftover_tracking"
              checked={features.leftover_tracking}
              onCheckedChange={(checked) => handleFeatureToggle('leftover_tracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="order_batching">Order Batching</Label>
                <p className="text-sm text-muted-foreground">
                  Batch multiple orders by supplier and date
                </p>
              </div>
            </div>
            <Switch
              id="order_batching"
              checked={features.order_batching}
              onCheckedChange={(checked) => handleFeatureToggle('order_batching', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="multi_location_inventory">Multi-Location Inventory</Label>
                <p className="text-sm text-muted-foreground">
                  Manage inventory across multiple locations
                </p>
              </div>
            </div>
            <Switch
              id="multi_location_inventory"
              checked={features.multi_location_inventory}
              onCheckedChange={(checked) => handleFeatureToggle('multi_location_inventory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {features.inventory_management && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Configuration</CardTitle>
            <CardDescription>
              Configure how inventory is managed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="track_leftovers">Track Leftovers</Label>
                <p className="text-sm text-muted-foreground">
                  Record leftover materials after projects
                </p>
              </div>
              <Switch
                id="track_leftovers"
                checked={inventoryConfig.track_leftovers}
                onCheckedChange={(checked) => handleInventoryConfigChange('track_leftovers', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waste_buffer">Waste Buffer Percentage</Label>
              <Input
                id="waste_buffer"
                type="number"
                min="0"
                max="100"
                value={inventoryConfig.waste_buffer_percentage}
                onChange={(e) => handleInventoryConfigChange('waste_buffer_percentage', Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Extra material to order to account for waste (%)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_reorder">Auto-Reorder</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create reorder alerts when stock is low
                </p>
              </div>
              <Switch
                id="auto_reorder"
                checked={inventoryConfig.auto_reorder_enabled}
                onCheckedChange={(checked) => handleInventoryConfigChange('auto_reorder_enabled', checked)}
              />
            </div>

            {inventoryConfig.auto_reorder_enabled && (
              <div className="space-y-2">
                <Label htmlFor="reorder_threshold">Reorder Threshold Percentage</Label>
                <Input
                  id="reorder_threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={inventoryConfig.reorder_threshold_percentage}
                  onChange={(e) => handleInventoryConfigChange('reorder_threshold_percentage', Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Alert when stock falls below this percentage of reorder point
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="default_location">Default Location</Label>
              <Input
                id="default_location"
                type="text"
                value={inventoryConfig.default_location}
                onChange={(e) => handleInventoryConfigChange('default_location', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Default warehouse or storage location
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
