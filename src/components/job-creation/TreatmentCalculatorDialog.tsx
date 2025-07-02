import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useMakingCosts } from "@/hooks/useMakingCosts";
import { calculateIntegratedFabricUsage, type FabricCalculationParams } from "@/hooks/services/makingCostIntegrationService";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}

export const TreatmentCalculatorDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType 
}: TreatmentCalculatorDialogProps) => {
  const { windowCoverings } = useWindowCoverings();
  const { makingCosts } = useMakingCosts();
  const { units } = useMeasurementUnits();
  
  // State
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<any>(null);
  const [makingCostData, setMakingCostData] = useState<any>(null);
  const [formData, setFormData] = useState({
    product_name: "",
    rail_width: "",
    drop: "",
    pooling: "0",
    quantity: 1,
    fabric_cost_per_yard: "",
    fabric_width: "137",
    roll_direction: "vertical",
    selected_heading: "",
    selected_hardware: "",
    selected_lining: "",
    notes: ""
  });
  const [calculations, setCalculations] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filter window coverings by treatment type with making costs
  const filteredWindowCoverings = windowCoverings.filter(wc => 
    wc.making_cost_id && (
      wc.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
      treatmentType === 'curtains' && wc.name.toLowerCase().includes('curtain')
    )
  );

  // Load making cost data when window covering changes
  useEffect(() => {
    if (selectedWindowCovering?.making_cost_id) {
      const makingCost = makingCosts?.find(mc => mc.id === selectedWindowCovering.making_cost_id);
      setMakingCostData(makingCost || null);
      setFormData(prev => ({
        ...prev,
        product_name: selectedWindowCovering.name
      }));
    }
  }, [selectedWindowCovering, makingCosts]);

  // Auto-select first window covering when dialog opens
  useEffect(() => {
    if (isOpen && filteredWindowCoverings.length > 0 && !selectedWindowCovering) {
      setSelectedWindowCovering(filteredWindowCoverings[0]);
    }
  }, [isOpen, filteredWindowCoverings, selectedWindowCovering]);

  // Calculate costs when form data changes
  useEffect(() => {
    const runCalculation = async () => {
      if (!selectedWindowCovering?.making_cost_id || !formData.rail_width || !formData.drop) {
        setCalculations(null);
        return;
      }

      setIsCalculating(true);
      try {
        const params: FabricCalculationParams = {
          windowCoveringId: selectedWindowCovering.id,
          makingCostId: selectedWindowCovering.making_cost_id,
          measurements: {
            railWidth: parseFloat(formData.rail_width),
            drop: parseFloat(formData.drop),
            pooling: parseFloat(formData.pooling) || 0
          },
          selectedOptions: [formData.selected_heading, formData.selected_hardware, formData.selected_lining].filter(Boolean),
          fabricDetails: {
            fabricWidth: parseFloat(formData.fabric_width),
            fabricCostPerYard: parseFloat(formData.fabric_cost_per_yard) || 0,
            rollDirection: formData.roll_direction
          }
        };

        const result = await calculateIntegratedFabricUsage(params);
        setCalculations(result);
      } catch (error) {
        console.error('Calculation failed:', error);
        setCalculations(null);
      } finally {
        setIsCalculating(false);
      }
    };

    runCalculation();
  }, [selectedWindowCovering, formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.rail_width || !formData.drop || !calculations) {
      alert('Please complete all required measurements');
      return;
    }

    const treatmentData = {
      product_name: formData.product_name,
      treatment_type: treatmentType,
      quantity: formData.quantity,
      material_cost: calculations.costs.fabricCost,
      labor_cost: calculations.costs.laborCost,
      total_price: calculations.costs.totalCost,
      unit_price: calculations.costs.totalCost / formData.quantity,
      measurements: {
        rail_width: formData.rail_width,
        drop: formData.drop,
        pooling: formData.pooling,
        fabric_usage: units.fabric === 'yards' ? calculations.fabricUsage.yards : calculations.fabricUsage.meters
      },
      fabric_details: {
        fabric_cost_per_yard: formData.fabric_cost_per_yard,
        fabric_width: formData.fabric_width,
        roll_direction: formData.roll_direction
      },
      selected_options: [formData.selected_heading, formData.selected_hardware, formData.selected_lining].filter(Boolean),
      notes: formData.notes || `Making cost generated ${treatmentType}`,
      status: "planned",
      window_covering: selectedWindowCovering,
      calculation_details: calculations
    };

    onSave(treatmentData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedWindowCovering(null);
    setMakingCostData(null);
    setCalculations(null);
    setFormData({
      product_name: "",
      rail_width: "",
      drop: "",
      pooling: "0",
      quantity: 1,
      fabric_cost_per_yard: "",
      fabric_width: "137",
      roll_direction: "vertical",
      selected_heading: "",
      selected_hardware: "",
      selected_lining: "",
      notes: ""
    });
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background border-b pb-4 mb-4">
          <DialogTitle className="flex items-center text-center text-lg font-semibold">
            <Calculator className="mr-2 h-5 w-5" />
            {treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)} Calculator
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Calculate costs with integrated making cost system
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Window Covering Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Window Covering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedWindowCovering?.id || ''}
                onValueChange={(value) => {
                  const wc = windowCoverings.find(w => w.id === value);
                  setSelectedWindowCovering(wc || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${treatmentType} window covering`} />
                </SelectTrigger>
                <SelectContent>
                  {filteredWindowCoverings.map((wc) => (
                    <SelectItem key={wc.id} value={wc.id}>
                      <div className="flex items-center gap-2">
                        <span>{wc.name}</span>
                        <Badge variant="secondary" className="text-xs">Making Cost</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedWindowCovering && (
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange("product_name", e.target.value)}
                    placeholder="Enter custom product name"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {selectedWindowCovering && (
            <>
              {/* Basic Measurements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Measurements ({units.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="rail_width">Rail Width *</Label>
                      <Input
                        id="rail_width"
                        type="number"
                        value={formData.rail_width}
                        onChange={(e) => handleInputChange("rail_width", e.target.value)}
                        placeholder="Width"
                      />
                    </div>
                    <div>
                      <Label htmlFor="drop">Drop *</Label>
                      <Input
                        id="drop"
                        type="number"
                        value={formData.drop}
                        onChange={(e) => handleInputChange("drop", e.target.value)}
                        placeholder="Height"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="pooling">Pooling</Label>
                      <Input
                        id="pooling"
                        type="number"
                        value={formData.pooling}
                        onChange={(e) => handleInputChange("pooling", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Making Cost Options */}
              {makingCostData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Making Cost Options - {makingCostData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Heading Options */}
                    {makingCostData.heading_options && makingCostData.heading_options.length > 0 && (
                      <div>
                        <Label>Heading Type</Label>
                        <Select value={formData.selected_heading} onValueChange={(value) => handleInputChange("selected_heading", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select heading type" />
                          </SelectTrigger>
                          <SelectContent>
                            {makingCostData.heading_options.map((option: any, index: number) => (
                              <SelectItem key={index} value={option.name}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    +{formatCurrency(option.base_price)} per {option.pricing_method?.replace('per-', '')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Hardware Options */}
                    {makingCostData.hardware_options && makingCostData.hardware_options.length > 0 && (
                      <div>
                        <Label>Hardware</Label>
                        <Select value={formData.selected_hardware} onValueChange={(value) => handleInputChange("selected_hardware", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hardware" />
                          </SelectTrigger>
                          <SelectContent>
                            {makingCostData.hardware_options.map((option: any, index: number) => (
                              <SelectItem key={index} value={option.name}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    +{formatCurrency(option.base_price)} per {option.pricing_method?.replace('per-', '')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Lining Options */}
                    {makingCostData.lining_options && makingCostData.lining_options.length > 0 && (
                      <div>
                        <Label>Lining</Label>
                        <Select value={formData.selected_lining} onValueChange={(value) => handleInputChange("selected_lining", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lining" />
                          </SelectTrigger>
                          <SelectContent>
                            {makingCostData.lining_options.map((option: any, index: number) => (
                              <SelectItem key={index} value={option.name}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    +{formatCurrency(option.base_price)} per {option.pricing_method?.replace('per-', '')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Fabric Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fabric Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fabric_cost_per_yard">Cost Per {units.fabric === 'yards' ? 'Yard' : 'Meter'}</Label>
                      <Input
                        id="fabric_cost_per_yard"
                        type="number"
                        step="0.01"
                        value={formData.fabric_cost_per_yard}
                        onChange={(e) => handleInputChange("fabric_cost_per_yard", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fabric_width">Fabric Width (cm)</Label>
                      <Input
                        id="fabric_width"
                        type="number"
                        value={formData.fabric_width}
                        onChange={(e) => handleInputChange("fabric_width", e.target.value)}
                        placeholder="137"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Fabric Orientation</Label>
                    <Select value={formData.roll_direction} onValueChange={(value) => handleInputChange("roll_direction", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vertical">Vertical (Most Common)</SelectItem>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Calculation Results */}
              {calculations && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Calculation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Fabric Usage */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Fabric Usage</div>
                      <div className="text-lg font-bold text-blue-600">
                        {units.fabric === 'yards' ? calculations.fabricUsage.yards.toFixed(1) : calculations.fabricUsage.meters.toFixed(1)} {units.fabric}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Orientation: {calculations.fabricUsage.orientation} | 
                        Widths needed: {calculations.fabricUsage.widthsRequired} | 
                        Seams: {calculations.fabricUsage.seamsRequired}
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fabric Cost:</span>
                        <span>{formatCurrency(calculations.costs.fabricCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Making Cost:</span>
                        <span>{formatCurrency(calculations.costs.makingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Labor Cost:</span>
                        <span>{formatCurrency(calculations.costs.laborCost)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span>{formatCurrency(calculations.costs.totalCost)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Per unit: {formatCurrency(calculations.costs.totalCost / formData.quantity)}
                      </div>
                    </div>

                    {/* Warnings */}
                    {calculations.warnings && calculations.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {calculations.warnings.map((warning: string, index: number) => (
                            <div key={index} className="text-xs">{warning}</div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Fabric Calculation Explanation */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium mb-2">How fabric usage is calculated:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>• Rail width: {formData.rail_width}cm</div>
                        <div>• Drop: {formData.drop}cm + {formData.pooling}cm pooling + 25cm allowances</div>
                        <div>• Fabric width: {formData.fabric_width}cm</div>
                        <div>• Orientation: {calculations.fabricUsage.orientation}</div>
                        <div>• Widths required: {calculations.fabricUsage.widthsRequired}</div>
                        <div>• Total fabric length: {(calculations.fabricUsage.widthsRequired * (parseFloat(formData.drop) + parseFloat(formData.pooling) + 25)).toFixed(0)}cm</div>
                        <div>• Final usage: {units.fabric === 'yards' ? calculations.fabricUsage.yards.toFixed(1) : calculations.fabricUsage.meters.toFixed(1)} {units.fabric}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isCalculating && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Calculating...</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t sticky bottom-0 bg-background">
          <div className="text-sm text-muted-foreground">
            {calculations && (
              <>
                <span>Total: <span className="font-bold text-lg text-primary">{formatCurrency(calculations.costs.totalCost)}</span></span>
                <span className="ml-4 text-xs">
                  Per unit: {formatCurrency(calculations.costs.totalCost / formData.quantity)}
                </span>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.rail_width || !formData.drop || !selectedWindowCovering || !calculations}
            >
              Save Treatment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};