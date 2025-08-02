import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurtainTemplates, CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface CurtainCalculationData {
  templateId: string;
  railWidth: number;
  drop: number;
  pooling: 'break' | 'no_pooling' | 'puddle';
  fabricChoice: string;
  headingChoice: string;
  liningChoice: string;
  hardwareChoice: string;
  calculations?: {
    totalFabricRequired: number;
    totalLiningRequired: number;
    makeUpPrice: number;
    fabricCost: number;
    liningCost: number;
    hardwareCost: number;
    totalPrice: number;
  };
}

interface AddCurtainToProjectProps {
  windowId: string;
  projectId: string;
  onClose: () => void;
  onSave: (curtainData: CurtainCalculationData) => void;
}

export const AddCurtainToProject = ({ windowId, projectId, onClose, onSave }: AddCurtainToProjectProps) => {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useCurtainTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<CurtainTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<CurtainCalculationData>>({
    railWidth: 0,
    drop: 0,
    pooling: 'break',
    fabricChoice: '',
    headingChoice: '',
    liningChoice: '',
    hardwareChoice: ''
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        templateId,
        headingChoice: template.heading_name,
        hardwareChoice: template.compatible_hardware[0] || ''
      }));
    }
  };

  const calculateFabricAndPricing = () => {
    if (!selectedTemplate || !formData.railWidth || !formData.drop) {
      return null;
    }

    const template = selectedTemplate;
    const railWidth = formData.railWidth;
    const drop = formData.drop;

    // Calculate fabric width needed based on fullness ratio
    const fabricWidthNeeded = railWidth * template.fullness_ratio;
    
    // Add returns and overlap to the flat finished width
    const returnAllowance = (template.return_left || 7.5) + (template.return_right || 7.5);
    const overlapAllowance = template.curtain_type === 'pair' ? (template.overlap || 10) : 0;
    
    // Add extra fabric if specified
    let extraFabric = 0;
    if (template.extra_fabric_fixed) {
      extraFabric += template.extra_fabric_fixed;
    }
    if (template.extra_fabric_percentage) {
      extraFabric += fabricWidthNeeded * (template.extra_fabric_percentage / 100);
    }
    
    const totalFabricWidth = fabricWidthNeeded + returnAllowance + overlapAllowance + extraFabric;

    // Calculate drop with header and bottom hem allowances
    const headerAllowance = template.header_allowance || 8;
    const bottomHemAllowance = template.bottom_hem || 15;
    
    let totalDrop = drop + headerAllowance + bottomHemAllowance;
    
    // Add pooling allowance
    switch (formData.pooling) {
      case 'puddle':
        totalDrop += 15; // 15cm puddle
        break;
      case 'break':
        totalDrop += 2; // 2cm break
        break;
      default:
        break;
    }

    // Check for railroading possibility
    const standardFabricWidth = template.fabric_width_type === 'wide' ? 280 : 140; // cm
    const canRailroad = template.is_railroadable && 
                       (totalDrop <= standardFabricWidth);

    let totalFabricRequired: number;
    
    if (canRailroad) {
      // Railroaded calculation: cut from fabric width, not length
      const dropsNeeded = Math.ceil(totalFabricWidth / standardFabricWidth);
      totalFabricRequired = (dropsNeeded * totalDrop) / 100; // Convert to meters
    } else {
      // Standard calculation: calculate seams needed if fabric width is not sufficient
      const seamsNeeded = Math.max(0, Math.ceil(totalFabricWidth / standardFabricWidth) - 1);
      const seamAllowance = seamsNeeded * template.seam_hems * 2; // Both sides of seam

      // Calculate total fabric required in meters
      totalFabricRequired = (totalDrop + seamAllowance) / 100; // Convert to meters
    }

    // Apply waste percentage at the very end
    const wastePercent = template.waste_percent || 5;
    totalFabricRequired = totalFabricRequired * (1 + (wastePercent / 100));

    // Calculate lining (typically same as main fabric)
    const totalLiningRequired = template.lining_types.length > 0 ? totalFabricRequired : 0;

    // Calculate make-up pricing based on template pricing type
    let makeUpPrice = 0;
    switch (template.pricing_type) {
      case 'per_metre':
        // Check if height-based pricing is enabled and find the correct rate
        let pricePerMetre = 25; // Default fallback
        
        if (template.uses_height_pricing && template.height_price_ranges) {
          const applicableRange = template.height_price_ranges.find(range => 
            drop >= range.min_height && drop <= range.max_height
          );
          if (applicableRange) {
            pricePerMetre = applicableRange.price;
          }
        } else {
          // Use standard per-metre price from machine_price_per_metre field
          pricePerMetre = template.machine_price_per_metre || template.unit_price || 25;
        }
        
        makeUpPrice = (drop / 100) * pricePerMetre; // Convert cm to metres
        break;
      case 'per_drop':
        // Calculate actual number of drops needed based on fabric width
        const standardFabricWidth = template.fabric_width_type === 'wide' ? 280 : 140;
        const fabricWidthNeeded = railWidth * template.fullness_ratio;
        const dropsRequired = Math.ceil(fabricWidthNeeded / standardFabricWidth);
        
        // Price per drop calculation
        const pricePerDrop = template.machine_price_per_drop || 30;
        makeUpPrice = dropsRequired * pricePerDrop;
        break;
        
      case 'per_panel':
        // Fixed price per panel - doesn't scale with fabric complexity
        const pricePerPanel = template.machine_price_per_panel || 180;
        const panelCount = template.curtain_type === 'pair' ? 2 : 1;
        makeUpPrice = panelCount * pricePerPanel;
        break;
      default:
        makeUpPrice = railWidth * 25; // Default fallback
    }

    // Add heading upcharges
    if (template.heading_upcharge_per_metre) {
      makeUpPrice += railWidth * template.heading_upcharge_per_metre;
    }
    if (template.heading_upcharge_per_curtain) {
      const curtainCount = template.curtain_type === 'pair' ? 2 : 1;
      makeUpPrice += template.heading_upcharge_per_curtain * curtainCount;
    }

    // Add hand-finished upcharge if applicable
    if (template.manufacturing_type === 'hand') {
      if (template.hand_finished_upcharge_fixed) {
        makeUpPrice += template.hand_finished_upcharge_fixed;
      }
      if (template.hand_finished_upcharge_percentage) {
        makeUpPrice += makeUpPrice * (template.hand_finished_upcharge_percentage / 100);
      }
    }

    // Estimate costs (these would typically come from inventory/pricing data)
    const fabricCost = totalFabricRequired * 15; // £15 per meter estimate
    const liningCost = totalLiningRequired * 8; // £8 per meter estimate
    const hardwareCost = railWidth * 12; // £12 per meter estimate

    const totalPrice = makeUpPrice + fabricCost + liningCost + hardwareCost;

    // Add calculation details for better transparency
    let calculationDetails = {};
    if (template.pricing_type === 'per_drop') {
      const dropsRequired = Math.ceil((railWidth * template.fullness_ratio) / (template.fabric_width_type === 'wide' ? 280 : 140));
      calculationDetails = {
        dropsRequired,
        pricePerDrop: template.machine_price_per_drop || 30,
        explanation: `${dropsRequired} drops × £${template.machine_price_per_drop || 30} per drop`
      };
    } else if (template.pricing_type === 'per_panel') {
      const panelCount = template.curtain_type === 'pair' ? 2 : 1;
      calculationDetails = {
        panelCount,
        pricePerPanel: template.machine_price_per_panel || 180,
        explanation: `${panelCount} panel${panelCount > 1 ? 's' : ''} × £${template.machine_price_per_panel || 180} per panel`
      };
    }

    return {
      totalFabricRequired: Math.round(totalFabricRequired * 100) / 100,
      totalLiningRequired: Math.round(totalLiningRequired * 100) / 100,
      makeUpPrice: Math.round(makeUpPrice * 100) / 100,
      fabricCost: Math.round(fabricCost * 100) / 100,
      liningCost: Math.round(liningCost * 100) / 100,
      hardwareCost: Math.round(hardwareCost * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      calculationDetails
    };
  };

  const handleCalculate = () => {
    const calculations = calculateFabricAndPricing();
    if (calculations) {
      setFormData(prev => ({ ...prev, calculations }));
    } else {
      toast({
        title: "Cannot Calculate",
        description: "Please select a template and enter rail width and drop measurements",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (!selectedTemplate || !formData.railWidth || !formData.drop || !formData.calculations) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields and calculate before saving",
        variant: "destructive"
      });
      return;
    }

    const curtainData: CurtainCalculationData = {
      templateId: selectedTemplate.id,
      railWidth: formData.railWidth!,
      drop: formData.drop!,
      pooling: formData.pooling!,
      fabricChoice: formData.fabricChoice!,
      headingChoice: formData.headingChoice!,
      liningChoice: formData.liningChoice!,
      hardwareChoice: formData.hardwareChoice!,
      calculations: formData.calculations
    };

    onSave(curtainData);
    toast({
      title: "Curtain Added",
      description: "Curtain has been successfully added to the project"
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading curtain templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Select Curtain Template</CardTitle>
          <CardDescription>Choose from your configured templates</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a curtain template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} - {template.heading_name} ({template.curtain_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedTemplate && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedTemplate.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{selectedTemplate.curtain_type}</Badge>
                <Badge variant="outline">{selectedTemplate.heading_name}</Badge>
                <Badge variant="outline">Fullness: {selectedTemplate.fullness_ratio}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <>
          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 2: Enter Measurements</CardTitle>
              <CardDescription>Provide rail width and drop measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="railWidth">Rail Width (cm)</Label>
                  <Input
                    id="railWidth"
                    type="number"
                    value={formData.railWidth || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, railWidth: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter rail width"
                  />
                </div>
                <div>
                  <Label htmlFor="drop">Drop (cm)</Label>
                  <Input
                    id="drop"
                    type="number"
                    value={formData.drop || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, drop: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter drop measurement"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 3: Configure Options</CardTitle>
              <CardDescription>Select pooling, fabric, lining, and hardware</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pooling">Pooling</Label>
                <Select value={formData.pooling} onValueChange={(value: any) => setFormData(prev => ({ ...prev, pooling: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pooling option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="break">Break (2cm)</SelectItem>
                    <SelectItem value="no_pooling">No Pooling</SelectItem>
                    <SelectItem value="puddle">Puddle (15cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fabricChoice">Fabric Choice</Label>
                  <Input
                    id="fabricChoice"
                    value={formData.fabricChoice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabricChoice: e.target.value }))}
                    placeholder="Enter fabric selection"
                  />
                </div>
                <div>
                  <Label htmlFor="liningChoice">Lining Choice</Label>
                  <Select value={formData.liningChoice} onValueChange={(value) => setFormData(prev => ({ ...prev, liningChoice: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lining" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Lining</SelectItem>
                      <SelectItem value="standard">Standard Lining</SelectItem>
                      <SelectItem value="blackout">Blackout Lining</SelectItem>
                      <SelectItem value="thermal">Thermal Lining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="hardwareChoice">Hardware Choice</Label>
                <Select value={formData.hardwareChoice} onValueChange={(value) => setFormData(prev => ({ ...prev, hardwareChoice: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hardware" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTemplate.compatible_hardware.map((hardware) => (
                      <SelectItem key={hardware} value={hardware}>
                        {hardware}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button onClick={handleCalculate} className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Fabric & Pricing
            </Button>
          </div>

          {/* Calculations Display */}
          {formData.calculations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 4: Calculations & Pricing</CardTitle>
                <CardDescription>Review the calculated requirements and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Fabric Required:</span>
                    <span className="ml-2">{formData.calculations.totalFabricRequired}m</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Lining Required:</span>
                    <span className="ml-2">{formData.calculations.totalLiningRequired}m</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {(formData.calculations as any).calculationDetails?.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                        {selectedTemplate.pricing_type === 'per_drop' ? '🟫 Drop Calculation' : '🟩 Panel Calculation'}
                      </h5>
                      <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                        {(formData.calculations as any).calculationDetails.explanation}
                      </p>
                      {selectedTemplate.pricing_type === 'per_drop' && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Price scales with fabric complexity
                        </p>
                      )}
                      {selectedTemplate.pricing_type === 'per_panel' && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Fixed price regardless of fabric complexity
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Make-up Cost:</span>
                    <span>£{formData.calculations.makeUpPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fabric Cost:</span>
                    <span>£{formData.calculations.fabricCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lining Cost:</span>
                    <span>£{formData.calculations.liningCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hardware Cost:</span>
                    <span>£{formData.calculations.hardwareCost}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Price:</span>
                    <span>£{formData.calculations.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={!formData.calculations}>
              <Save className="h-4 w-4 mr-2" />
              Add to Project
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};