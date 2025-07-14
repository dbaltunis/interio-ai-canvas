
import React, { useState, useEffect, useCallback } from "react";
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
import { useHeadingOptions } from '@/hooks/useHeadingOptions';
import { useHardwareOptions } from '@/hooks/useComponentOptions';
import { useServiceOptions } from '@/hooks/useServiceOptions';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { HemEditDialog } from './HemEditDialog';

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
  const { data: allHeadingOptions } = useHeadingOptions();
  const { data: hardwareOptions = [] } = useHardwareOptions();
  const { data: serviceOptions = [] } = useServiceOptions();
  const { data: businessSettings } = useBusinessSettings();
  
  // Find matching template for the treatment type
  const matchingTemplate = templates?.find(template => {
    const templateName = template.name?.toLowerCase()?.trim();
    const searchType = treatmentType?.toLowerCase()?.trim();
    console.log('Comparing template:', templateName, 'with treatment type:', searchType);
    return templateName === searchType && template.active;
  });

  console.log('=== TEMPLATE DEBUG ===');
  console.log('Treatment Type:', treatmentType);
  console.log('Available Templates:', templates?.map(t => ({ name: t.name, active: t.active })));
  console.log('Matching Template:', matchingTemplate);
  console.log('Template Components:', matchingTemplate?.components);
  
  // Debug template component selections
  if (matchingTemplate?.components) {
    console.log('=== TEMPLATE COMPONENT ANALYSIS ===');
    Object.entries(matchingTemplate.components).forEach(([componentType, selections]) => {
      console.log(`${componentType.toUpperCase()}:`, selections);
      if (Array.isArray(selections) && selections.length > 0) {
        console.log(`  -> Selected ${componentType}: ${selections.length} items`);
        selections.forEach((selection, index) => {
          console.log(`    ${index + 1}. ID: ${selection.id}, Name: ${selection.name || 'N/A'}`);
        });
      } else {
        console.log(`  -> No ${componentType} selected`);
      }
    });
    console.log('=== END COMPONENT ANALYSIS ===');
  }

  const [formData, setFormData] = useState<TreatmentFormData>({
    treatmentName: `${treatmentType} Treatment`,
    quantity: 1,
    windowPosition: "",
    windowType: "",
    headingStyle: "Pencil Pleat",
    headingFullness: "2",
    lining: "Lined",
    mounting: "",
    railWidth: "0", // Start with 0 as requested
    curtainDrop: "0", // Start with 0 as requested
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
    laborRate: businessSettings?.labor_rate || 45,
    markupPercentage: businessSettings?.default_markup || 40
  });

  const [fabricOrientation, setFabricOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [isManualFabric, setIsManualFabric] = useState(true);
  const [dontUpdateTotalPrice, setDontUpdateTotalPrice] = useState(false);
  const [calculation, setCalculation] = useState<(CalculationResult & { details: DetailedCalculation }) | null>(null);
  const [calculationBreakdown, setCalculationBreakdown] = useState<CalculationBreakdown | null>(null);
  const [isHemDialogOpen, setIsHemDialogOpen] = useState(false);
  const [hemConfig, setHemConfig] = useState({
    header_hem: "15",
    bottom_hem: "10",
    side_hem: "5", 
    seam_hem: "3"
  });

  // Auto-save functionality
  const storageKey = `treatment-draft-${treatmentType}`;
  
  // Apply template data when dialog opens
  useEffect(() => {
    if (isOpen && matchingTemplate) {
      // Clear any existing draft and start fresh
      localStorage.removeItem(storageKey);
      
      console.log('=== APPLYING TEMPLATE DATA ===');
      console.log('Template:', matchingTemplate);
      console.log('Template Components:', matchingTemplate.components);
      console.log('Template Calculation Rules:', matchingTemplate.calculation_rules);
      
      // Get default selections from template
      const templateHeadings = matchingTemplate.components?.headings || {};
      const templateHardware = matchingTemplate.components?.hardware || {};
      const templateLining = matchingTemplate.components?.lining || {};
      
      // Find first selected option for each component type
      const defaultHeading = Object.keys(templateHeadings).find(id => templateHeadings[id]) || "";
      const defaultHardware = Object.keys(templateHardware).find(id => templateHardware[id]) || "";
      const defaultLining = Object.keys(templateLining).find(id => templateLining[id]) || "";
      
      // Reset to default form data with template values applied
      setFormData({
        treatmentName: `${treatmentType} Treatment`,
        quantity: 1,
        windowPosition: "",
        windowType: "",
        headingStyle: defaultHeading,
        headingFullness: "2",
        lining: defaultLining,
        mounting: "",
        railWidth: "0", // Start with 0 as requested
        curtainDrop: "0", // Start with 0 as requested
        curtainPooling: "0",
        returnDepth: "8",
        fabricMode: "manual",
        selectedFabric: null,
        fabricName: "Sky Gray 01",
        fabricWidth: "140", // Default fabric width
        fabricPricePerYard: "18.7",
        verticalRepeat: "0",
        horizontalRepeat: "0",
        hardware: defaultHardware,
        hardwareFinish: "",
        additionalFeatures: [],
        laborRate: businessSettings?.labor_rate || 45,
        markupPercentage: businessSettings?.default_markup || 40
      });
      
      // Reset other state
      setHemConfig({
        header_hem: "15",
        bottom_hem: "10",
        side_hem: "5", 
        seam_hem: "3"
      });
      setFabricOrientation("vertical");
      setIsManualFabric(true);
      setDontUpdateTotalPrice(false);
      setCalculation(null);
      setCalculationBreakdown(null);
    } else if (isOpen && !matchingTemplate) {
      // No template found, use defaults
      localStorage.removeItem(storageKey);
      
      setFormData({
        treatmentName: `${treatmentType} Treatment`,
        quantity: 1,
        windowPosition: "",
        windowType: "",
        headingStyle: "",
        headingFullness: "2",
        lining: "",
        mounting: "",
        railWidth: "0",
        curtainDrop: "0",
        curtainPooling: "0",
        returnDepth: "8",
        fabricMode: "manual",
        selectedFabric: null,
        fabricName: "Sky Gray 01",
        fabricWidth: "140",
        fabricPricePerYard: "18.7",
        verticalRepeat: "0",
        horizontalRepeat: "0",
        hardware: "",
        hardwareFinish: "",
        additionalFeatures: [],
        laborRate: businessSettings?.labor_rate || 45,
        markupPercentage: businessSettings?.default_markup || 40
      });
      
      setHemConfig({
        header_hem: "15",
        bottom_hem: "10",
        side_hem: "5", 
        seam_hem: "3"
      });
      setFabricOrientation("vertical");
      setIsManualFabric(true);
      setDontUpdateTotalPrice(false);
      setCalculation(null);
      setCalculationBreakdown(null);
    }
  }, [isOpen, storageKey, businessSettings, matchingTemplate, treatmentType]);

  // Auto-save form data when it changes
  const autoSave = useCallback(() => {
    if (!isOpen) return;
    
    const draftData = {
      formData,
      hemConfig,
      fabricOrientation,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(draftData));
    console.log('Auto-saved draft for:', treatmentType);
  }, [formData, hemConfig, fabricOrientation, isOpen, storageKey, treatmentType]);

  // Auto-save after changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(autoSave, 1000); // Save after 1 second of inactivity
    return () => clearTimeout(timeoutId);
  }, [autoSave]);

  // Clear draft when successfully saved
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    console.log('Cleared draft for:', treatmentType);
  }, [storageKey, treatmentType]);

  // Get actual lining options based on template's lining component IDs
  const liningOptions = React.useMemo(() => {
    const templateLiningIds = matchingTemplate?.components?.lining ? 
      Object.keys(matchingTemplate.components.lining).filter(
        id => matchingTemplate.components.lining[id] === true
      ) : [];
    
    // If template has no lining IDs specified, show default options
    const options = templateLiningIds.length > 0 
      ? templateLiningIds.map(id => ({
          value: id,
          label: 'Lining',
          price: 10
        }))
      : [
          { value: 'standard', label: 'Standard Lining', price: 25 },
          { value: 'blackout', label: 'Blackout Lining', price: 35 },
          { value: 'thermal', label: 'Thermal Lining', price: 45 }
        ];
      
    console.log('=== LINING OPTIONS DEBUG ===');
    console.log('Template Lining IDs:', templateLiningIds);
    console.log('Generated Lining Options:', options);
    
    return options;
  }, [matchingTemplate]);

  // Get actual heading options based on template's headings component IDs
  const headingOptions = React.useMemo(() => {
    if (!allHeadingOptions) {
      console.log('=== NO HEADING DATA AVAILABLE ===');
      return [];
    }
    
    const templateHeadingIds = matchingTemplate?.components?.headings ? 
      Object.keys(matchingTemplate.components.headings).filter(
        id => matchingTemplate.components.headings[id] === true
      ) : [];
    
    // If template has no heading IDs specified, show ALL available heading options
    const options = templateHeadingIds.length > 0
      ? allHeadingOptions
          .filter(option => templateHeadingIds.includes(option.id))
          .map(option => ({
            value: option.name,
            label: option.name,
            fullness: option.fullness,
            price: option.price
          }))
      : allHeadingOptions.map(option => ({
          value: option.name,
          label: option.name,
          fullness: option.fullness,
          price: option.price
        }));
      
    console.log('=== HEADING OPTIONS DEBUG ===');
    console.log('Template Heading IDs:', templateHeadingIds);
    console.log('All Heading Options:', allHeadingOptions);
    console.log('Filtered Heading Options:', options);
    
    return options;
  }, [matchingTemplate, allHeadingOptions]);

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

  // Calculate enhanced breakdown with detailed explanations
  useEffect(() => {
    if (formData.railWidth && formData.curtainDrop && formData.fabricWidth && formData.fabricPricePerYard) {
      const calc = calculateTotalPrice(formData, matchingTemplate);
      setCalculation(calc);

      // Enhanced calculations with proper logic
      const railWidth = parseFloat(formData.railWidth) || 0;
      const curtainDrop = parseFloat(formData.curtainDrop) || 0;
      const pooling = parseFloat(formData.curtainPooling) || 0;
      const fabricWidth = parseFloat(formData.fabricWidth) || 0;
      const fullness = parseFloat(formData.headingFullness) || 2;
      const quantity = formData.quantity || 1;
      
      // Get actual hem values
      const headerHem = parseFloat(hemConfig.header_hem) || 15;
      const bottomHem = parseFloat(hemConfig.bottom_hem) || 10;
      const sideHem = parseFloat(hemConfig.side_hem) || 5;
      const seamHem = parseFloat(hemConfig.seam_hem) || 3;
      
      // Side hems calculation: Single = 2 sides, Pair = 4 sides total
      const totalSideHems = quantity === 1 ? 2 : 4;
      const totalSideHemWidth = totalSideHems * sideHem;
      
      // Width calculations with hems
      const finishedCurtainWidth = railWidth / quantity; // Each curtain's finished width
      const fabricWidthPerCurtain = (finishedCurtainWidth * fullness) + (2 * sideHem); // Include side hems per curtain
      const totalFabricWidthRequired = fabricWidthPerCurtain * quantity; // Total fabric width needed
      
      // Drop calculations - including all hems
      const totalDropRequired = curtainDrop + pooling + headerHem + bottomHem;
      
      // Calculate how many curtain widths fit across fabric width
      const curtainWidthsPerFabricWidth = Math.floor(fabricWidth / fabricWidthPerCurtain);
      
      // Calculate number of fabric lengths needed
      const fabricLengthsNeeded = Math.ceil(quantity / Math.max(curtainWidthsPerFabricWidth, 1));
      
      // Add seam allowances for joined widths
      let totalSeamAllowance = 0;
      if (curtainWidthsPerFabricWidth < quantity) {
        // Calculate seams needed per curtain
        const seamsPerCurtain = Math.ceil(fabricWidthPerCurtain / fabricWidth) - 1;
        totalSeamAllowance = seamsPerCurtain * quantity * seamHem;
      }
      
      // Total fabric amount including seams
      const totalFabricCm = (fabricLengthsNeeded * totalDropRequired) + totalSeamAllowance;
      
      // Manufacturing price - use business settings labor rate
      const laborRate = businessSettings?.labor_rate || 45;
      const railWidthInMeters = railWidth / 100;
      const manufacturingPrice = railWidthInMeters * laborRate; // Labor rate per linear meter
      
      // Fabric pricing
      const fabricPricePerCm = parseFloat(formData.fabricPricePerYard) / 91.44; // Convert yard to cm
      const fabricPrice = totalFabricCm * fabricPricePerCm;
      
      // Lining calculations
      const liningOption = liningOptions.find(l => l.label === formData.lining);
      const liningPrice = liningOption ? liningOption.price * (totalFabricCm / 100) : 0; // Per meter
      
      // Leftovers calculation
      const fabricUsedWidth = fabricWidthPerCurtain * curtainWidthsPerFabricWidth;
      const leftoverHorizontal = fabricWidth - fabricUsedWidth;
      const leftoverVertical = totalDropRequired - curtainDrop - pooling; // Only hem allowances
      
      setCalculationBreakdown({
        fabricAmount: `${totalFabricCm.toFixed(0)} cm`,
        curtainWidthTotal: `${curtainWidthsPerFabricWidth} Drops (${curtainWidthsPerFabricWidth > 0 ? (fabricWidthPerCurtain * curtainWidthsPerFabricWidth / 100).toFixed(2) : '0.00'}m)`,
        fabricDropRequirements: `${totalDropRequired.toFixed(0)} cm`,
        fabricWidthRequirements: `${totalFabricWidthRequired.toFixed(0)} cm`,
        liningPrice: liningPrice,
        manufacturingPrice: manufacturingPrice,
        fabricPrice: fabricPrice,
        leftoversVertical: `${leftoverVertical.toFixed(2)} cm`,
        leftoversHorizontal: `${leftoverHorizontal.toFixed(2)} cm`
      });
    } else {
      // Clear calculations when required fields are empty
      setCalculationBreakdown(null);
    }
  }, [formData, matchingTemplate, liningOptions, hemConfig, businessSettings]);

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

  const handleHemSave = (newHemConfig: typeof hemConfig) => {
    setHemConfig(newHemConfig);
    console.log('Hem configuration updated:', newHemConfig);
    // Recalculate everything with new hem values
    // This will be integrated with your existing fabric calculations
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
        orientation: fabricOrientation,
        color: formData.selectedFabric?.color,
        pattern: formData.selectedFabric?.pattern,
        type: formData.selectedFabric?.type,
        fabric_id: formData.selectedFabric?.id
      },
      options: {
        heading_style: formData.headingStyle,
        fullness: formData.headingFullness,
        lining: formData.lining,
        hardware: formData.hardware
      },
      hem_configuration: hemConfig,
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
    clearDraft(); // Clear the auto-saved draft after successful save
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
              No template found for "{treatmentType}". Please create a product template with this exact name in Settings &gt; Product Templates.
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

                {/* Current Hem Configuration Display - only for curtain types */}
                {matchingTemplate?.product_category === 'curtain' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">Current Hems:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>Header: {hemConfig.header_hem}cm</div>
                      <div>Bottom: {hemConfig.bottom_hem}cm</div>
                      <div>Side: {hemConfig.side_hem}cm</div>
                      <div>Seam: {hemConfig.seam_hem}cm</div>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {/* Show hem edit only for curtains */}
                  {matchingTemplate?.product_category === 'curtain' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setIsHemDialogOpen(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit treatment hems
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add hardware
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template-Based Components */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show Lining options only if template has lining selected */}
                {matchingTemplate?.components?.lining && Object.keys(matchingTemplate.components.lining).length > 0 && (
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
                )}

                {/* Show Heading options only if template has headings selected */}
                {matchingTemplate?.components?.headings && Object.keys(matchingTemplate.components.headings).length > 0 && (
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
                )}

                {/* Heading Fullness - moved here for better UX */}
                <div>
                  <Label>Heading fullness</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.headingFullness}
                    onChange={(e) => setFormData(prev => ({ ...prev, headingFullness: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {formData.headingFullness}:1 ratio
                  </p>
                </div>

                {/* Hardware Options - only show if template has hardware selected */}
                {matchingTemplate?.components?.hardware && Object.keys(matchingTemplate.components.hardware).length > 0 && hardwareOptions.length > 0 && (
                  <div>
                    <Label>Select hardware</Label>
                    <Select value={formData.hardware} onValueChange={(value) => setFormData(prev => ({ ...prev, hardware: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose hardware..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hardwareOptions.filter(option => 
                          Object.keys(matchingTemplate.components.hardware).includes(option.id)
                        ).map((option) => (
                          <SelectItem key={option.id} value={option.name}>
                            {option.name} (+{formatCurrency(option.price)}/{option.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Parts & Accessories with Subcategories */}
                {matchingTemplate?.components?.parts && Object.keys(matchingTemplate.components.parts).length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Parts & Accessories</Label>
                    
                    {/* Headrail Options */}
                    {Object.keys(matchingTemplate.components.parts).includes('3977a2b7-8980-46f9-9010-98e48969d98b') && (
                      <div>
                        <Label className="text-sm">Headrail</Label>
                        <Select 
                          value={formData.selectedParts?.headrail || ''} 
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            selectedParts: { ...prev.selectedParts, headrail: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose headrail type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (+£50.00/meter)</SelectItem>
                            <SelectItem value="motorised">Motorised (+£150.00/meter)</SelectItem>
                            <SelectItem value="remote">Remote (+£0.00/unit)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Chain Side Options */}
                    {Object.keys(matchingTemplate.components.parts).includes('9325895e-089f-4e6b-b091-df71c2a562f9') && (
                      <div>
                        <Label className="text-sm">Chain Side</Label>
                        <Select 
                          value={formData.selectedParts?.chainSide || ''} 
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            selectedParts: { ...prev.selectedParts, chainSide: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose chain side..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left (+£0.00/unit)</SelectItem>
                            <SelectItem value="right">Right (+£0.00/unit)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Service Options with Subcategories */}
                {matchingTemplate?.components?.services && Object.keys(matchingTemplate.components.services).length > 0 && serviceOptions.length > 0 && (
                  <div>
                    <Label>Select services</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="service-fitting"
                          checked={formData.additionalFeatures.some(f => f.name === 'fitting')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                additionalFeatures: [...prev.additionalFeatures, {
                                  id: 'fitting',
                                  name: 'fitting',
                                  price: 50,
                                  selected: true
                                }]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                additionalFeatures: prev.additionalFeatures.filter(f => f.name !== 'fitting')
                              }));
                            }
                          }}
                        />
                        <Label htmlFor="service-fitting" className="text-sm">
                          Fitting (+£50.00/unit)
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="service-installation"
                          checked={formData.additionalFeatures.some(f => f.name === 'installation')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                additionalFeatures: [...prev.additionalFeatures, {
                                  id: 'installation',
                                  name: 'installation',
                                  price: 100,
                                  selected: true
                                }]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                additionalFeatures: prev.additionalFeatures.filter(f => f.name !== 'installation')
                              }));
                            }
                          }}
                        />
                        <Label htmlFor="service-installation" className="text-sm">
                          Installation (+£100.00/unit)
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
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
                             <TooltipContent className="max-w-xs">
                               {item.label === "Fabric amount" && (
                                 <p>Total fabric needed: {calculationBreakdown.fabricAmount}. Calculated as fabric lengths needed × total drop required (including hems).</p>
                               )}
                               {item.label === "Curtain width total" && (
                                 <p>Number of drops that fit across fabric width. Each drop is the finished curtain width × fullness ratio.</p>
                               )}
                               {item.label === "Fabric drop requirements" && (
                                 <p>Total drop needed: curtain drop + pooling + header hem ({hemConfig.header_hem}cm) + bottom hem ({hemConfig.bottom_hem}cm).</p>
                               )}
                               {item.label === "Fabric width requirements" && (
                                 <p>Total fabric width needed: finished width × fullness ({formData.headingFullness}) × quantity ({formData.quantity}).</p>
                               )}
                               {item.label === "Lining price" && (
                                 <p>Lining cost: {liningOptions.find(l => l.label === formData.lining)?.price || 0}/m × fabric amount in meters.</p>
                               )}
                               {item.label === "Manufacturing price" && (
                                 <p>Labor cost: rail width ({formData.railWidth}cm) ÷ 100 × labor rate (${businessSettings?.labor_rate || 45}/linear meter).</p>
                               )}
                               {item.label === "Fabric price" && (
                                 <p>Fabric cost: total fabric amount × price per cm (${formData.fabricPricePerYard}/yard ÷ 91.44cm).</p>
                               )}
                               {item.label === "Leftovers-Vertical" && (
                                 <p>Vertical waste: total drop required - actual curtain drop. Includes hem allowances.</p>
                               )}
                               {item.label === "Leftovers-Horizontal" && (
                                 <p>Horizontal waste: fabric width - used width per drop.</p>
                               )}
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

        {/* Hem Edit Dialog */}
        <HemEditDialog
          isOpen={isHemDialogOpen}
          onClose={() => setIsHemDialogOpen(false)}
          onSave={handleHemSave}
          initialValues={hemConfig}
          treatmentType={treatmentType}
        />
      </DialogContent>
    </Dialog>
  );
};
