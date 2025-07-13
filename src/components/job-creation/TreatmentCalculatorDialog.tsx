
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
import { useProductTemplates } from "@/hooks/useProductTemplates";
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
  const { templates, isLoading: templatesLoading } = useProductTemplates();
  const { units } = useMeasurementUnits();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    product_name: "",
    rail_width: "",
    drop: "",
    pooling: "0",
    quantity: 1,
    fabric_cost_per_yard: "",
    fabric_width: "137",
    roll_direction: "vertical",
    curtain_type: "single",
    selected_heading: "",
    selected_hardware: "",
    selected_lining: "",
    notes: ""
  });
  const [calculations, setCalculations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter active templates
  const activeTemplates = templates?.filter(t => t.active) || [];
  
  // Find matching template for the treatment type
  const matchingTemplate = activeTemplates.find(template => 
    template.name.toLowerCase() === treatmentType.toLowerCase()
  );

  // Auto-select the matching template when dialog opens
  useEffect(() => {
    if (isOpen && matchingTemplate && !selectedTemplate) {
      setSelectedTemplate(matchingTemplate);
      setFormData(prev => ({
        ...prev,
        product_name: matchingTemplate.name || ''
      }));
    }
  }, [isOpen, matchingTemplate, selectedTemplate]);

  // Calculate treatment based on template configuration
  useEffect(() => {
    if (!selectedTemplate || !formData.rail_width || !formData.drop) {
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
      const quantity = formData.quantity || 1;
      
      // Calculate fabric requirements based on template
      const totalDrop = drop + pooling;
      let widthsNeeded = 1;
      
      // Adjust for curtain type
      if (formData.curtain_type === "pair") {
        widthsNeeded = Math.ceil((railWidth * 2.5) / fabricWidth); // 2.5x fullness for pairs
      } else {
        widthsNeeded = Math.ceil((railWidth * 2) / fabricWidth); // 2x fullness for single
      }
      
      const fabricUsageMeters = (totalDrop * widthsNeeded) / 100; // Convert cm to meters
      const fabricUsageYards = fabricUsageMeters * 1.094; // Convert to yards
      
      const fabricCostTotal = fabricUsageYards * fabricCost * quantity;
      
      // Basic making cost calculation (would be more complex with real making cost data)
      let makingCostTotal = railWidth * 0.75 * quantity; // £0.75 per cm of width
      
      // Add complexity for pairs
      if (formData.curtain_type === "pair") {
        makingCostTotal *= 1.5;
      }
      
      // Apply template-specific calculations if available
      const templateMarkup = 40; // Default 40% markup
      const subtotal = fabricCostTotal + makingCostTotal;
      const totalCost = subtotal * (1 + templateMarkup / 100);
      
      setCalculations({
        fabricUsage: {
          meters: fabricUsageMeters,
          yards: fabricUsageYards,
          widthsRequired: widthsNeeded,
          orientation: formData.roll_direction,
          totalDrop: totalDrop
        },
        costs: {
          fabricCost: fabricCostTotal,
          makingCost: makingCostTotal,
          liningCost: 19.13 * quantity, // Example lining cost
          subtotal: subtotal,
          margin: templateMarkup,
          totalCost: totalCost
        },
        template: selectedTemplate
      });
      
      setError(null);
    } catch (err) {
      console.error('Calculation error:', err);
      setError('Calculation error');
      setCalculations(null);
    }
  }, [selectedTemplate, formData]);

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
      product_name: formData.product_name || selectedTemplate?.name || treatmentType,
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
        fabric_usage: calculations.fabricUsage?.meters,
        curtain_type: formData.curtain_type
      },
      fabric_details: {
        fabric_cost_per_yard: formData.fabric_cost_per_yard,
        fabric_width: formData.fabric_width,
        roll_direction: formData.roll_direction
      },
      selected_options: [formData.selected_heading, formData.selected_hardware, formData.selected_lining].filter(opt => opt && !opt.startsWith('no-')),
      notes: formData.notes || `${selectedTemplate?.name || treatmentType} - calculated using template`,
      status: "planned",
      template_used: selectedTemplate,
      calculation_details: calculations
    };

    console.log('Submitting treatment data:', treatmentData);
    onSave(treatmentData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTemplate(matchingTemplate || null);
    setCalculations(null);
    setError(null);
    setFormData({
      product_name: matchingTemplate?.name || "",
      rail_width: "",
      drop: "",
      pooling: "0",
      quantity: 1,
      fabric_cost_per_yard: "",
      fabric_width: "137",
      roll_direction: "vertical",
      curtain_type: "single",
      selected_heading: "",
      selected_hardware: "",
      selected_lining: "",
      notes: ""
    });
    onClose();
  };

  if (templatesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">Loading templates...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!matchingTemplate && activeTemplates.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Template Available</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No product templates found for "{treatmentType}". 
              Create product templates in Settings to use the calculator.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!matchingTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Template Found</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No template found for "{treatmentType}". 
              Available templates: {activeTemplates.map(t => t.name).join(', ')}.
              Please create a template with the exact name "{treatmentType}" in Settings.
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
            {selectedTemplate?.name || treatmentType} Calculator
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

            {/* Template Info */}
            {selectedTemplate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Template: {selectedTemplate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{selectedTemplate.product_type}</Badge>
                    <Badge variant="outline">{selectedTemplate.calculation_method}</Badge>
                    {selectedTemplate.description && (
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                    placeholder="Treatment name"
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
                    <Label>Total Price</Label>
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
                      {formData.curtain_type === "pair" && (
                        <div className="absolute top-0 left-1/2 w-px h-full bg-gray-600 transform -translate-x-px"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Single/Pair Options */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="curtainType" 
                        value="single" 
                        checked={formData.curtain_type === "single"}
                        onChange={(e) => setFormData(prev => ({ ...prev, curtain_type: e.target.value }))}
                        className="w-4 h-4 text-primary" 
                      />
                      <span>Single</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="curtainType" 
                        value="pair" 
                        checked={formData.curtain_type === "pair"}
                        onChange={(e) => setFormData(prev => ({ ...prev, curtain_type: e.target.value }))}
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
                    Calculation results ({selectedTemplate?.name})
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
                      <span className="font-medium">{calculations.fabricUsage.widthsRequired} Drops ({calculations.fabricUsage.meters.toFixed(2)}m)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric drop requirements</span>
                      <span className="font-medium">{calculations.fabricUsage.totalDrop} cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Curtain type</span>
                      <span className="font-medium">{formData.curtain_type === "pair" ? "Pair" : "Single"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lining price</span>
                      <span className="font-medium">{formatCurrency(calculations.costs.liningCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manufacturing price</span>
                      <span className="font-medium">{formatCurrency(calculations.costs.makingCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric price</span>
                      <span className="font-medium">{formatCurrency(calculations.costs.fabricCost)}</span>
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
            disabled={!selectedTemplate || !formData.rail_width || !formData.drop}
          >
            Save Treatment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
