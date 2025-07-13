
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle, Edit, Plus } from "lucide-react";
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

  // Show all active window covering templates from settings
  const filteredWindowCoverings = windowCoverings?.filter(wc => wc.active) || [];
  
  // Separate templates by relevance (optional - for better UX)
  const matchingWindowCoverings = filteredWindowCoverings.filter(wc => {
    const hasMatchingName = wc.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
                           (treatmentType === 'curtains' && wc.name.toLowerCase().includes('curtain'));
    return hasMatchingName;
  });
  
  const otherWindowCoverings = filteredWindowCoverings.filter(wc => 
    !matchingWindowCoverings.includes(wc)
  );

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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {selectedWindowCovering?.name || treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)} Calculator
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Treatment Details */}
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Treatment Details Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Treatment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Treatment name</Label>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Treatment"
                  />
                </div>
                
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                {calculations && (
                  <div>
                    <Label>Price</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculations.costs.totalCost)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visual Representation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Curtain Visual */}
                  <div className="relative">
                    <div className="w-48 h-32 bg-gray-200 rounded-t-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gray-800"></div>
                      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-800"></div>
                      <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 opacity-80"></div>
                    </div>
                  </div>
                  
                  {/* Single/Pair Options */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="curtainType" 
                        value="single" 
                        defaultChecked 
                        className="w-4 h-4 text-primary" 
                      />
                      <span>Single</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="curtainType" 
                        value="pair" 
                        className="w-4 h-4 text-primary" 
                      />
                      <span>Pair</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit treatment hems
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add hardware
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Measurements & Details */}
          <div className="space-y-6">
            {/* Treatment Measurements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Treatment measurements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rail width</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={formData.rail_width}
                        onChange={(e) => setFormData(prev => ({ ...prev, rail_width: e.target.value }))}
                        placeholder="300"
                      />
                      <span className="text-sm text-gray-500">cm</span>
                    </div>
                  </div>
                  <div>
                    <Label>Curtain drop</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={formData.drop}
                        onChange={(e) => setFormData(prev => ({ ...prev, drop: e.target.value }))}
                        placeholder="200"
                      />
                      <span className="text-sm text-gray-500">cm</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Curtain pooling</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={formData.pooling}
                      onChange={(e) => setFormData(prev => ({ ...prev, pooling: e.target.value }))}
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">cm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fabric Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fabric</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full justify-start h-12">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <Plus className="h-3 w-3" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Select Fabric</div>
                      <div className="text-xs text-gray-500">Choose from library or enter manually</div>
                    </div>
                  </div>
                </Button>
                <div className="mt-4 space-y-3">
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
                </div>
              </CardContent>
            </Card>

            {/* Calculation Results */}
            {calculations && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Calculation results ({selectedWindowCovering?.name || treatmentType})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric amount</span>
                      <span className="font-medium">{(calculations.fabricUsage.meters * 100).toFixed(0)} cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Curtain width total</span>
                      <span className="font-medium">{calculations.fabricUsage.widthsRequired} Drops ({calculations.fabricUsage.meters.toFixed(2)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric drop requirements</span>
                      <span className="font-medium">{(calculations.fabricUsage.meters * 100).toFixed(0)} cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric width requirements</span>
                      <span className="font-medium">{(calculations.fabricUsage.meters * 100).toFixed(0)} cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lining price</span>
                      <span className="font-medium">{formatCurrency(19.13)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manufacturing price</span>
                      <span className="font-medium">{formatCurrency(calculations.costs.makingCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric price</span>
                      <span className="font-medium">{formatCurrency(calculations.costs.fabricCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Leftovers-Vertical</span>
                      <span className="font-medium">25.00 cm</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Price</span>
                        <span className="text-lg text-green-600">{formatCurrency(calculations.costs.totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedWindowCovering || !formData.rail_width || !formData.drop}
          >
            Save Treatment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
