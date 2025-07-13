
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useMakingCosts } from "@/hooks/useMakingCosts";
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
  const [error, setError] = useState<string | null>(null);

  // Filter window coverings by treatment type - show all active templates first, then filter by name
  const allActiveWindowCoverings = windowCoverings?.filter(wc => wc.active && wc.making_cost_id) || [];
  const matchingWindowCoverings = allActiveWindowCoverings.filter(wc => {
    const hasMatchingName = wc.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
                           (treatmentType === 'curtains' && wc.name.toLowerCase().includes('curtain'));
    return hasMatchingName;
  });
  
  // Show matching templates first, then all other templates
  const filteredWindowCoverings = matchingWindowCoverings.length > 0 
    ? matchingWindowCoverings 
    : allActiveWindowCoverings;

  // Load making cost data when window covering changes
  useEffect(() => {
    if (selectedWindowCovering?.making_cost_id && makingCosts) {
      const makingCost = makingCosts.find(mc => mc.id === selectedWindowCovering.making_cost_id);
      setMakingCostData(makingCost || null);
      setFormData(prev => ({
        ...prev,
        product_name: selectedWindowCovering.name || ''
      }));
    }
  }, [selectedWindowCovering, makingCosts]);

  // Auto-select first window covering
  useEffect(() => {
    if (isOpen && filteredWindowCoverings.length > 0 && !selectedWindowCovering) {
      setSelectedWindowCovering(filteredWindowCoverings[0]);
    }
  }, [isOpen, filteredWindowCoverings, selectedWindowCovering]);

  // Simple calculation
  useEffect(() => {
    if (!selectedWindowCovering || !formData.rail_width || !formData.drop) {
      setCalculations(null);
      setError(null);
      return;
    }

    try {
      const railWidth = parseFloat(formData.rail_width) || 0;
      const drop = parseFloat(formData.drop) || 0;
      const pooling = parseFloat(formData.pooling) || 0;
      const fabricWidth = parseFloat(formData.fabric_width) || 137;
      const fabricCost = parseFloat(formData.fabric_cost_per_yard) || 0;
      
      // Basic fabric calculation
      const totalDrop = drop + pooling;
      const widthsNeeded = Math.ceil(railWidth / fabricWidth);
      const fabricUsageMeters = (totalDrop * widthsNeeded) / 100; // Convert cm to meters
      const fabricUsageYards = fabricUsageMeters * 1.094; // Convert to yards
      
      const fabricCostTotal = fabricUsageYards * fabricCost;
      
      // Making cost calculation
      let makingCostTotal = 0;
      if (makingCostData) {
        // Base making cost (simplified)
        makingCostTotal = railWidth * 0.5; // £0.50 per cm of width
        
        // Add selected options
        if (formData.selected_heading && formData.selected_heading !== "no-heading" && makingCostData.heading_options) {
          const headingOption = makingCostData.heading_options.find((opt: any) => opt.name === formData.selected_heading);
          if (headingOption) makingCostTotal += headingOption.base_price || 0;
        }
        
        if (formData.selected_hardware && formData.selected_hardware !== "no-hardware" && makingCostData.hardware_options) {
          const hardwareOption = makingCostData.hardware_options.find((opt: any) => opt.name === formData.selected_hardware);
          if (hardwareOption) makingCostTotal += hardwareOption.base_price || 0;
        }
        
        if (formData.selected_lining && formData.selected_lining !== "no-lining" && makingCostData.lining_options) {
          const liningOption = makingCostData.lining_options.find((opt: any) => opt.name === formData.selected_lining);
          if (liningOption) makingCostTotal += liningOption.base_price || 0;
        }
      }
      
      const subtotal = fabricCostTotal + makingCostTotal;
      const margin = selectedWindowCovering.margin_percentage || 40;
      const totalCost = subtotal * (1 + margin / 100);
      
      setCalculations({
        fabricUsage: {
          meters: fabricUsageMeters,
          yards: fabricUsageYards,
          widthsRequired: widthsNeeded,
          orientation: formData.roll_direction
        },
        costs: {
          fabricCost: fabricCostTotal,
          makingCost: makingCostTotal,
          subtotal: subtotal,
          margin: margin,
          totalCost: totalCost
        }
      });
      
      setError(null);
    } catch (err) {
      setError('Calculation error');
      setCalculations(null);
    }
  }, [selectedWindowCovering, makingCostData, formData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount || 0);
  };

  const handleSubmit = () => {
    if (!formData.rail_width || !formData.drop || !calculations) {
      setError('Please complete all required fields');
      return;
    }

    const treatmentData = {
      product_name: formData.product_name || selectedWindowCovering?.name || '',
      treatment_type: treatmentType,
      quantity: formData.quantity || 1,
      material_cost: calculations.costs?.fabricCost || 0,
      labor_cost: calculations.costs?.makingCost || 0,
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
      selected_options: [formData.selected_heading, formData.selected_hardware, formData.selected_lining].filter(opt => opt && !opt.startsWith('no-')),
      notes: formData.notes || `Smart calculator generated ${treatmentType}`,
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

  if (windowCoveringsLoading || makingCostsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">Loading...</div>
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
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No window covering templates found. 
              Create window covering templates with making cost configurations in Settings to use the Smart Calculator.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Smart {treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)} Calculator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Window Covering Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Window Covering</Label>
                <Select
                  value={selectedWindowCovering?.id || ''}
                  onValueChange={(value) => {
                    const wc = windowCoverings?.find(w => w.id === value);
                    setSelectedWindowCovering(wc || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select window covering" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchingWindowCoverings.length > 0 && (
                      <>
                        {matchingWindowCoverings.map((wc) => (
                          <SelectItem key={wc.id} value={wc.id}>
                            <div className="flex items-center gap-2">
                              <span>{wc.name}</span>
                              <Badge variant="default">Recommended</Badge>
                            </div>
                          </SelectItem>
                        ))}
                        {allActiveWindowCoverings.length > matchingWindowCoverings.length && (
                          <div className="px-2 py-1 text-xs text-gray-500 border-t">Other Templates</div>
                        )}
                      </>
                    )}
                    {allActiveWindowCoverings.filter(wc => !matchingWindowCoverings.includes(wc)).map((wc) => (
                      <SelectItem key={wc.id} value={wc.id}>
                        <div className="flex items-center gap-2">
                          <span>{wc.name}</span>
                          <Badge variant="secondary">Template</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Product Name</Label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Custom product name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Measurements ({units?.length || 'cm'})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Rail Width *</Label>
                  <Input
                    type="number"
                    value={formData.rail_width}
                    onChange={(e) => setFormData(prev => ({ ...prev, rail_width: e.target.value }))}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label>Drop *</Label>
                  <Input
                    type="number"
                    value={formData.drop}
                    onChange={(e) => setFormData(prev => ({ ...prev, drop: e.target.value }))}
                    placeholder="200"
                  />
                </div>
                <div>
                  <Label>Pooling</Label>
                  <Input
                    type="number"
                    value={formData.pooling}
                    onChange={(e) => setFormData(prev => ({ ...prev, pooling: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          {makingCostData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Options - {makingCostData.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {makingCostData.heading_options?.length > 0 && (
                  <div>
                    <Label>Heading</Label>
                    <Select value={formData.selected_heading} onValueChange={(value) => setFormData(prev => ({ ...prev, selected_heading: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select heading" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-heading">No heading</SelectItem>
                        {makingCostData.heading_options.map((option: any, index: number) => (
                          <SelectItem key={index} value={option.name}>
                            {option.name} - {formatCurrency(option.base_price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {makingCostData.hardware_options?.length > 0 && (
                  <div>
                    <Label>Hardware</Label>
                    <Select value={formData.selected_hardware} onValueChange={(value) => setFormData(prev => ({ ...prev, selected_hardware: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hardware" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-hardware">No hardware</SelectItem>
                        {makingCostData.hardware_options.map((option: any, index: number) => (
                          <SelectItem key={index} value={option.name}>
                            {option.name} - {formatCurrency(option.base_price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {makingCostData.lining_options?.length > 0 && (
                  <div>
                    <Label>Lining</Label>
                    <Select value={formData.selected_lining} onValueChange={(value) => setFormData(prev => ({ ...prev, selected_lining: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lining" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-lining">No lining</SelectItem>
                        {makingCostData.lining_options.map((option: any, index: number) => (
                          <SelectItem key={index} value={option.name}>
                            {option.name} - {formatCurrency(option.base_price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fabric */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fabric Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cost Per Yard</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fabric_cost_per_yard}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabric_cost_per_yard: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Fabric Width (cm)</Label>
                  <Input
                    type="number"
                    value={formData.fabric_width}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabric_width: e.target.value }))}
                    placeholder="137"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {calculations && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Calculation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm font-medium mb-1">Fabric Usage</div>
                  <div className="text-lg font-bold text-blue-600">
                    {units?.fabric === 'yards' 
                      ? calculations.fabricUsage?.yards?.toFixed(1) 
                      : calculations.fabricUsage?.meters?.toFixed(1)
                    } {units?.fabric || 'meters'}
                  </div>
                  <div className="text-xs text-gray-600">
                    Widths needed: {calculations.fabricUsage?.widthsRequired || 1}
                  </div>
                </div>

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
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculations.costs?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Margin ({calculations.costs?.margin}%):</span>
                    <span>{formatCurrency((calculations.costs?.totalCost || 0) - (calculations.costs?.subtotal || 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(calculations.costs?.totalCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {calculations && (
              <span className="font-bold text-lg text-green-600">
                Total: {formatCurrency(calculations.costs?.totalCost)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.rail_width || !formData.drop || !calculations}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Treatment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
