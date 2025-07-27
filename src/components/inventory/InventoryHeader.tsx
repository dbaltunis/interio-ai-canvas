import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, TrendingUp, Palette } from "lucide-react";

interface InventoryHeaderProps {
  onAddItem: () => void;
  itemCount: number;
  lowStockCount: number;
}

export const InventoryHeader = ({ onAddItem, itemCount, lowStockCount }: InventoryHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <Palette className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fabric & Hardware Inventory</h1>
            <p className="text-muted-foreground">
              Manage curtains, blinds, and window treatment materials
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              {itemCount} Total Items
            </Badge>
          </div>
          
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockCount} Low Stock
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Button onClick={onAddItem} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
        <Plus className="h-4 w-4 mr-2" />
        Add New Item
      </Button>
    </div>
  );
};