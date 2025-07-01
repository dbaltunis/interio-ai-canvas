import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useUploadFile } from "@/hooks/useFileStorage";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { TreatmentMeasurementsCard } from "./treatment-pricing/TreatmentMeasurementsCard";
import { TreatmentOptionsCard } from "./treatment-pricing/TreatmentOptionsCard";
import { WindowCoveringOptionsCard } from "./treatment-pricing/WindowCoveringOptionsCard";
import { FabricDetailsCard } from "./treatment-pricing/FabricDetailsCard";
import { ImageUploadCard } from "./treatment-pricing/ImageUploadCard";
import { CostSummaryCard } from "./treatment-pricing/CostSummaryCard";
import { useFabricCalculation } from "./treatment-pricing/useFabricCalculation";
import { useTreatmentFormData } from "./treatment-pricing/useTreatmentFormData";

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

  const costs = calculateCosts();

  // Debug logging for options
  console.log('Treatment Type:', treatmentType);
  console.log('Treatment Types Data:', treatmentTypesData);
  console.log('Window Covering:', windowCovering);
  console.log('Window Covering Options:', options);
  console.log('Selected Options:', formData.selected_options);

  // Auto-select required and default options when window covering changes
  useEffect(() => {
    if (windowCovering && options && options.length > 0) {
      const autoSelectOptions = options
        .filter(option => option.is_required || option.is_default)
        .map(option => option.id);
      
      if (autoSelectOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          selected_options: [...new Set([...prev.selected_options, ...autoSelectOptions])]
        }));
      }
    }
  }, [windowCovering, options, setFormData]);

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
      status: "planned"
    };

    onSave(treatmentData);
    onClose();
    resetForm();
  };

  const handleOptionToggle = (optionId: string) => {
    console.log('Toggling option:', optionId);
    console.log('Current selected options:', formData.selected_options);
    
    setFormData(prev => ({
      ...prev,
      selected_options: prev.selected_options.includes(optionId)
        ? prev.selected_options.filter(id => id !== optionId)
        : [...prev.selected_options, optionId]
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

          <TreatmentMeasurementsCard formData={formData} onInputChange={handleInputChange} />

          <TreatmentOptionsCard 
            treatmentTypesData={treatmentTypesData}
            treatmentTypesLoading={treatmentTypesLoading}
            treatmentType={treatmentType}
            selectedOptions={formData.selected_options}
            onOptionToggle={handleOptionToggle}
          />

          <WindowCoveringOptionsCard
            options={options}
            optionsLoading={optionsLoading}
            windowCovering={windowCovering}
            selectedOptions={formData.selected_options}
            onOptionToggle={handleOptionToggle}
          />

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
          <div className="space-y-2">
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
