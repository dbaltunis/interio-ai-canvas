import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Package, Settings } from "lucide-react";
import { useBusinessSettings, useUpdateBusinessSettings, type InventoryConfig } from "@/hooks/useBusinessSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export const InventoryDeductionSettings = () => {
  const { data: businessSettings, isLoading: settingsLoading } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const { toast } = useToast();

  // Fetch all active job statuses
  const { data: jobStatuses = [], isLoading: statusesLoading } = useQuery({
    queryKey: ['job-statuses-for-deduction'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('job_statuses')
        .select('id, name, color, category')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const inventoryConfig = (businessSettings?.inventory_config as unknown as InventoryConfig) || {
    track_inventory: false,
    track_leftovers: false,
    waste_buffer_percentage: 5,
    auto_reorder_enabled: false,
    reorder_threshold_percentage: 20,
    default_location: '',
    deduction_status_ids: [],
    reversal_status_ids: [],
    ecommerce_sync_enabled: false,
  };
  
  const trackInventory = inventoryConfig.track_inventory ?? false;
  const deductionStatusIds = inventoryConfig.deduction_status_ids || [];
  const reversalStatusIds = inventoryConfig.reversal_status_ids || [];
  const ecommerceEnabled = inventoryConfig.ecommerce_sync_enabled ?? false;

  const handleToggleTracking = async (enabled: boolean) => {
    if (!businessSettings?.id) return;

    try {
      await updateSettings.mutateAsync({
        id: businessSettings.id,
        inventory_config: {
          ...inventoryConfig,
          track_inventory: enabled,
        }
      });

      toast({
        title: enabled ? "Inventory tracking enabled" : "Inventory tracking disabled",
        description: enabled 
          ? "Inventory will be automatically deducted when projects reach selected statuses"
          : "Automatic inventory deduction has been disabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory tracking settings",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (statusId: string, checked: boolean) => {
    if (!businessSettings?.id) return;

    const updatedStatusIds = checked
      ? [...deductionStatusIds, statusId]
      : deductionStatusIds.filter(id => id !== statusId);

    try {
      await updateSettings.mutateAsync({
        id: businessSettings.id,
        inventory_config: {
          ...inventoryConfig,
          deduction_status_ids: updatedStatusIds,
        }
      });

      toast({
        title: "Status updated",
        description: checked 
          ? "Status added to inventory deduction triggers"
          : "Status removed from inventory deduction triggers",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deduction statuses",
        variant: "destructive",
      });
    }
  };

  const handleToggleReversalStatus = async (statusId: string, checked: boolean) => {
    if (!businessSettings?.id) return;

    const updatedStatusIds = checked
      ? [...reversalStatusIds, statusId]
      : reversalStatusIds.filter(id => id !== statusId);

    try {
      await updateSettings.mutateAsync({
        id: businessSettings.id,
        inventory_config: {
          ...inventoryConfig,
          reversal_status_ids: updatedStatusIds,
        }
      });

      toast({
        title: "Status updated",
        description: checked 
          ? "Status added to inventory reversal triggers"
          : "Status removed from inventory reversal triggers",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reversal statuses",
        variant: "destructive",
      });
    }
  };

  const isLoading = settingsLoading || statusesLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Deduction Settings
        </CardTitle>
        <CardDescription>
          Configure which project statuses trigger automatic inventory deduction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="track-inventory" className="text-base">
              Auto-deduct inventory
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically reduce inventory quantities when projects reach selected statuses
            </p>
          </div>
          <Switch
            id="track-inventory"
            checked={trackInventory}
            onCheckedChange={handleToggleTracking}
            disabled={isLoading || !businessSettings}
          />
        </div>

        {/* E-commerce Integration Info */}
        {ecommerceEnabled && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <strong>E-commerce Integration Active:</strong> Inventory will sync bidirectionally with your online store. 
              The same deduction statuses apply to online orders.
            </div>
          </div>
        )}

        {/* Status Selection */}
        {trackInventory && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-base">Deduction Trigger Statuses</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select which statuses should trigger inventory deduction. Items will be deducted when a project changes to any of these statuses.
              </p>
            </div>

            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading statuses...</div>
            ) : jobStatuses.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No statuses available. Create custom statuses in the Status Management section below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={deductionStatusIds.includes(status.id)}
                      onCheckedChange={(checked) => handleToggleStatus(status.id, checked as boolean)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Badge
                        style={{ backgroundColor: status.color }}
                        className="text-white"
                      >
                        {status.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {status.category}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {deductionStatusIds.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Active Deduction Triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {jobStatuses
                    .filter(status => deductionStatusIds.includes(status.id))
                    .map(status => (
                      <Badge
                        key={status.id}
                        style={{ backgroundColor: status.color }}
                        className="text-white"
                      >
                        {status.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reversal Section */}
        {trackInventory && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-base text-orange-600 dark:text-orange-400">Reversal Trigger Statuses</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select which statuses should return inventory to stock. Items will be added back when a project changes to any of these statuses.
              </p>
            </div>

            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading statuses...</div>
            ) : jobStatuses.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No statuses available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 dark:border-orange-900 bg-card hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                  >
                    <Checkbox
                      id={`reversal-${status.id}`}
                      checked={reversalStatusIds.includes(status.id)}
                      onCheckedChange={(checked) => handleToggleReversalStatus(status.id, checked as boolean)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`reversal-${status.id}`}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Badge
                        style={{ backgroundColor: status.color }}
                        className="text-white"
                      >
                        {status.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {status.category}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {reversalStatusIds.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <p className="text-sm font-medium mb-2 text-orange-900 dark:text-orange-100">Active Reversal Triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {jobStatuses
                    .filter(status => reversalStatusIds.includes(status.id))
                    .map(status => (
                      <Badge
                        key={status.id}
                        style={{ backgroundColor: status.color }}
                        className="text-white"
                      >
                        {status.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
