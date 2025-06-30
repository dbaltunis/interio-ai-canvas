
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info } from "lucide-react";

interface PriceCalculationResult {
  requiredFabricWidth: number;
  panelsNeeded: number;
  basePrice: number;
  marginAmount: number;
  finalPrice: number;
}

interface WindowCovering {
  id: string;
  name: string;
  fabrication_pricing_method: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid';
  unit_price: number;
  margin_percentage: number;
  pricing_grid_data?: string;
}

interface CalculatorProps {
  windowCovering: WindowCovering;
}

export const WindowCoveringPriceCalculator = ({ windowCovering }: CalculatorProps) => {
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const [fullnessRatio, setFullnessRatio] = useState<number>(2.0);
  const [fabricWidth, setFabricWidth] = useState<number>(140);
  const [panelSplit, setPanelSplit] = useState<number>(2);
  const [drop, setDrop] = useState<number>(0);
  const [linearMeasurement, setLinearMeasurement] = useState<number>(0);
  const [calculation, setCalculation] = useState<PriceCalculationResult | null>(null);

  const calculatePrice = () => {
    let basePrice = 0;
    let calculationDetails: Partial<PriceCalculationResult> = {};

    switch (windowCovering.fabrication_pricing_method) {
      case 'per-panel':
        // Calculate required fabric width
        const requiredFabricWidth = trackWidth * fullnessRatio;
        
        // Calculate panels needed
        const panelsNeeded = Math.ceil(requiredFabricWidth / (fabricWidth * panelSplit));
        
        basePrice = windowCovering.unit_price * panelsNeeded;
        calculationDetails = {
          requiredFabricWidth,
          panelsNeeded
        };
        break;

      case 'per-drop':
        basePrice = windowCovering.unit_price * (drop / 100); // Convert cm to meters
        break;

      case 'per-meter':
        basePrice = windowCovering.unit_price * (linearMeasurement / 100); // Convert cm to meters
        break;

      case 'per-yard':
        basePrice = windowCovering.unit_price * (linearMeasurement / 91.44); // Convert cm to yards
        break;

      case 'pricing-grid':
        if (windowCovering.pricing_grid_data && trackWidth && drop) {
          basePrice = getPriceFromGrid(trackWidth, drop);
        }
        break;

      default:
        basePrice = 0;
    }

    const marginAmount = (basePrice * windowCovering.margin_percentage) / 100;
    const finalPrice = basePrice + marginAmount;

    setCalculation({
      ...calculationDetails,
      basePrice,
      marginAmount,
      finalPrice,
      requiredFabricWidth: calculationDetails.requiredFabricWidth || 0,
      panelsNeeded: calculationDetails.panelsNeeded || 0
    });
  };

  const getPriceFromGrid = (width: number, dropValue: number): number => {
    if (!windowCovering.pricing_grid_data) return 0;

    try {
      const lines = windowCovering.pricing_grid_data.split('\n');
      const headers = lines[0].split(',').slice(1).map(h => parseInt(h.trim()));
      
      // Find closest width
      const closestWidth = headers.reduce((prev, curr) => 
        Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
      );
      const widthIndex = headers.indexOf(closestWidth) + 1;

      // Find closest drop
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        const rowDrop = parseInt(row[0].trim());
        
        if (Math.abs(rowDrop - dropValue) <= 50) { // Within 50cm tolerance
          return parseFloat(row[widthIndex]) || 0;
        }
      }
    } catch (error) {
      console.error('Error parsing pricing grid:', error);
    }
    
    return 0;
  };

  const renderInputFields = () => {
    switch (windowCovering.fabrication_pricing_method) {
      case 'per-panel':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trackWidth">Track Width (cm)</Label>
                <Input
                  id="trackWidth"
                  type="number"
                  value={trackWidth || ''}
                  onChange={(e) => setTrackWidth(Number(e.target.value))}
                  placeholder="300"
                />
              </div>
              <div>
                <Label htmlFor="fullnessRatio">Fullness Ratio</Label>
                <Select value={fullnessRatio.toString()} onValueChange={(value) => setFullnessRatio(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2.0">2.0x</SelectItem>
                    <SelectItem value="2.5">2.5x</SelectItem>
                    <SelectItem value="3.0">3.0x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabricWidth">Fabric Width (cm)</Label>
                <Input
                  id="fabricWidth"
                  type="number"
                  value={fabricWidth || ''}
                  onChange={(e) => setFabricWidth(Number(e.target.value))}
                  placeholder="140"
                />
              </div>
              <div>
                <Label htmlFor="panelSplit">Panel Split</Label>
                <Select value={panelSplit.toString()} onValueChange={(value) => setPanelSplit(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Panel</SelectItem>
                    <SelectItem value="2">2 Panels</SelectItem>
                    <SelectItem value="3">3 Panels</SelectItem>
                    <SelectItem value="4">4 Panels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'per-drop':
        return (
          <div>
            <Label htmlFor="drop">Drop/Height (cm)</Label>
            <Input
              id="drop"
              type="number"
              value={drop || ''}
              onChange={(e) => setDrop(Number(e.target.value))}
              placeholder="250"
            />
          </div>
        );

      case 'per-meter':
      case 'per-yard':
        return (
          <div>
            <Label htmlFor="linearMeasurement">
              Linear Measurement (cm) - {windowCovering.fabrication_pricing_method === 'per-yard' ? 'will be converted to yards' : 'will be converted to meters'}
            </Label>
            <Input
              id="linearMeasurement"
              type="number"
              value={linearMeasurement || ''}
              onChange={(e) => setLinearMeasurement(Number(e.target.value))}
              placeholder="300"
            />
          </div>
        );

      case 'pricing-grid':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gridWidth">Width (cm)</Label>
              <Input
                id="gridWidth"
                type="number"
                value={trackWidth || ''}
                onChange={(e) => setTrackWidth(Number(e.target.value))}
                placeholder="300"
              />
            </div>
            <div>
              <Label htmlFor="gridDrop">Drop (cm)</Label>
              <Input
                id="gridDrop"
                type="number"
                value={drop || ''}
                onChange={(e) => setDrop(Number(e.target.value))}
                placeholder="250"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Price Calculator - {windowCovering.name}
        </CardTitle>
        <CardDescription>
          Calculate pricing based on {windowCovering.fabrication_pricing_method.replace('-', ' ')} method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderInputFields()}

        <Button onClick={calculatePrice} className="w-full">
          Calculate Price
        </Button>

        {calculation && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">Calculation Results</h4>
            
            {windowCovering.fabrication_pricing_method === 'per-panel' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Required Fabric Width</Label>
                  <p className="font-medium">{calculation.requiredFabricWidth}cm</p>
                </div>
                <div>
                  <Label className="text-gray-600">Panels Needed</Label>
                  <p className="font-medium">{calculation.panelsNeeded} panels</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Base Price</Label>
                <p className="font-medium">£{calculation.basePrice.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Margin ({windowCovering.margin_percentage}%)</Label>
                <p className="font-medium text-green-600">£{calculation.marginAmount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Final Price</Label>
                <p className="text-lg font-bold text-primary">£{calculation.finalPrice.toFixed(2)}</p>
              </div>
            </div>

            {windowCovering.fabrication_pricing_method === 'per-panel' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Panel Calculation:</p>
                  <p className="text-blue-700">
                    Required Fabric Width = Track Width ({trackWidth}cm) × Fullness Ratio ({fullnessRatio}x) = {calculation.requiredFabricWidth}cm
                    <br />
                    Panels Needed = {calculation.requiredFabricWidth}cm ÷ ({fabricWidth}cm × {panelSplit} panels) = {calculation.panelsNeeded} panels
                    <br />
                    Base Price = £{windowCovering.unit_price} × {calculation.panelsNeeded} panels = £{calculation.basePrice.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
