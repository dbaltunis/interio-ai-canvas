import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Package, Calculator, Palette } from "lucide-react";
import { useProductTemplates } from "@/hooks/useProductTemplates";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { useHardwareOptions, useLiningOptions } from "@/hooks/useComponentOptions";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailsStepProps {
  product: any;
  selectedRooms: string[];
  existingRooms: any[];
  onNext: () => void;
  onBack: () => void;
  onSave?: (data: any) => void;
}

interface FabricOption {
  id: string;
  name: string;
  width: number;
  pricePerMeter: number;
  patternRepeat?: number;
}

interface CalculationResult {
  fabricAmount: string;
  curtainWidthTotal: string;
  fabricDropRequirements: string;
  fabricWidthRequirements: string;
  liningPrice: number;
  manufacturingPrice: number;
  fabricPrice: number;
  leftoversVertical: string;
  leftoversHorizontal: string;
  totalPrice: number;
}

export const ProductDetailsStep = ({
  product,
  selectedRooms,
  existingRooms,
  onNext,
  onBack,
  onSave
}: ProductDetailsStepProps) => {
  const { templates: productTemplates, isLoading: templatesLoading } = useProductTemplates();
  const { data: headingOptions = [], isLoading: headingLoading } = useHeadingOptions();
  const { data: hardwareOptions = [], isLoading: hardwareLoading } = useHardwareOptions();
  const { data: liningOptions = [], isLoading: liningLoading } = useLiningOptions();
  const { data: serviceOptions = [], isLoading: serviceLoading } = useServiceOptions();
  const { toast } = useToast();
  
  // State
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedFabric, setSelectedFabric] = useState<string>("");
  const [selectedHeading, setSelectedHeading] = useState<string>("");
  const [selectedLining, setSelectedLining] = useState<string>("");
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Measurements
  const [railWidth, setRailWidth] = useState<number>(300);
  const [dropHeight, setDropHeight] = useState<number>(250);
  
  // Fabric options
  const fabricLibrary: FabricOption[] = [
    { id: "1", name: "Premium Cotton", width: 137, pricePerMeter: 25.50, patternRepeat: 0 },
    { id: "2", name: "Luxury Velvet", width: 140, pricePerMeter: 45.00, patternRepeat: 32 },
    { id: "3", name: "Linen Blend", width: 150, pricePerMeter: 35.75, patternRepeat: 0 },
    { id: "4", name: "Silk Dupioni", width: 110, pricePerMeter: 65.00, patternRepeat: 24 }
  ];
  
  const [customFabric, setCustomFabric] = useState<FabricOption>({
    id: "custom",
    name: "Custom Fabric",
    width: 137,
    pricePerMeter: 25.50,
    patternRepeat: 0
  });
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // Get active template
  const activeTemplate = productTemplates.find(t => t.id === selectedTemplate);
  
  // Get available options based on template
  const getAvailableHeadings = () => {
    if (!activeTemplate?.components?.headings) return [];
    return headingOptions.filter(heading => activeTemplate.components.headings[heading.id] === true);
  };
  
  const getAvailableHardware = () => {
    if (!activeTemplate?.components?.hardware) return [];
    return hardwareOptions.filter(hardware => activeTemplate.components.hardware[hardware.id] === true);
  };
  
  const getAvailableLining = () => {
    if (!activeTemplate?.components?.lining) return [];
    return liningOptions.filter(lining => activeTemplate.components.lining[lining.id] === true);
  };
  
  const getAvailableServices = () => {
    if (!activeTemplate?.components?.services) return [];
    return serviceOptions.filter(service => activeTemplate.components.services[service.id] === true);
  };

  const getRoomNames = () => {
    return selectedRooms.map(roomId => {
      const room = existingRooms.find(r => r.id === roomId);
      return room?.name || `Room ${roomId}`;
    }).join(', ');
  };

  const getCurrentFabric = (): FabricOption => {
    if (selectedFabric === "custom") return customFabric;
    return fabricLibrary.find(f => f.id === selectedFabric) || customFabric;
  };

  const calculatePrice = () => {
    if (!activeTemplate || !selectedHeading) {
      toast({
        title: "Missing Information",
        description: "Please select a product template and heading type",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get heading details
      const headingDetails = getAvailableHeadings().find(h => h.id === selectedHeading);
      if (!headingDetails) throw new Error("Invalid heading selection");

      const fullness = headingDetails.fullness;
      const headingPrice = headingDetails.price;

      // Get fabric details
      const fabric = getCurrentFabric();
      
      // Calculate fabric requirements
      const requiredWidth = railWidth * fullness; // Total fabric width needed
      const fabricWidthAvailable = fabric.width;
      
      // Calculate drops and widths
      const dropsPerWidth = Math.floor(fabricWidthAvailable / railWidth);
      const widthsRequired = Math.ceil(requiredWidth / fabricWidthAvailable);
      
      // Pattern repeat considerations
      const patternRepeat = fabric.patternRepeat || 0;
      const adjustedDrop = patternRepeat > 0 
        ? Math.ceil((dropHeight + 20) / patternRepeat) * patternRepeat 
        : dropHeight + 20; // Add 20cm for hems and headings

      // Total fabric needed in cm
      const totalFabricLength = widthsRequired * adjustedDrop;
      const totalFabricMeters = totalFabricLength / 100;

      // Fabric cost calculation
      const fabricCost = totalFabricMeters * fabric.pricePerMeter;

      // Lining cost calculation
      const selectedLiningOption = getAvailableLining().find(l => l.id === selectedLining);
      const liningCost = selectedLiningOption ? (selectedLiningOption.price * totalFabricMeters) : 0;

      // Hardware costs
      const hardwareCost = selectedHardware.reduce((total, hardwareId) => {
        const hardware = getAvailableHardware().find(h => h.id === hardwareId);
        return total + (hardware ? hardware.price * (railWidth / 100) : 0);
      }, 0);

      // Service costs
      const serviceCost = selectedServices.reduce((total, serviceId) => {
        const service = getAvailableServices().find(s => s.id === serviceId);
        return total + (service ? service.price : 0);
      }, 0);

      // Making cost calculation from template
      const calculationRules = activeTemplate.calculation_rules || {};
      const baseMakingCost = calculationRules.baseMakingCost || 0;
      const heightSurcharge = dropHeight > (calculationRules.baseHeightLimit || 240) ? 
        (calculationRules.heightSurcharge1 || 0) : 0;
      
      const makingCost = (baseMakingCost + headingPrice + heightSurcharge) * (railWidth / 100);

      // Calculate leftovers
      const leftoverVertical = adjustedDrop - (dropHeight + 20);
      const leftoverHorizontal = (widthsRequired * fabricWidthAvailable) - requiredWidth;

      // Build results
      const totalPrice = fabricCost + liningCost + makingCost + hardwareCost + serviceCost;

      const results: CalculationResult = {
        fabricAmount: `${totalFabricLength} cm`,
        curtainWidthTotal: `${dropsPerWidth} Drops (${(requiredWidth / railWidth).toFixed(2)})`,
        fabricDropRequirements: `${adjustedDrop} cm`,
        fabricWidthRequirements: `${requiredWidth.toFixed(0)} cm`,
        liningPrice: liningCost,
        manufacturingPrice: makingCost + hardwareCost + serviceCost,
        fabricPrice: fabricCost,
        leftoversVertical: `${leftoverVertical.toFixed(2)} cm`,
        leftoversHorizontal: `${leftoverHorizontal.toFixed(2)} cm`,
        totalPrice
      };

      setCalculationResult(results);
      
      // Save the configuration
      if (onSave) {
        onSave({
          template: activeTemplate,
          fabric: fabric,
          heading: headingDetails,
          measurements: { railWidth, dropHeight },
          selectedOptions: {
            lining: selectedLining,
            hardware: selectedHardware,
            services: selectedServices
          },
          calculation: results
        });
      }
      
      toast({
        title: "Calculation Complete",
        description: `Total price: £${totalPrice.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate requirements",
        variant: "destructive"
      });
    }
  };

  // Auto-calculate when key values change
  useEffect(() => {
    if (selectedTemplate && selectedHeading && railWidth && dropHeight) {
      calculatePrice();
    }
  }, [selectedTemplate, selectedHeading, selectedFabric, selectedLining, railWidth, dropHeight, selectedHardware, selectedServices]);

  if (templatesLoading || headingLoading) {
    return <div className="p-8 text-center">Loading templates and options...</div>;
  }

  if (productTemplates.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Product Templates Available</h3>
          <p className="text-gray-600 mb-4">
            You need to create product templates first in Settings → Product Catalog
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configure {product?.name || 'Product'}</h2>
          <p className="text-gray-600">Configure {product?.name || 'product'} for your selected rooms</p>
        </div>
      </div>

      {/* Room Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Package className="h-5 w-5" />
            <span className="font-medium">Adding to {selectedRooms.length} room(s)</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{getRoomNames()}</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Product Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Template Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Select Product Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTemplates.filter(t => t.active).map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.calculation_method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fabric Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Select Fabric
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from library or enter manually" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Enter Custom Fabric</SelectItem>
                    {fabricLibrary.map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.name} - £{fabric.pricePerMeter}/m ({fabric.width}cm wide)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedFabric === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fabric Name</Label>
                    <Input 
                      value={customFabric.name}
                      onChange={(e) => setCustomFabric(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Price per Meter (£)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={customFabric.pricePerMeter}
                      onChange={(e) => setCustomFabric(prev => ({ ...prev, pricePerMeter: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Width (cm)</Label>
                    <Input 
                      type="number"
                      value={customFabric.width}
                      onChange={(e) => setCustomFabric(prev => ({ ...prev, width: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Pattern Repeat (cm)</Label>
                    <Input 
                      type="number"
                      value={customFabric.patternRepeat || 0}
                      onChange={(e) => setCustomFabric(prev => ({ ...prev, patternRepeat: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle>Measurements (cm)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="railWidth">Rail Width</Label>
                  <Input
                    id="railWidth"
                    type="number"
                    value={railWidth}
                    onChange={(e) => setRailWidth(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="dropHeight">Drop/Height</Label>
                  <Input
                    id="dropHeight"
                    type="number"
                    value={dropHeight}
                    onChange={(e) => setDropHeight(Number(e.target.value))}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Fullness ratio will be determined by your heading selection
              </p>
            </CardContent>
          </Card>

          {/* Template Components */}
          {activeTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Select Template Components</CardTitle>
                <div className="ml-auto">
                  <Badge variant="secondary">
                    Options Total: £{calculationResult ? calculationResult.totalPrice.toFixed(2) : '0.00'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Heading Options */}
                {getAvailableHeadings().length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Heading Options</Label>
                    <Select value={selectedHeading} onValueChange={setSelectedHeading}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select heading style" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableHeadings().map((heading) => (
                          <SelectItem key={heading.id} value={heading.id}>
                            {heading.name} (Fullness: {heading.fullness}x, +£{heading.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Lining Options */}
                {getAvailableLining().length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Lining Options</Label>
                    <Select value={selectedLining} onValueChange={setSelectedLining}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select lining" />
                      </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="none">No Lining</SelectItem>
                        {getAvailableLining().map((lining) => (
                          <SelectItem key={lining.id} value={lining.id}>
                            {lining.name} (+£{lining.price}/m)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Hardware Options */}
                {getAvailableHardware().length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Hardware Options</Label>
                    <div className="mt-2 space-y-2">
                      {getAvailableHardware().map((hardware) => (
                        <div key={hardware.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={hardware.id}
                            checked={selectedHardware.includes(hardware.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedHardware(prev => [...prev, hardware.id]);
                              } else {
                                setSelectedHardware(prev => prev.filter(id => id !== hardware.id));
                              }
                            }}
                          />
                          <Label htmlFor={hardware.id} className="flex-1">
                            {hardware.name} (+£{hardware.price}/{hardware.unit})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Options */}
                {getAvailableServices().length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Service Options</Label>
                    <div className="mt-2 space-y-2">
                      {getAvailableServices().map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.id}
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedServices(prev => [...prev, service.id]);
                              } else {
                                setSelectedServices(prev => prev.filter(id => id !== service.id));
                              }
                            }}
                          />
                          <Label htmlFor={service.id} className="flex-1">
                            {service.name} (+£{service.price})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calculation Results */}
        <div className="space-y-6">
          {calculationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculation results ({activeTemplate?.name || 'Product'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Fabric amount", value: calculationResult.fabricAmount },
                  { label: "Curtain width total", value: calculationResult.curtainWidthTotal },
                  { label: "Fabric drop requirements", value: calculationResult.fabricDropRequirements },
                  { label: "Fabric width requirements", value: calculationResult.fabricWidthRequirements },
                  { label: "Lining price", value: `£${calculationResult.liningPrice.toFixed(2)}` },
                  { label: "Manufacturing price", value: `£${calculationResult.manufacturingPrice.toFixed(2)}` },
                  { label: "Fabric price", value: `£${calculationResult.fabricPrice.toFixed(2)}` },
                  { label: "Leftovers-Vertical", value: calculationResult.leftoversVertical },
                  { label: "Leftovers-Horizontal", value: calculationResult.leftoversHorizontal }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span className="text-gray-600">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
                
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Price</span>
                  <span className="text-primary">£{calculationResult.totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!calculationResult && selectedTemplate && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select your options and measurements to see the calculation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!calculationResult}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};