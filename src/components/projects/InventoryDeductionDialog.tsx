import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useInventoryDeduction } from "@/hooks/useInventoryDeduction";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MaterialUsage {
  itemId: string;
  itemTable: 'fabrics' | 'hardware_inventory' | 'heading_inventory' | 'enhanced_inventory_items';
  itemName: string;
  quantityUsed: number;
  unit: string;
  currentQuantity: number;
  costImpact: number;
  surfaceId: string;
  surfaceName?: string;
  lowStock: boolean;
  isTracked: boolean;
}

interface InventoryDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: MaterialUsage[];
  projectId: string;
  projectName: string;
}

export const InventoryDeductionDialog = ({
  open,
  onOpenChange,
  materials,
  projectId,
  projectName,
}: InventoryDeductionDialogProps) => {
  // Filter out non-tracked items
  const trackedMaterials = materials.filter(m => m.isTracked);
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(trackedMaterials.filter(m => !m.lowStock).map(m => m.itemId))
  );
  const deductInventory = useInventoryDeduction();

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleDeduct = async () => {
    const selectedMaterials = trackedMaterials.filter(m => selectedItems.has(m.itemId));
    
    await deductInventory.mutateAsync({
      projectId,
      projectName,
      materials: selectedMaterials,
    });
    
    onOpenChange(false);
  };

  const totalCost = trackedMaterials
    .filter(m => selectedItems.has(m.itemId))
    .reduce((sum, m) => sum + m.costImpact, 0);

  const lowStockItems = trackedMaterials.filter(m => m.lowStock);
  const availableItems = trackedMaterials.filter(m => !m.lowStock);

  if (trackedMaterials.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <DialogTitle>Deduct Inventory</DialogTitle>
          </div>
          <DialogDescription>
            Project "{projectName}" is complete. Deduct used materials from inventory?
          </DialogDescription>
        </DialogHeader>

        {lowStockItems.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Low Stock Alert!</strong> {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} don't have enough inventory. 
              Please review and adjust quantities manually.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Total value to deduct: <strong>${totalCost.toFixed(2)}</strong>. 
            This will update inventory quantities and create an audit trail.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {availableItems.map((material) => (
            <div
              key={material.itemId}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedItems.has(material.itemId)}
                  onCheckedChange={() => toggleItem(material.itemId)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{material.itemName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {material.itemTable.replace('_', ' ')}
                        </Badge>
                        {material.surfaceName && (
                          <span className="text-xs text-muted-foreground">
                            {material.surfaceName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        ${material.costImpact.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        -{material.quantityUsed.toFixed(2)}{material.unit}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Current Stock:</span> {material.currentQuantity.toFixed(2)}{material.unit}
                    </div>
                    <div>
                      <span className="font-medium">After Deduction:</span> {(material.currentQuantity - material.quantityUsed).toFixed(2)}{material.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {lowStockItems.map((material) => (
            <div
              key={material.itemId}
              className="border border-destructive/50 rounded-lg p-4 bg-destructive/5"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-destructive">{material.itemName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Insufficient stock: Need {material.quantityUsed.toFixed(2)}{material.unit}, 
                        have {material.currentQuantity.toFixed(2)}{material.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deductInventory.isPending}
          >
            Skip
          </Button>
          <Button
            onClick={handleDeduct}
            disabled={selectedItems.size === 0 || deductInventory.isPending}
          >
            {deductInventory.isPending ? (
              <>Deducting...</>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Deduct {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
