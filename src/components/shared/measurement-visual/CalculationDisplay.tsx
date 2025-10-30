import { FabricCalculation } from "./types";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface CalculationDisplayProps {
  calculation: FabricCalculation;
  compact?: boolean;
}

export const CalculationDisplay = ({ calculation, compact = false }: CalculationDisplayProps) => {
  const { units } = useMeasurementUnits();
  
  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    const symbol = currencySymbols[units.currency] || units.currency;
    return `${symbol}${amount.toFixed(2)}`;
  };
  
  const formatMeasurement = (value: number, unit: string = units.length) => {
    const unitLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm',
      'm': 'm',
      'inches': '"',
      'feet': "'",
      'yards': 'yd'
    };
    const label = unitLabels[unit] || unit;
    return `${value.toFixed(2)}${label}`;
  };

  if (compact) {
    return (
      <div className="p-2 bg-muted rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Fabric Required:</span>
            <div className="font-medium">{formatMeasurement(calculation.linearMeters)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Total Cost:</span>
            <div className="font-medium text-lg">{formatCurrency(calculation.totalCost)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
        <h4 className="font-semibold text-lg mb-1.5">Fabric Summary</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-sm text-muted-foreground">Total Fabric Required</span>
            <div className="text-2xl font-bold text-primary">
              {formatMeasurement(calculation.linearMeters)}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Total Fabric Cost</span>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(calculation.totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-2">
        <h4 className="font-semibold">Calculation Breakdown</h4>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rail Width:</span>
              <span>{formatMeasurement(calculation.railWidth, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Drop Height:</span>
              <span>{formatMeasurement(calculation.drop, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fullness Ratio:</span>
              <span>{calculation.fullnessRatio}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Widths Required:</span>
              <span>{calculation.widthsRequired}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Header Hem:</span>
              <span>{formatMeasurement(calculation.headerHem, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bottom Hem:</span>
              <span>{formatMeasurement(calculation.bottomHem, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pooling:</span>
              <span>{formatMeasurement(calculation.pooling, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waste %:</span>
              <span>{calculation.wastePercent}%</span>
            </div>
          </div>
        </div>

        {/* Manufacturing Details */}
        <div className="p-1.5 bg-muted rounded border-l-4 border-l-primary">
          <h5 className="font-medium text-sm mb-1">Manufacturing Allowances</h5>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <div>Side Hems: {formatMeasurement(calculation.sideHems, 'cm')}</div>
            <div>Seam Hems: {formatMeasurement(calculation.seamHems, 'cm')}</div>
            <div>Return Left: {formatMeasurement(calculation.returnLeft, 'cm')}</div>
            <div>Return Right: {formatMeasurement(calculation.returnRight, 'cm')}</div>
            <div>Total Drop: {formatMeasurement(calculation.totalDrop, 'cm')}</div>
            <div>Curtain Count: {calculation.curtainCount}</div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-1.5 bg-muted rounded">
          <h5 className="font-medium text-sm mb-1">Cost Breakdown</h5>
          <div className="space-y-0.5 text-sm">
            <div className="flex justify-between">
              <span>Fabric Required:</span>
              <span>{formatMeasurement(calculation.linearMeters)}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per Meter:</span>
              <span>{formatCurrency(calculation.pricePerMeter)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Total Cost:</span>
              <span>{formatCurrency(calculation.totalCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};