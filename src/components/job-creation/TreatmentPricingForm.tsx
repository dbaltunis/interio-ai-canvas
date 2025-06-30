import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Image } from "lucide-react";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useUploadFile } from "@/hooks/useFileStorage";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";

interface TreatmentPricingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
  surfaceType: string;
  windowCovering?: any;
  projectId?: string;
}

export const TreatmentPricingForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType, 
  surfaceType,
  windowCovering,
  projectId
}: TreatmentPricingFormProps) => {
  const [formData, setFormData] = useState({
    product_name: windowCovering?.name || treatmentType,
    rail_width: "",
    drop: "",
    pooling: "0",
    quantity: 1,
    fabric_type: "",
    fabric_code: "",
    fabric_cost_per_yard: "",
    fabric_width: "137", // Default fabric width in cm
    roll_direction: "horizontal", // horizontal or vertical
    selected_options: [] as string[],
    notes: "",
    images: [] as File[]
  });

  const { options, isLoading: optionsLoading } = useWindowCoveringOptions(windowCovering?.id);
  const { data: treatmentTypesData, isLoading: treatmentTypesLoading } = useTreatmentTypes();
  const uploadFile = useUploadFile();
  const { units, formatLength, formatFabric, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();

  // Get the current treatment type data from settings
  const currentTreatmentType = treatmentTypesData?.find(tt => tt.name === treatmentType);
  const treatmentOptions = currentTreatmentType?.specifications?.options || [];

  const calculateFabricUsage = () => {
    const railWidth = parseFloat(formData.rail_width) || 0;
    const drop = parseFloat(formData.drop) || 0;
    const pooling = parseFloat(formData.pooling) || 0;
    const fabricWidth = parseFloat(formData.fabric_width) || 137;
    
    if (railWidth && drop) {
      const totalDrop = drop + pooling;
      const fullnessFactor = 2.5; // Standard fullness for curtains
      
      // Calculate based on roll direction
      let fabricUsage = 0;
      
      if (formData.roll_direction === "horizontal") {
        // Horizontal roll: fabric width runs across the window width
        const requiredWidth = railWidth * fullnessFactor;
        const dropsNeeded = Math.ceil(requiredWidth / fabricWidth);
        
        // Convert to fabric units
        const fabricUnitsPerDrop = units.system === 'metric' 
          ? totalDrop / 100 // convert cm to meters
          : totalDrop / 36; // convert inches to yards
        
        fabricUsage = dropsNeeded * fabricUnitsPerDrop;
      } else {
        // Vertical roll: fabric width runs along the drop
        const requiredWidth = railWidth * fullnessFactor;
        
        // Check if fabric width can accommodate the required width
        if (fabricWidth >= requiredWidth) {
          // Single width can cover the window
          fabricUsage = units.system === 'metric' 
            ? totalDrop / 100 // convert cm to meters
            : totalDrop / 36; // convert inches to yards
        } else {
          // Multiple widths needed
          const widthsNeeded = Math.ceil(requiredWidth / fabricWidth);
          const fabricUnitsPerWidth = units.system === 'metric' 
            ? totalDrop / 100 // convert cm to meters
            : totalDrop / 36; // convert inches to yards
          
          fabricUsage = widthsNeeded * fabricUnitsPerWidth;
        }
      }
      
      return fabricUsage;
    }
    return 0;
  };

  const calculateCosts = () => {
    const fabricUsage = calculateFabricUsage();
    const fabricCostPerUnit = parseFloat(formData.fabric_cost_per_yard) || 0;
    const fabricCost = fabricUsage * fabricCostPerUnit;
    
    // Calculate options cost from window covering options
    const windowCoveringOptionsCost = options
      ?.filter(option => formData.selected_options.includes(option.id))
      .reduce((total, option) => total + option.base_cost, 0) || 0;
    
    // Calculate treatment options cost
    const treatmentOptionsCost = treatmentOptions
      .filter(option => formData.selected_options.includes(option.id || option.name))
      .reduce((total, option) => total + (option.cost || 0), 0);
    
    const totalOptionsCost = windowCoveringOptionsCost + treatmentOptionsCost;
    
    const laborCost = currentTreatmentType?.labor_rate || 150; // Use treatment type labor rate or default
    const totalCost = fabricCost + totalOptionsCost + laborCost;
    
    return {
      fabricUsage: fabricUsage.toFixed(2),
      fabricCost: fabricCost.toFixed(2),
      optionsCost: totalOptionsCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  const costs = calculateCosts();

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Upload images if any
    const uploadedImages = [];
    if (projectId && formData.images.length > 0) {
      for (const image of formData.images) {
        try {
          const uploadedFile = await uploadFile.mutateAsync({
            file: image,
            projectId,
            bucketName: 'project-images'
          });
          uploadedImages.push(uploadedFile);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }
    
    const treatmentData = {
      product_name: formData.product_name,
      treatment_type: treatmentType,
      quantity: formData.quantity,
      material_cost: parseFloat(costs.fabricCost),
      labor_cost: parseFloat(costs.laborCost),
      total_price: parseFloat(costs.totalCost),
      unit_price: parseFloat(costs.totalCost) / formData.quantity,
      measurements: {
        rail_width: formData.rail_width,
        drop: formData.drop,
        pooling: formData.pooling,
        fabric_usage: costs.fabricUsage
      },
      fabric_details: {
        fabric_type: formData.fabric_type,
        fabric_code: formData.fabric_code,
        fabric_cost_per_yard: formData.fabric_cost_per_yard,
        fabric_width: formData.fabric_width,
        roll_direction: formData.roll_direction
      },
      selected_options: formData.selected_options,
      notes: formData.notes,
      images: uploadedImages,
      status: "planned"
    };

    onSave(treatmentData);
    onClose();
    
    // Reset form
    setFormData({
      product_name: windowCovering?.name || treatmentType,
      rail_width: "",
      drop: "",
      pooling: "0",
      quantity: 1,
      fabric_type: "",
      fabric_code: "",
      fabric_cost_per_yard: "",
      fabric_width: "137",
      roll_direction: "horizontal",
      selected_options: [],
      notes: "",
      images: []
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionToggle = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_options: prev.selected_options.includes(optionId)
        ? prev.selected_options.filter(id => id !== optionId)
        : [...prev.selected_options, optionId]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {windowCovering?.image_url && (
              <img 
                src={windowCovering.image_url} 
                alt={windowCovering.name}
                className="w-12 h-12 object-cover rounded-lg border"
              />
            )}
            <span>Configure {treatmentType} for {surfaceType === 'wall' ? 'Wall' : 'Window'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Treatment Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Treatment Name</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => handleInputChange("product_name", e.target.value)}
              placeholder="Enter treatment name"
              required
            />
          </div>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle>Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rail_width">Rail Width ({getLengthUnitLabel()})</Label>
                  <Input
                    id="rail_width"
                    type="number"
                    step="0.25"
                    value={formData.rail_width}
                    onChange={(e) => handleInputChange("rail_width", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drop">Drop ({getLengthUnitLabel()})</Label>
                  <Input
                    id="drop"
                    type="number"
                    step="0.25"
                    value={formData.drop}
                    onChange={(e) => handleInputChange("drop", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pooling">Pooling ({getLengthUnitLabel()})</Label>
                  <Input
                    id="pooling"
                    type="number"
                    step="0.25"
                    value={formData.pooling}
                    onChange={(e) => handleInputChange("pooling", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Options from Settings */}
          {!treatmentTypesLoading && treatmentOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Treatment Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {treatmentOptions.map((option, index) => (
                  <div key={option.id || option.name || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={formData.selected_options.includes(option.id || option.name)}
                        onCheckedChange={() => handleOptionToggle(option.id || option.name)}
                      />
                      <div>
                        <div className="font-medium">{option.name}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600">{option.description}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatCurrency(option.cost || 0)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Window Covering Options */}
          {!optionsLoading && options && options.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Window Covering Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {options.map(option => (
                  <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={formData.selected_options.includes(option.id)}
                        onCheckedChange={() => handleOptionToggle(option.id)}
                      />
                      <div>
                        <div className="font-medium">{option.name}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600">{option.description}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatCurrency(option.base_cost)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Fabric Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Fabric Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fabric_type">Fabric Type</Label>
                  <Input
                    id="fabric_type"
                    value={formData.fabric_type}
                    onChange={(e) => handleInputChange("fabric_type", e.target.value)}
                    placeholder="e.g., Cotton, Linen, Silk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fabric_code">Fabric Code</Label>
                  <Input
                    id="fabric_code"
                    value={formData.fabric_code}
                    onChange={(e) => handleInputChange("fabric_code", e.target.value)}
                    placeholder="Fabric reference code"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fabric_width">Fabric Width ({getLengthUnitLabel()})</Label>
                  <Input
                    id="fabric_width"
                    type="number"
                    step="0.5"
                    value={formData.fabric_width}
                    onChange={(e) => handleInputChange("fabric_width", e.target.value)}
                    placeholder="137"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roll_direction">Roll Direction</Label>
                  <Select value={formData.roll_direction} onValueChange={(value) => handleInputChange("roll_direction", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select roll direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fabric_cost_per_yard">Cost per {getFabricUnitLabel()} ({units.currency})</Label>
                <Input
                  id="fabric_cost_per_yard"
                  type="number"
                  step="0.01"
                  value={formData.fabric_cost_per_yard}
                  onChange={(e) => handleInputChange("fabric_cost_per_yard", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {costs.fabricUsage !== "0.00" && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    Estimated fabric usage: {costs.fabricUsage} {getFabricUnitLabel()}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Based on {formData.fabric_width}{getLengthUnitLabel()} fabric width, {formData.roll_direction} roll direction
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Workroom Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload images for the workroom team
                  </p>
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Special instructions or notes for the workroom..."
            />
          </div>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Fabric Cost:</span>
                <span>{formatCurrency(parseFloat(costs.fabricCost))}</span>
              </div>
              <div className="flex justify-between">
                <span>Options Cost:</span>
                <span>{formatCurrency(parseFloat(costs.optionsCost))}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Cost:</span>
                <span>{formatCurrency(parseFloat(costs.laborCost))}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Cost:</span>
                <span className="text-green-600">{formatCurrency(parseFloat(costs.totalCost))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Treatment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
