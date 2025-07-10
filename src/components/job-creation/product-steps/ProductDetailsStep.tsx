import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Package, Settings, Calculator, Save } from "lucide-react";
import { useProductTemplates } from "@/hooks/useProductTemplates";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useHardwareOptions } from "@/hooks/useComponentOptions";
import { useLiningOptions } from "@/hooks/useComponentOptions";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { useToast } from "@/hooks/use-toast";
import { FabricSelector } from "@/components/fabric/FabricSelector";

interface ProductDetailsStepProps {
  product: any;
  selectedRooms: string[];
  existingRooms: any[];
  onNext: () => void;
  onBack: () => void;
  onSave?: (data: any) => void;
}

export const ProductDetailsStep = ({
  product,
  selectedRooms,
  existingRooms,
  onNext,
  onBack
}: ProductDetailsStepProps) => {
  const { templates: productTemplates, isLoading: templatesLoading } = useProductTemplates();
  const { toast } = useToast();
  
  // Option hooks
  const { data: hardwareOptions, isLoading: hardwareLoading } = useHardwareOptions();
  const { data: liningOptions, isLoading: liningLoading } = useLiningOptions();
  const { data: headingOptions, isLoading: headingLoading } = useHeadingOptions();
  const { data: serviceOptions, isLoading: serviceLoading } = useServiceOptions();
  
  const [selectedProductTemplate, setSelectedProductTemplate] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedFabricObject, setSelectedFabricObject] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({
    hardware: [],
    lining: [],
    headings: [],
    services: []
  });
  const [measurements, setMeasurements] = useState({
    width: '',
    height: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  const { hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(selectedProductTemplate);
  
  const [productDetails, setProductDetails] = useState({
    quantity: 1,
    fabric: '',
    color: '',
    measurements: '',
    notes: ''
  });

  // Log the actual data to debug
  useEffect(() => {
    console.log("ProductDetailsStep - productTemplates:", productTemplates);
    console.log("ProductDetailsStep - templatesLoading:", templatesLoading);
    console.log("ProductDetailsStep - active templates:", productTemplates.filter(t => t.active));
  }, [productTemplates, templatesLoading]);

  const getRoomNames = () => {
    return selectedRooms.map(roomId => {
      const room = existingRooms.find(r => r.id === roomId);
      return room?.name || `Room ${roomId}`;
    }).join(', ');
  };

  const handleInputChange = (field: string, value: string | number) => {
    setProductDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFabricSelect = (fabricId: string, fabric: any) => {
    setSelectedFabric(fabricId);
    setSelectedFabricObject(fabric);
  };

  const handleOptionToggle = (category: string, optionId: string, option: any) => {
    setSelectedOptions(prev => {
      const categoryOptions = prev[category] || [];
      const isSelected = categoryOptions.some((opt: any) => opt.id === optionId);
      
      if (isSelected) {
        return {
          ...prev,
          [category]: categoryOptions.filter((opt: any) => opt.id !== optionId)
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryOptions, option]
        };
      }
    });
  };

  const calculateOptionsTotal = () => {
    let total = 0;
    Object.values(selectedOptions).forEach((options: any) => {
      if (Array.isArray(options)) {
        options.forEach((option: any) => {
          total += option.price || 0;
        });
      }
    });
    return total;
  };

  const handleSaveData = () => {
    const saveData = {
      product,
      selectedRooms,
      selectedProductTemplate,
      selectedFabric,
      selectedFabricObject,
      selectedOptions,
      measurements,
      productDetails,
      calculatedPrice: (100 * productDetails.quantity * selectedRooms.length) // Simplified calculation
    };

    console.log("Saving product configuration:", saveData);
    
    toast({
      title: "Configuration Saved",
      description: `${product?.name} configuration saved for ${selectedRooms.length} room(s)`,
    });

    return saveData;
  };

  const getProductSpecificFields = () => {
    switch (product?.id) {
      case 'curtains':
        return [
          { key: 'fabric', label: 'Fabric Type', placeholder: 'Silk, Cotton, Linen...' },
          { key: 'style', label: 'Style', placeholder: 'Panel, Valance, Swag...' },
          { key: 'mounting', label: 'Mounting', placeholder: 'Rod, Track, Rings...' }
        ];
      case 'blinds':
        return [
          { key: 'material', label: 'Material', placeholder: 'Wood, Aluminum, Fabric...' },
          { key: 'operation', label: 'Operation', placeholder: 'Cordless, Motorized, Chain...' },
          { key: 'slat_size', label: 'Slat Size', placeholder: '1", 2", 2.5"...' }
        ];
      case 'wallpaper':
        return [
          { key: 'pattern', label: 'Pattern', placeholder: 'Floral, Geometric, Solid...' },
          { key: 'material', label: 'Material', placeholder: 'Vinyl, Fabric, Paper...' },
          { key: 'coverage', label: 'Coverage', placeholder: 'Full wall, Accent wall...' }
        ];
      case 'services':
        return [
          { key: 'service_type', label: 'Service Type', placeholder: 'Installation, Consultation, Repair...' },
          { key: 'duration', label: 'Estimated Duration', placeholder: '2 hours, Half day...' },
          { key: 'requirements', label: 'Requirements', placeholder: 'Tools, access, preparation...' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Product Details</h3>
        <p className="text-sm text-muted-foreground">
          Configure {product?.name} for your selected rooms
        </p>
      </div>

      {/* Selected Rooms Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-3">
          <Package className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Adding to {selectedRooms.length} room(s)</p>
            <p className="text-sm text-blue-700">{getRoomNames()}</p>
          </div>
        </div>
      </Card>

      {/* Product Template Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <h4 className="font-medium">Product Template Selection</h4>
        </div>
        
        <div className="space-y-2">
          <Label>Select Product Template</Label>
          <Select value={selectedProductTemplate} onValueChange={setSelectedProductTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product template from your settings" />
            </SelectTrigger>
            <SelectContent>
              {templatesLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : productTemplates.filter(t => t.active).length === 0 ? (
                <SelectItem value="none" disabled>No active product templates found</SelectItem>
              ) : (
                productTemplates.filter(t => t.active).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.calculation_method}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedProductTemplate && (
          <>
            <Separator />
            
            {/* Fabric Selection */}
            <div className="space-y-2">
              <Label>Select Fabric</Label>
              <FabricSelector
                selectedFabricId={selectedFabric}
                onSelectFabric={handleFabricSelect}
              />
            </div>

            {/* Measurements */}
            <div className="space-y-4">
              <Label>Measurements (cm)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={measurements.width}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, width: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={measurements.height}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Template Components Display */}
            {(() => {
              const template = productTemplates.find(t => t.id === selectedProductTemplate);
              if (!template?.components) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label>Select Template Components</Label>
                    <Badge variant="secondary">
                      Options Total: £{calculateOptionsTotal().toFixed(2)}
                    </Badge>
                  </div>
                  
                  {/* Hardware Options */}
                  {template.components.hardware && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-blue-900">Hardware Options</h5>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-blue-50">
                        {hardwareLoading ? (
                          <p className="text-sm text-muted-foreground">Loading hardware options...</p>
                        ) : hardwareOptions?.filter(option => template.components.hardware[option.id])?.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedOptions.hardware?.some((opt: any) => opt.id === option.id)}
                                onCheckedChange={(checked) => handleOptionToggle('hardware', option.id, option)}
                              />
                              <div>
                                <span className="text-sm font-medium">{option.name}</span>
                                <p className="text-xs text-muted-foreground">{option.unit}</p>
                              </div>
                            </div>
                            <Badge variant="outline">£{option.price}</Badge>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">No hardware options available</p>}
                      </div>
                    </div>
                  )}

                  {/* Lining Options */}
                  {template.components.lining && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-green-900">Lining Options</h5>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-green-50">
                        {liningLoading ? (
                          <p className="text-sm text-muted-foreground">Loading lining options...</p>
                        ) : liningOptions?.filter(option => template.components.lining[option.id])?.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedOptions.lining?.some((opt: any) => opt.id === option.id)}
                                onCheckedChange={(checked) => handleOptionToggle('lining', option.id, option)}
                              />
                              <div>
                                <span className="text-sm font-medium">{option.name}</span>
                                <p className="text-xs text-muted-foreground">{option.unit}</p>
                              </div>
                            </div>
                            <Badge variant="outline">£{option.price}</Badge>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">No lining options available</p>}
                      </div>
                    </div>
                  )}

                  {/* Heading Options */}
                  {template.components.headings && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-purple-900">Heading Styles</h5>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-purple-50">
                        {headingLoading ? (
                          <p className="text-sm text-muted-foreground">Loading heading options...</p>
                        ) : headingOptions?.filter(option => template.components.headings[option.id])?.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedOptions.headings?.some((opt: any) => opt.id === option.id)}
                                onCheckedChange={(checked) => handleOptionToggle('headings', option.id, option)}
                              />
                              <div>
                                <span className="text-sm font-medium">{option.name}</span>
                                <p className="text-xs text-muted-foreground">{option.type} - Fullness: {option.fullness}x</p>
                              </div>
                            </div>
                            <Badge variant="outline">£{option.price}</Badge>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">No heading options available</p>}
                      </div>
                    </div>
                  )}

                  {/* Service Options */}
                  {template.components.services && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-orange-900">Services</h5>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-orange-50">
                        {serviceLoading ? (
                          <p className="text-sm text-muted-foreground">Loading service options...</p>
                        ) : serviceOptions?.filter(option => template.components.services[option.id])?.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedOptions.services?.some((opt: any) => opt.id === option.id)}
                                onCheckedChange={(checked) => handleOptionToggle('services', option.id, option)}
                              />
                              <div>
                                <span className="text-sm font-medium">{option.name}</span>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                            <Badge variant="outline">£{option.price} / {option.unit}</Badge>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">No service options available</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Basic Details */}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity per room</Label>
                <Input
                  type="number"
                  min="1"
                  value={productDetails.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Color/Finish</Label>
                <Input
                  placeholder="Custom finish, trim color..."
                  value={productDetails.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
            </div>

            {/* Price Calculation */}
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-900">Estimated Pricing</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base template:</span>
                  <span>{productTemplates.find(t => t.id === selectedProductTemplate)?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculation method:</span>
                  <span>{productTemplates.find(t => t.id === selectedProductTemplate)?.calculation_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated base cost:</span>
                  <span>£100</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity per room:</span>
                  <span>{productDetails.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of rooms:</span>
                  <span>{selectedRooms.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total estimated cost:</span>
                  <span>£{(100 * productDetails.quantity * selectedRooms.length).toFixed(2)}</span>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  * This is an estimate. Final pricing will include fabric calculations and labor costs.
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label>Additional Notes</Label>
        <Textarea
          placeholder="Special instructions, preferences, client requirements..."
          value={productDetails.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={2}
        />
      </div>

      {/* Summary Card */}
      <Card className="p-4 bg-green-50 border-green-200">
        <h4 className="font-medium text-green-900 mb-2">Summary</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>• {product?.name} × {productDetails.quantity} per room</p>
          <p>• Total items: {productDetails.quantity * selectedRooms.length}</p>
          <p>• Rooms: {selectedRooms.length}</p>
          {productDetails.color && <p>• Color: {productDetails.color}</p>}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveData}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button onClick={() => {
            handleSaveData();
            onNext();
          }}>
            Open Product Canvas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};