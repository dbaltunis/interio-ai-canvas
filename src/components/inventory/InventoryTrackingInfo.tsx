import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Settings } from "lucide-react";
import { useBusinessSettings, type InventoryConfig } from "@/hooks/useBusinessSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface InventoryTrackingInfoProps {
  className?: string;
}

export const InventoryTrackingInfo = ({ className }: InventoryTrackingInfoProps) => {
  const { data: businessSettings } = useBusinessSettings();
  
  const inventoryConfig = (businessSettings?.inventory_config as unknown as InventoryConfig) || {
    track_inventory: false,
    track_leftovers: false,
    waste_buffer_percentage: 5,
    auto_reorder_enabled: false,
    reorder_threshold_percentage: 20,
    default_location: '',
    deduction_status_ids: [],
    ecommerce_sync_enabled: false,
  };
  
  const trackInventory = inventoryConfig.track_inventory ?? false;
  const deductionStatusIds = inventoryConfig.deduction_status_ids || [];
  const ecommerceEnabled = inventoryConfig.ecommerce_sync_enabled ?? false;

  // Fetch the actual status details using the IDs
  const { data: configuredStatuses = [] } = useQuery({
    queryKey: ['deduction-statuses', deductionStatusIds],
    queryFn: async () => {
      if (deductionStatusIds.length === 0) return [];

      const { data, error } = await supabase
        .from('job_statuses')
        .select('id, name, color')
        .in('id', deductionStatusIds);

      if (error) throw error;
      return data || [];
    },
    enabled: trackInventory && deductionStatusIds.length > 0,
  });

  if (!trackInventory) {
    return null;
  }

  return (
    <div className={className}>
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-900 dark:text-green-100">
          Inventory Tracking Active
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200 space-y-2">
          {configuredStatuses.length > 0 ? (
            <>
              <p>Inventory will be automatically deducted when projects reach these statuses:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {configuredStatuses.map(status => (
                  <Badge
                    key={status.id}
                    style={{ backgroundColor: status.color }}
                    className="text-white"
                  >
                    {status.name}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <p>No deduction statuses configured.</p>
              <Link 
                to="/settings?tab=system" 
                className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 hover:underline font-medium"
              >
                <Settings className="h-3 w-3" />
                Configure now
              </Link>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {ecommerceEnabled && (
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mt-4">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            E-commerce Integration Active
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Inventory quantities will sync automatically with your online store. Online orders will also trigger 
            inventory deduction based on the same status rules.
          </AlertDescription>
        </Alert>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Configure deduction triggers in{" "}
        <Link to="/settings?tab=system" className="text-primary hover:underline">
          Settings → System → Inventory Deduction Settings
        </Link>
      </p>
    </div>
  );
};
