
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
  const { windowCoverings, isLoading: windowCoveringsLoading } = useWindowCoverings();
  const { makingCosts, isLoading: makingCostsLoading } = useMakingCosts();
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
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log("=== TREATMENT CALCULATOR DEBUG ===");
  console.log("Dialog Open:", isOpen);
  console.log("Treatment Type:", treatmentType);
  console.log("Window Coverings Count:", windowCoverings?.length || 0);
  console.log("Making Costs Count:", makingCosts?.length || 0);
  console.log("Form Data:", formData);
  console.log("Selected Window Covering:", selectedWindowCovering);
  console.log("Making Cost Data:", makingCostData);
  console.log("Calculations:", calculations);

  // Filter window coverings by treatment type with making costs
  const filteredWindowCoverings = windowCoverings?.filter(wc => {
    const hasMatchingName = wc.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
                           (treatmentType === 'curtains' && wc.name.toLowerCase().includes('curtain'));
    const hasMakingCost = Boolean(wc.making_cost_id);
    console.log(`Filtering ${wc.name}: hasMatchingName=${hasMatchingName}, hasMakingCost=${hasMakingCost}`);
    return hasMatchingName && hasMakingCost;
  }) || [];

  console.log("Filtered Window Coverings:", filteredWindowCoverings);

  // Load making cost data when window covering changes
  useEffect(() => {
    if (selectedWindowCovering?.making_cost_id && makingCosts) {
      const makingCost = makingCosts.find(mc => mc.id === selectedWindowCovering.making_cost_id);
      console.log("Loading making cost data:", makingCost);
      setMakingCostData(makingCost || null);
      setFormData(prev => ({
        ...prev,
        product_name: selectedWindowCovering.name || ''
      }));
    }
  }, [selectedWindowCovering, makingCosts]);

  // Auto-select first window covering when dialog opens
  useEffect(() => {
    if (isOpen && filteredWindowCoverings.length > 0 && !selectedWindowCovering) {
      console.log("Auto-selecting first window covering:", filteredWindowCoverings[0]);
      setSelectedWindowCovering(filteredWindowCoverings[0]);
    }
  }, [isOpen, filteredWindowCoverings, selectedWindowCovering]);

  // Calculate costs when form data changes
  useEffect(() => {
    const runCalculation = async () => {
      if (!selectedWindowCovering?.making_cost_id || !formData.rail_width || !formData.drop) {
        console.log("Skipping calculation - missing data:", {
          windowCovering: !!selectedWindowCovering,
          makingCostId: selectedWindowCovering?.making_cost_id,
          railWidth: formData.rail_width,
          drop: formData.drop
        });
        setCalculations(null);
        setError(null);
        return;
      }

      setIsCalculating(true);
      setError(null);
      
      try {
        console.log("Starting calculation...");
        const params: FabricCalculationParams = {
          windowCoveringId: selectedWindowCovering.id,
          makingCostId: selectedWindowCovering.making_cost_id,
          measurements: {
            railWidth: parseFloat(formData.rail_width) || 0,
            drop: parseFloat(formData.drop) || 0,
            pooling: parseFloat(formData.pooling) || 0
          },
          selectedOptions: [formData.selected_heading, formData.selected_hardware, formData.selected_lining].filter(Boolean),
          fabricDetails: {
            fabricWidth: parseFloat(formData.fabric_width) || 137,
            fabricCostPerYard: parseFloat(formData.fabric_cost_per_yard) || 0,
            rollDirection: formData.roll_direction as 'vertical' | 'horizontal'
          }
        };

        console.log('Calculation params:', params);
        const result = await calculateIntegratedFabricUsage(params);
        console.log('Calculation result:', result);
        setCalculations(result);
      } catch (error) {
        console.error('Calculation failed:', error);
        setError(error instanceof Error ? error.message : 'Calculation failed');
        setCalculations(null);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(runCalculation, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [selectedWindowCovering, formData]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`Input changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    try {
      console.log("Submitting treatment data...");
      
      if (!formData.rail_width || !formData.drop) {
        console.log("Missing required measurements");
        setError('Please complete all required measurements (rail width and drop)');
        return;
      }

      if (!calculations) {
        console.log("No calculations available");
        setError('Please wait for calculations to complete');
        return;
      }

      const treatmentData = {
        product_name: formData.product_name || selectedWindowCovering?.name || '',
        treatment_type: treatmentType,
        quantity: formData.quantity || 1,
        material_cost: calculations.costs?.fabricCost || 0,
        labor_cost: calculations.costs?.laborCost || 0,
        total_price: calculations.costs?.totalCost || 0,
        unit_price: (calculations.costs?.totalCost || 0) / (formData.quantity || 1),
        measurements: {
          rail_width: formData.rail_width,
          drop: formData.drop,
          pooling: formData.pooling,
          fabric_usage: units?.fabric === 'yards' ? calculations.fabricUsage?.yards : calculations.fabricUsage?.meters
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

      console.log("Final treatment data:", treatmentData);
      onSave(treatmentData);
      handleClose();
    } catch (error) {
      console.error('Error saving treatment:', error);
      setError('Failed to save treatment data');
    }
  };

  const handleClose = () => {
    console.log("Closing dialog and resetting state");
    setSelectedWindowCovering(null);
    setMakingCostData(null);
    setCalculations(null);
    setError(null);
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

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (windowCoveringsLoading || makingCostsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">Loading calculator...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (filteredWindowCoverings.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Smart Calculator Available</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No window coverings with making cost configurations found for "{treatmentType}". 
                Please create a window covering with making cost configuration in Settings first.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center text-lg font-semibold">
            <Calculator className="mr-2 h-5 w-5" />
            Smart {treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)} Calculator
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Integrated making cost calculator with fabric usage
          </p>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Test - Add manual calculation button */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="text-sm">
                <strong>Debug Info:</strong><br/>
                Window Covering: {selectedWindowCovering?.name || 'None'}<br/>
                Making Cost: {makingCostData?.name || 'None'}<br/>
                Rail Width: {formData.rail_width || 'Empty'}<br/>
                Drop: {formData.drop || 'Empty'}<br/>
                Calculations: {calculations ? 'Available' : 'None'}
              </div>
            </CardContent>
          </Card>

          {/* Window Covering Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Window Covering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedWindowCovering?.id || ''}
                onValueChange={(value) => {
                  console.log("Selected window covering ID:", value);
                  const wc = windowCoverings?.find(w => w.id === value);
                  console.log("Found window covering:", wc);
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
                        <Badge variant="secondary" className="text-xs">Smart</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedWindowCovering && (
                <div>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Measurements ({units?.length || 'cm'})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="rail_width">Rail Width *</Label>
                      <Input
                        id="rail_width"
                        type="number"
                        step="0.1"
                        value={formData.rail_width}
                        onChange={(e) => handleInputChange("rail_width", e.target.value)}
                        placeholder="e.g. 150"
                      />
                    </div>
                    <div>
                      <Label htmlFor="drop">Drop (Height) *</Label>
                      <Input
                        id="drop"
                        type="number"
                        step="0.1"
                        value={formData.drop}
                        onChange={(e) => handleInputChange("drop", e.target.value)}
                        placeholder="e.g. 200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="pooling">Pooling</Label>
                      <Input
                        id="pooling"
                        type="number"
                        step="0.1"
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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Options - {makingCostData.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                              <SelectItem key={index} value={option.name || `option-${index}`}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.name || 'Unnamed Option'}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    +{formatCurrency(option.base_price || 0)}
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
                              <SelectItem key={index} value={option.name || `option-${index}`}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.name || 'Unnamed Option'}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    +{formatCurrency(option.base_price || 0)}
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
                              <SelectItem key={index} value={option.name || `option-${index}`}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.name || 'Unnamed Option'}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    +{formatCurrency(option.base_price || 0)}
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fabric Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fabric_cost_per_yard">Cost Per {units?.fabric === 'yards' ? 'Yard' : 'Meter'}</Label>
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
              {(isCalculating || calculations) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Calculation Results
                      {isCalculating && <span className="text-sm font-normal text-muted-foreground">Calculating...</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calculations && (
                      <>
                        {/* Fabric Usage */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium mb-2">Fabric Usage</div>
                          <div className="text-lg font-bold text-blue-600">
                            {units?.fabric === 'yards' 
                              ? (calculations.fabricUsage?.yards || 0).toFixed(1) 
                              : (calculations.fabricUsage?.meters || 0).toFixed(1)
                            } {units?.fabric || 'meters'}
                          </div>
                          {calculations.fabricUsage && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Orientation: {calculations.fabricUsage.orientation || 'vertical'} | 
                              Widths needed: {calculations.fabricUsage.widthsRequired || 1} | 
                              Seams: {calculations.fabricUsage.seamsRequired || 0}
                            </div>
                          )}
                        </div>

                        {/* Cost Breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Fabric Cost:</span>
                            <span>{formatCurrency(calculations.costs?.fabricCost)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Making Cost:</span>
                            <span>{formatCurrency(calculations.costs?.makingCost)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Labor Cost:</span>
                            <span>{formatCurrency(calculations.costs?.laborCost)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total Cost:</span>
                            <span>{formatCurrency(calculations.costs?.totalCost)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Per unit: {formatCurrency((calculations.costs?.totalCost || 0) / (formData.quantity || 1))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            {calculations && (
              <span className="font-bold text-lg text-primary">
                Total: {formatCurrency(calculations.costs?.totalCost)}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.rail_width || !formData.drop || !selectedWindowCovering || isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Save Treatment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
