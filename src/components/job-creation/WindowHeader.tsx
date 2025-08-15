import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Home, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";

interface WindowHeaderProps {
  windowName: string;
  totalCost: number;
  treatmentCount: number;
  onAddTreatment: () => void;
  onRename: () => void;
  compact?: boolean;
}

export const WindowHeader = ({
  windowName,
  totalCost,
  treatmentCount,
  onAddTreatment,
  onRename,
  compact = false
}: WindowHeaderProps) => {
  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? 'py-2' : 'py-3'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-primary/10">
          <Home className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 
              className="text-lg font-bold truncate cursor-pointer hover:text-primary transition-colors"
              onClick={onRename}
              title="Click to rename window"
            >
              {windowName}
            </h3>
            <Badge variant="outline" className="text-xs">
              {treatmentCount} {treatmentCount === 1 ? 'Treatment' : 'Treatments'}
            </Badge>
          </div>
          {totalCost > 0 && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold text-xl text-primary">
                {formatCurrency(totalCost)}
              </span>
              <span className="text-sm text-muted-foreground">total</span>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddTreatment}
        className="text-primary hover:text-primary hover:border-primary/30 flex-shrink-0"
        title="Add another treatment to this window"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Treatment
      </Button>
    </div>
  );
};