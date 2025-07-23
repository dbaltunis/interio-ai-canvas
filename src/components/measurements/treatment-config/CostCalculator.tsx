
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CostCalculatorProps {
  measurements: any;
  treatmentConfig: any;
  currency: string;
}

export const CostCalculator = ({
  measurements,
  treatmentConfig,
  currency
}: CostCalculatorProps) => {
  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[currency] || currency}${amount.toFixed(2)}`;
  };

  const calculateCosts = () => {
    let fabricCost = 0;
    let hardwareCost = 0;
    let motorizationCost = 0;
    let laborCost = 0;
    
    // Fabric cost
    if (treatmentConfig.fabric && treatmentConfig.fabric.usage) {
      fabricCost = treatmentConfig.fabric.usage.cost;
    }
    
    // Hardware cost
    if (treatmentConfig.rodTrack) {
      hardwareCost = treatmentConfig.rodTrack.price || 0;
    }
    
    // Motorization cost
    if (treatmentConfig.motorization && treatmentConfig.motorization.id !== "none") {
      motorizationCost = treatmentConfig.motorization.price || 0;
    }
    
    // Labor cost (base calculation)
    const width = parseFloat(measurements.width) || 100;
    const height = parseFloat(measurements.height) || 150;
    const area = (width * height) / 10000; // Convert to square meters
    laborCost = area * 25; // £25 per square meter base rate
    
    const subtotal = fabricCost + hardwareCost + motorizationCost + laborCost;
    const margin = subtotal * 0.4; // 40% margin
    const total = subtotal + margin;
    
    return {
      fabric: fabricCost,
      hardware: hardwareCost,
      motorization: motorizationCost,
      labor: laborCost,
      subtotal,
      margin,
      total
    };
  };

  const costs = calculateCosts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Line Items */}
          {costs.fabric > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Fabric</span>
                {treatmentConfig.fabric && (
                  <Badge variant="outline" className="text-xs">
                    {treatmentConfig.fabric.usage?.yards} yards
                  </Badge>
                )}
              </div>
              <span className="font-medium">{formatCurrency(costs.fabric)}</span>
            </div>
          )}
          
          {costs.hardware > 0 && (
            <div className="flex justify-between items-center">
              <span>Hardware</span>
              <span className="font-medium">{formatCurrency(costs.hardware)}</span>
            </div>
          )}
          
          {costs.motorization > 0 && (
            <div className="flex justify-between items-center">
              <span>Motorization</span>
              <span className="font-medium">{formatCurrency(costs.motorization)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span>Labor & Installation</span>
            <span className="font-medium">{formatCurrency(costs.labor)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(costs.subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Margin (40%)</span>
            <span>{formatCurrency(costs.margin)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(costs.total)}</span>
          </div>
        </div>
        
        {/* Fabric Usage Details */}
        {treatmentConfig.fabric && treatmentConfig.fabric.usage && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Fabric Calculation</h4>
            <div className="text-xs space-y-1">
              <div>Fabric required: {treatmentConfig.fabric.usage.yards} yards</div>
              <div>Widths needed: {treatmentConfig.fabric.usage.widthsNeeded}</div>
              <div>Cost per yard: {formatCurrency(treatmentConfig.fabric.pricePerYard)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
