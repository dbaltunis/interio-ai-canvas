
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calculator, Info, Plus, Edit3, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TreatmentFormData, CalculationResult, DetailedCalculation } from './types';
import { calculateTotalPrice, formatCurrency } from './calculationUtils';
import { FabricSelector } from '@/components/fabric/FabricSelector';
import { useProductTemplates } from '@/hooks/useProductTemplates';

interface EnhancedTreatmentCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}

interface FabricEntry {
  name: string;
  width: number;
  verticalRepeat: number;
  horizontalRepeat: number;
  pricePerUnit: number;
}

interface CalculationBreakdown {
  fabricAmount: string;
  curtainWidthTotal: string;
  fabricDropRequirements: string;
  fabricWidthRequirements: string;
  liningPrice: number;
  manufacturingPrice: number;
  fabricPrice: number;
  leftoversVertical: string;
  leftoversHorizontal: string;
}

export const EnhancedTreatmentCalculator = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType 
}: EnhancedTreatmentCalculatorProps) => {
  // Use actual product templates from database
  const { templates, isLoading: templatesLoading } = useProductTemplates();
  
  // Find matching template for the treatment type
  const matchingTemplate = templates?.find(template => 
    template.name.toLowerCase() === treatmentType.toLowerCase() && template.active
  );

  const [formData, setFormData] = useState<TreatmentFormData>({
    treatmentName: `${treatmentType} Treatment`,
    quantity: 1,
    windowPosition: "",
    windowType: "",
    headingStyle: "Pencil Pleat",
    headingFullness: "2",
    lining: "Lined",
    mounting: "",
    railWidth: "300",
    curtainDrop: "200",
    curtainPooling: "0",
    returnDepth: "15",
    fabricMode: "manual",
    selectedFabric: null,
    fabricName: "Sky Gray 01",
    fabricWidth: "300",
    fabricPricePerYard: "18.7",
    verticalRepeat: "0",
    horizontalRepeat: "0",
    hardware: "",
    hardwareFinish: "",
    additionalFeatures: [],
    laborRate: 45,
    markupPercentage: 40
  });

  const [fabricOrientation, setFabricOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [isManualFabric, setIsManualFabric] = useState(true);
  const [dontUpdateTotalPrice, setDontUpdateTotalPrice] = useState(false);
  const [calculation, setCalculation] = useState<(CalculationResult & { details: DetailedCalculation }) | null>(null);
  const [calculationBreakdown, setCalculationBreakdown] = useState<CalculationBreakdown | null>(null);

  // Get lining options from template or use defaults
  const liningOptions = matchingTemplate?.components?.lining_options || [
    { value: "none", label: "No Lining", price: 0 },
    { value: "lined", label: "Lined", price: 8.50 },
    { value: "blackout", label: "Blackout", price: 12.00 },
    { value: "thermal", label: "Thermal", price: 15.00 }
  ];

  // Get heading options from template or use defaults
  const headingOptions = matchingTemplate?.components?.heading_options || [
    { value: "Pencil Pleat", label: "Pencil Pleat", fullness: 2.0, price: 15 },
    { value: "Eyelet", label: "Eyelet", fullness: 2.2, price: 18 },
    { value: "Tab Top", label: "Tab Top", fullness: 1.8, price: 12 },
    { value: "Pinch Pleat", label: "Pinch Pleat", fullness: 2.5, price: 25 }
  ];

  // Update treatment name when template changes
  useEffect(() => {
    if (matchingTemplate) {
      setFormData(prev => ({
        ...prev,
        treatmentName: matchingTemplate.name,
        // Apply template-specific defaults if available
        laborRate: matchingTemplate.calculation_rules?.labor_rate || 45,
        markupPercentage: matchingTemplate.calculation_rules?.markup_percentage || 40
      }));
    }
  }, [matchingTemplate]);

  // Calculate enhanced breakdown
  useEffect(() => {
    if (formData.railWidth && formData.curtainDrop && formData.fabricWidth && formData.fabricPricePerYard) {
      const calc = calculateTotalPrice(formData);
      setCalculation(calc);

      // Enhanced calculations matching your screenshot
      const railWidth = parseFloat(formData.railWidth);
      const curtainDrop = parseFloat(formData.curtainDrop);
      const pooling = parseFloat(formData.curtainPooling) || 0;
      const fabricWidth = parseFloat(formData.fabricWidth);
      const fullness = parseFloat(formData.headingFullness);
      const quantity = formData.quantity;
      
      // Use template-specific calculation method if available
      const calculationMethod = matchingTemplate?.calculation_method || 'standard';
      
      // Fabric requirements
      const totalWidth = railWidth * fullness;
      const dropsPerWidth = Math.floor(fabricWidth / (totalWidth / quantity));
      const widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
      const fabricLength = curtainDrop + pooling + 25; // Including allowances
      const totalFabricCm = widthsRequired * fabricLength;
      
      // Pricing calculations
      const fabricPricePerCm = parseFloat(formData.fabricPricePerYard) / 91.44; // Convert yard to cm
      const fabricPrice = totalFabricCm * fabricPricePerCm;
      
      const liningOption = liningOptions.find(l => l.label === formData.lining);
      const liningPrice = liningOption ? liningOption.price * (totalFabricCm / 100) : 0; // Per meter
      
      const manufacturingPrice = railWidth * 3.95; // Base manufacturing cost per cm
      
      // Leftovers calculation
      const usedWidth = (totalWidth / quantity) * quantity;
      const leftoverWidth = fabricWidth - (usedWidth % fabricWidth);
      const leftoverLength = fabricLength - curtainDrop;
      
      setCalculationBreakdown({
        fabricAmount: `${totalFabricCm} cm`,
        curtainWidthTotal: `${dropsPerWidth} Drops (${(dropsPerWidth * 0.75).toFixed(2)})`,
        fabricDropRequirements: `${fabricLength} cm`,
        fabricWidthRequirements: `${totalFabricCm} cm`,
        liningPrice: liningPrice,
        manufacturingPrice: manufacturingPrice,
        fabricPrice: fabricPrice,
        leftoversVertical: `${leftoverLength.toFixed(2)} cm`,
        leftoversHorizontal: `${leftoverWidth.toFixed(2)} cm`
      });
    }
  }, [formData, matchingTemplate, liningOptions]);

  const handleFabricSelect = (fabricName: string) => {
    // This would integrate with your actual fabric library
    console.log('Fabric selected:', fabricName);
  };

  const handleHeadingChange = (headingValue: string) => {
    const heading = headingOptions.find(h => h.value === headingValue);
    if (heading) {
      setFormData(prev => ({
        ...prev,
        headingStyle: heading.value,
        headingFullness: heading.fullness.toString()
      }));
    }
  };

  const handleSave = () => {
    if (!calculation) return;

    const treatmentData = {
      treatment_name: formData.treatmentName,
      treatment_type: treatmentType,
      template_id: matchingTemplate?.id,
      quantity: formData.quantity,
      measurements: {
        rail_width: formData.railWidth,
        curtain_drop: formData.curtainDrop,
        pooling: formData.curtainPooling,
        return_depth: formData.returnDepth
      },
      fabric_details: {
        name: formData.fabricName,
        width: formData.fabricWidth,
        price_per_yard: formData.fabricPricePerYard,
        vertical_repeat: formData.verticalRepeat,
        horizontal_repeat: formData.horizontalRepeat,
        orientation: fabricOrientation
      },
      options: {
        heading_style: formData.headingStyle,
        fullness: formData.headingFullness,
        lining: formData.lining,
        hardware: formData.hardware
      },
      pricing: {
        fabric_cost: calculation.fabricCost,
        labor_cost: calculation.laborCost,
        features_cost: calculation.featuresCost,
        subtotal: calculation.subtotal,
        total: calculation.total,
        unit_price: calculation.total / formData.quantity
      },
      calculation_breakdown: calculationBreakdown,
      calculation_details: calculation.details,
      template_used: matchingTemplate
    };

    onSave(treatmentData);
    onClose();
  };

  // Show loading state
  if (templatesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <div className="text-center py-8">Loading template configuration...</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error if no matching template found
  if (!matchingTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Template Not Found
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No template found for "{treatmentType}". Please create a product template with this exact name in Settings > Product Templates.
              {templates && templates.length > 0 && (
                <div className="mt-2">
                  Available templates: {templates.filter(t => t.active).map(t => t.name).join(', ')}
                </div>
              )}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {matchingTemplate.name} Calculator
            <Badge variant="outline">{matchingTemplate.calculation_method}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Template Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Template: {matchingTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">{matchingTemplate.product_type}</Badge>
                  <Badge variant="outline">{matchingTemplate.calculation_method}</Badge>
                  {matchingTemplate.description && (
                    <p className="text-sm text-muted-foreground">{matchingTemplate.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Treatment Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Treatment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Treatment name</Label>
                  <Input
                    value={formData.treatmentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatmentName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <div className="text-xl font-bold text-green-600">
                    {calculation ? formatCurrency(calculation.total) : formatCurrency(0)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curtain Configuration */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-end justify-center p-2">
                    <div className="w-full h-32 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm relative">
                      <div className="absolute top-0 w-full h-4 bg-gray-500 rounded-t-sm"></div>
                      <div className="absolute bottom-0 w-full h-2 bg-gray-600"></div>
                    </div>
                  </div>
                </div>
                
                <RadioGroup value={formData.quantity === 1 ? "single" : "pair"} onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: value === "single" ? 1 : 2 }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pair" id="pair" />
                    <Label htmlFor="pair">Pair</Label>
                  </div>
                </RadioGroup>

                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit treatment hems
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add hardware
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select lining</Label>
                  <Select value={formData.lining} onValueChange={(value) => setFormData(prev => ({ ...prev, lining: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {liningOptions.map((option, index) => (
                        <SelectItem key={option.value || index} value={option.label}>
                          {option.label} {option.price > 0 && `(+${formatCurrency(option.price)}/m)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Select curtain heading style</Label>
                  <Select value={formData.headingStyle} onValueChange={handleHeadingChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {headingOptions.map((option, index) => (
                        <SelectItem key={option.value || index} value={option.value}>
                          {option.label} (Fullness: {option.fullness}:1)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Optional Enhancements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Optional Enhancements</CardTitle>
                <Badge variant="outline">From Template</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {matchingTemplate.components?.features ? 
                    "Available features from your template configuration:" :
                    "No additional features configured for this template."
                  }
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>

            {/* Heading Fullness */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{formData.headingStyle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Heading fullness</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.headingFullness}
                    onChange={(e) => setFormData(prev => ({ ...prev, headingFullness: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Measurements and Calculations */}
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
                    <div className="flex">
                      <Input
                        type="number"
                        value={formData.railWidth}
                        onChange={(e) => setFormData(prev => ({ ...prev, railWidth: e.target.value }))}
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r text-sm text-gray-600">cm</div>
                    </div>
                  </div>
                  <div>
                    <Label>Curtain drop</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={formData.curtainDrop}
                        onChange={(e) => setFormData(prev => ({ ...prev, curtainDrop: e.target.value }))}
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r text-sm text-gray-600">cm</div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Curtain pooling</Label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={formData.curtainPooling}
                      onChange={(e) => setFormData(prev => ({ ...prev, curtainPooling: e.target.value }))}
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r text-sm text-gray-600">cm</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fabric Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fabric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FabricSelector
                  selectedFabricId={formData.selectedFabric?.id}
                  onSelectFabric={(fabricId, fabric) => {
                    console.log('Fabric selected in calculator:', fabric);
                    setFormData(prev => ({
                      ...prev,
                      selectedFabric: fabric,
                      fabricName: fabric.name || fabric.fabricName || prev.fabricName,
                      fabricWidth: fabric.width ? fabric.width.toString() : prev.fabricWidth,
                      fabricPricePerYard: fabric.cost_per_unit ? fabric.cost_per_unit.toString() : fabric.pricePerUnit ? fabric.pricePerUnit.toString() : prev.fabricPricePerYard,
                      verticalRepeat: fabric.verticalRepeat ? fabric.verticalRepeat.toString() : "0",
                      horizontalRepeat: fabric.horizontalRepeat ? fabric.horizontalRepeat.toString() : "0"
                    }));
                    
                    // Set the fabric orientation from the selected fabric
                    if (fabric.rotation) {
                      setFabricOrientation(fabric.rotation);
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Calculation Results */}
            {calculationBreakdown && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Calculation results ({matchingTemplate.name})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Fabric amount", value: calculationBreakdown.fabricAmount },
                    { label: "Curtain width total", value: calculationBreakdown.curtainWidthTotal },
                    { label: "Fabric drop requirements", value: calculationBreakdown.fabricDropRequirements },
                    { label: "Fabric width requirements", value: calculationBreakdown.fabricWidthRequirements },
                    { label: "Lining price", value: formatCurrency(calculationBreakdown.liningPrice) },
                    { label: "Manufacturing price", value: formatCurrency(calculationBreakdown.manufacturingPrice) },
                    { label: "Fabric price", value: formatCurrency(calculationBreakdown.fabricPrice) },
                    { label: "Leftovers-Vertical", value: calculationBreakdown.leftoversVertical },
                    { label: "Leftovers-Horizontal", value: calculationBreakdown.leftoversHorizontal }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.value}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Calculation details for {item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="dont-update-price" 
                      checked={dontUpdateTotalPrice}
                      onCheckedChange={(checked) => setDontUpdateTotalPrice(checked === true)}
                    />
                    <Label htmlFor="dont-update-price" className="text-sm">
                      Don't update the total price
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {calculation ? formatCurrency(calculation.total) : "$0.00"}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!calculation}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
