import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, ShoppingCart, TrendingDown } from "lucide-react";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface InventoryTrackingInfoProps {
  className?: string;
}

export const InventoryTrackingInfo = ({ className }: InventoryTrackingInfoProps) => {
  const { data: settings } = useBusinessSettings();
  
  const inventoryConfig = (settings?.inventory_config && typeof settings.inventory_config === 'object') 
    ? settings.inventory_config as Record<string, any>
    : {};
    
  const trackInventory = inventoryConfig.track_inventory !== false; // Default true
  const deductionStatuses = (inventoryConfig.deduction_statuses as string[]) || ['order', 'ordered', 'confirmed', 'in production'];
  const ecommerceEnabled = inventoryConfig.ecommerce_sync_enabled === true;

  if (!trackInventory) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm space-y-2">
          <div className="font-medium">Inventory Tracking Active</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>✓ Quantities are automatically tracked when products are used in projects</p>
            <p>✓ Inventory is deducted when project status changes to:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {deductionStatuses.map((status: string) => (
                <Badge key={status} variant="outline" className="text-xs capitalize">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {ecommerceEnabled && (
        <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <ShoppingCart className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100">E-commerce Integration Active</div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Inventory quantities sync with your online store (Shopify). 
              Stock levels update automatically when orders are placed online or offline.
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md">
        <strong>Note:</strong> Configure deduction statuses in Settings → Business Settings → Inventory Configuration
      </div>
    </div>
  );
};
