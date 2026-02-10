import { FabricCalculation } from "./types";

interface CalculationDisplayProps {
  calculation: FabricCalculation;
  compact?: boolean;
}

export const CalculationDisplay = ({
  calculation,
  compact = false,
}: CalculationDisplayProps) => {
  if (compact) {
    return (
      <div className="text-sm space-y-1">
        <p>Linear Meters: <span className="font-medium">{calculation.linearMeters?.toFixed(2) || '--'}</span></p>
        <p>Total Cost: <span className="font-medium">${calculation.totalCost?.toFixed(2) || '--'}</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Widths Required</p>
          <p className="font-medium">{calculation.widthsRequired || '--'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Linear Meters</p>
          <p className="font-medium">{calculation.linearMeters?.toFixed(2) || '--'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fabric Cost</p>
          <p className="font-medium">${calculation.fabricCost?.toFixed(2) || '--'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Cost</p>
          <p className="font-medium">${calculation.totalCost?.toFixed(2) || '--'}</p>
        </div>
      </div>
    </div>
  );
};
