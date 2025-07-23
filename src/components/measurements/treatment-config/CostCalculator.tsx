
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface CostCalculatorProps {
  measurements: any;
  treatment: any;
  rodTrack: any;
  motorization: any;
  fabric: any;
}

export const CostCalculator = ({
  measurements,
  treatment,
  rodTrack,
  motorization,
  fabric
}: CostCalculatorProps) => {
  const { formatCurrency } = useMeasurementUnits();

  const calculateCosts = () => {
    let fabricCost = 0;
    let hardwareCost = 0;
    let motorizationCost = 0;
    let laborCost = 0;
    
    // Fabric cost
    if (fabric && fabric.usage) {
      fabricCost = fabric.usage.cost;
    }
    
    // Hardware cost
    if (rodTrack) {
      hardwareCost = rodTrack.price || 0;
    }
    
    // Motorization cost
    if (motorization && motorization.id !== "none") {
      motorizationCost = motorization.price || 0;
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
                {fabric && (
                  <Badge variant="outline" className="text-xs">
                    {fabric.usage?.yards} yards
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
        {fabric && fabric.usage && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Fabric Calculation</h4>
            <div className="text-xs space-y-1">
              <div>Fabric required: {fabric.usage.yards} yards</div>
              <div>Widths needed: {fabric.usage.widthsNeeded}</div>
              <div>Cost per yard: {formatCurrency(fabric.pricePerYard)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
