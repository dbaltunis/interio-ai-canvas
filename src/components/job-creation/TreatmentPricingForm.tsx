
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useUploadFile } from "@/hooks/useFileStorage";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { TreatmentOptionsCard } from "./treatment-pricing/TreatmentOptionsCard";
import { WindowCoveringOptionsCard } from "./treatment-pricing/WindowCoveringOptionsCard";
import { FabricDetailsCard } from "./treatment-pricing/FabricDetailsCard";
import { ImageUploadCard } from "./treatment-pricing/ImageUploadCard";
import { CostSummaryCard } from "./treatment-pricing/CostSummaryCard";
import { useFabricCalculation } from "./treatment-pricing/useFabricCalculation";
import { useTreatmentFormData } from "./treatment-pricing/useTreatmentFormData";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

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
  const { formData, setFormData, handleInputChange, resetForm } = useTreatmentFormData(treatmentType, windowCovering);
  const { options, isLoading: optionsLoading } = useWindowCoveringOptions(windowCovering?.id);
  const { data: treatmentTypesData, isLoading: treatmentTypesLoading } = useTreatmentTypes();
  const uploadFile = useUploadFile();
  const { calculateFabricUsage, calculateCosts } = useFabricCalculation(formData, options, treatmentTypesData, treatmentType);
  const { getLengthUnitLabel } = useMeasurementUnits();
  const [isEditingName, setIsEditingName] = useState(false);

  const costs = calculateCosts();

  // Enhanced debugging for options loading
  console.log('=== TreatmentPricingForm Debug ===');
  console.log('Treatment Type:', treatmentType);
  console.log('Surface Type:', surfaceType);
  console.log('Window Covering:', windowCovering);
  console.log('Window Covering ID:', windowCovering?.id);
  console.log('Options Loading:', optionsLoading);
  console.log('Options Data:', options);
  console.log('Options Length:', options?.length);
  console.log('Treatment Types Data:', treatmentTypesData);
  console.log('Treatment Types Loading:', treatmentTypesLoading);
  console.log('Selected Options:', formData.selected_options);
  console.log('Form Data:', formData);
  console.log('=== End Debug ===');

  // Auto-select required and default options when window covering changes
  useEffect(() => {
    console.log('useEffect - Auto-selecting required/default options');
    console.log('Window Covering:', windowCovering);
    console.log('Options:', options);
    
    if (windowCovering && options && options.length > 0) {
      const autoSelectOptions = options
        .filter(option => {
          console.log(`Checking option ${option.name}: required=${option.is_required}, default=${option.is_default}`);
          return option.is_required || option.is_default;
        })
        .map(option => option.id);
      
      console.log('Auto-select options:', autoSelectOptions);
      
      if (autoSelectOptions.length > 0) {
        setFormData(prev => {
          const newSelectedOptions = [...new Set([...prev.selected_options, ...autoSelectOptions])];
          console.log('Updating selected options from', prev.selected_options, 'to', newSelectedOptions);
          return {
            ...prev,
            selected_options: newSelectedOptions
          };
        });
      }
    }
  }, [windowCovering, options, setFormData]);

  // Auto-save window covering when dialog opens
  useEffect(() => {
    if (isOpen && windowCovering) {
      console.log('Auto-setting window covering data:', windowCovering);
      setFormData(prev => ({
        ...prev,
        product_name: windowCovering.name || prev.product_name,
        window_covering: windowCovering
      }));
    }
  }, [isOpen, windowCovering, setFormData]);

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
        roll_direction: formData.roll_direction,
        heading_fullness: formData.heading_fullness
      },
      selected_options: formData.selected_options,
      notes: formData.notes,
      images: uploadedImages,
      status: "planned",
      window_covering: windowCovering
    };

    onSave(treatmentData);
    resetForm();
    onClose();
  };

  const handleOptionToggle = (optionId: string) => {
    setFormData(prev => {
      const newSelectedOptions = prev.selected_options.includes(optionId)
        ? prev.selected_options.filter(id => id !== optionId)
        : [...prev.selected_options, optionId];
      
      return {
        ...prev,
        selected_options: newSelectedOptions
      };
    });
  };

  const handleNameSave = () => {
    setIsEditingName(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Configure {treatmentType} for {surfaceType === 'wall' ? 'Wall' : 'Window'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Treatment Name - Editable */}
          <div className="text-center space-y-3">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  value={formData.product_name}
                  onChange={(e) => handleInputChange("product_name", e.target.value)}
                  className="text-center text-lg font-semibold max-w-md"
                  autoFocus
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                />
              </div>
            ) : (
              <h3 
                className="text-lg font-semibold cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {formData.product_name}
              </h3>
            )}
            
            {/* Window Covering Image - Centered and Larger */}
            {windowCovering?.image_url && (
              <div className="flex justify-center">
                <img 
                  src={windowCovering.image_url} 
                  alt={windowCovering.name}
                  className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Measurements - Two Column Layout */}
          <div className="space-y-4">
            <h4 className="font-medium text-center">Measurements</h4>
            <div className="grid grid-cols-2 gap-4 items-center">
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
            <div className="grid grid-cols-2 gap-4 items-center">
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
            <div className="grid grid-cols-2 gap-4 items-center">
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
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label htmlFor="heading_fullness">Heading Fullness</Label>
              <Input
                id="heading_fullness"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.heading_fullness}
                onChange={(e) => handleInputChange("heading_fullness", e.target.value)}
                placeholder="2.5"
              />
            </div>
          </div>

          <TreatmentOptionsCard 
            treatmentTypesData={treatmentTypesData}
            treatmentTypesLoading={treatmentTypesLoading}
            treatmentType={treatmentType}
            selectedOptions={formData.selected_options}
            onOptionToggle={handleOptionToggle}
          />

          {windowCovering && (
            <WindowCoveringOptionsCard
              options={options}
              optionsLoading={optionsLoading}
              windowCovering={windowCovering}
              selectedOptions={formData.selected_options}
              onOptionToggle={handleOptionToggle}
            />
          )}

          <FabricDetailsCard 
            formData={formData} 
            onInputChange={handleInputChange}
            fabricUsage={costs.fabricUsage}
          />

          <ImageUploadCard
            images={formData.images}
            onImageUpload={(files) => setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))}
            onRemoveImage={(index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
          />

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4 items-start">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Special instructions or notes for the workroom..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <CostSummaryCard costs={costs} treatmentType={treatmentType} />

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
