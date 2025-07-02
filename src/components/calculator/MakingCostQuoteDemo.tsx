import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, AlertCircle } from "lucide-react";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { calculateIntegratedFabricUsage } from "@/hooks/services/makingCostIntegrationService";

export const MakingCostQuoteDemo = () => {
  const { windowCoverings, isLoading } = useWindowCoverings();
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<string>('');
  const [measurements, setMeasurements] = useState({
    railWidth: '200',
    drop: '220',
    pooling: '0'
  });
  const [fabricDetails, setFabricDetails] = useState({
    fabricWidth: '137',
    fabricCostPerYard: '45',
    rollDirection: 'vertical'
  });
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const windowCoveringsWithMakingCosts = windowCoverings.filter(wc => wc.making_cost_id);

  const handleCalculate = async () => {
    if (!selectedWindowCovering) return;

    setIsCalculating(true);
    try {
      const windowCovering = windowCoverings.find(wc => wc.id === selectedWindowCovering);
      if (!windowCovering?.making_cost_id) return;

      const params = {
        windowCoveringId: selectedWindowCovering,
        makingCostId: windowCovering.making_cost_id,
        measurements: {
          railWidth: parseFloat(measurements.railWidth),
          drop: parseFloat(measurements.drop),
          pooling: parseFloat(measurements.pooling)
        },
        selectedOptions: [], // For demo, no additional options
        fabricDetails: {
          fabricWidth: parseFloat(fabricDetails.fabricWidth),
          fabricCostPerYard: parseFloat(fabricDetails.fabricCostPerYard),
          rollDirection: fabricDetails.rollDirection as 'horizontal' | 'vertical'
        }
      };

      const result = await calculateIntegratedFabricUsage(params);
      setCalculationResult(result);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading window coverings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-green-800">Making Cost Integration Demo</CardTitle>
              <p className="text-sm text-green-600">
                Test the integrated fabric calculation with making costs
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Window Covering Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Window Covering with Making Cost</Label>
                <Select value={selectedWindowCovering} onValueChange={setSelectedWindowCovering}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select window covering" />
                  </SelectTrigger>
                  <SelectContent>
                    {windowCoveringsWithMakingCosts.map(wc => (
                      <SelectItem key={wc.id} value={wc.id}>
                        <div className="flex items-center gap-2">
                          <span>{wc.name}</span>
                          <Badge variant="outline" className="text-xs">
                            With Making Cost
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {windowCoveringsWithMakingCosts.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No window coverings with making costs found. Please link making costs to window coverings in Settings.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Measurements (cm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rail-width">Rail Width</Label>
                  <Input
                    id="rail-width"
                    type="number"
                    value={measurements.railWidth}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, railWidth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="drop">Drop</Label>
                  <Input
                    id="drop"
                    type="number"
                    value={measurements.drop}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, drop: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pooling">Pooling</Label>
                <Input
                  id="pooling"
                  type="number"
                  value={measurements.pooling}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, pooling: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fabric Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fabric-width">Fabric Width (cm)</Label>
                  <Input
                    id="fabric-width"
                    type="number"
                    value={fabricDetails.fabricWidth}
                    onChange={(e) => setFabricDetails(prev => ({ ...prev, fabricWidth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fabric-cost">Cost per Yard (£)</Label>
                  <Input
                    id="fabric-cost"
                    type="number"
                    step="0.01"
                    value={fabricDetails.fabricCostPerYard}
                    onChange={(e) => setFabricDetails(prev => ({ ...prev, fabricCostPerYard: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Roll Direction</Label>
                <Select value={fabricDetails.rollDirection} onValueChange={(value) => setFabricDetails(prev => ({ ...prev, rollDirection: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical (Standard)</SelectItem>
                    <SelectItem value="horizontal">Horizontal (Railroaded)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleCalculate} 
            disabled={!selectedWindowCovering || isCalculating}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isCalculating ? 'Calculating...' : 'Calculate with Making Cost Integration'}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {calculationResult ? (
            <>
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Integrated Calculation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Fabric Usage</Label>
                      <div className="text-lg font-semibold text-green-700">
                        {calculationResult.fabricUsage.yards.toFixed(1)} yards
                      </div>
                      <div className="text-sm text-gray-600">
                        ({calculationResult.fabricUsage.meters.toFixed(1)}m)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total Cost</Label>
                      <div className="text-lg font-semibold text-green-700">
                        £{calculationResult.costs.totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Cost Breakdown</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fabric Cost:</span>
                        <span>£{calculationResult.costs.fabricCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Making Cost (Bundled):</span>
                        <span>£{calculationResult.costs.makingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional Options:</span>
                        <span>£{calculationResult.costs.additionalOptionsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span>£{calculationResult.costs.laborCost.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>£{calculationResult.costs.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Fabric Details</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Orientation:</span>
                        <div>{calculationResult.fabricUsage.orientation}</div>
                      </div>
                      <div>
                        <span className="font-medium">Seams Required:</span>
                        <div>{calculationResult.fabricUsage.seamsRequired}</div>
                      </div>
                      <div>
                        <span className="font-medium">Widths Required:</span>
                        <div>{calculationResult.fabricUsage.widthsRequired}</div>
                      </div>
                      <div>
                        <span className="font-medium">Seam Labor:</span>
                        <div>{calculationResult.fabricUsage.seamLaborHours.toFixed(1)}h</div>
                      </div>
                    </div>
                  </div>

                  {calculationResult.warnings.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        Warnings
                      </Label>
                      <div className="space-y-1">
                        {calculationResult.warnings.map((warning: string, index: number) => (
                          <div key={index} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                            {warning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {calculationResult.breakdown.makingCostOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Making Cost Options Applied</Label>
                      <div className="space-y-1">
                        {calculationResult.breakdown.makingCostOptions.map((option: any, index: number) => (
                          <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                            <div className="font-medium">{option.name}</div>
                            <div className="text-gray-600">{option.calculation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Ready to Calculate</h3>
                <p className="text-gray-500">
                  Select a window covering with making cost and click calculate to see the integrated pricing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};