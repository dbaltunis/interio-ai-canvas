import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useUploadFile } from "@/hooks/useFileStorage";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { TreatmentOptionsCard } from "./treatment-pricing/TreatmentOptionsCard";
import { WindowCoveringOptionsCard } from "./treatment-pricing/WindowCoveringOptionsCard";
import { FabricDetailsCard } from "./treatment-pricing/FabricDetailsCard";
import { ImageUploadCard } from "./treatment-pricing/ImageUploadCard";
import { CostSummaryCard } from "./treatment-pricing/CostSummaryCard";
import { TreatmentMeasurementsCard } from "./treatment-pricing/TreatmentMeasurementsCard";
import { TreatmentPricingHeader } from "./treatment-pricing/TreatmentPricingHeader";
import { TreatmentQuantityField } from "./treatment-pricing/TreatmentQuantityField";
import { TreatmentNotesField } from "./treatment-pricing/TreatmentNotesField";
import { TreatmentFormActions } from "./treatment-pricing/TreatmentFormActions";
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
  const { options, hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(windowCovering?.id);
  const { data: treatmentTypesData, isLoading: treatmentTypesLoading } = useTreatmentTypes();
  const uploadFile = useUploadFile();
  const { calculateFabricUsage, calculateCosts } = useFabricCalculation(formData, options, treatmentTypesData, treatmentType);

  const costs = calculateCosts();

  // Enhanced debugging for options loading
  console.log('=== TreatmentPricingForm Debug ===');
  console.log('Treatment Type:', treatmentType);
  console.log('Surface Type:', surfaceType);
  console.log('Window Covering:', windowCovering);
  console.log('Window Covering ID:', windowCovering?.id);
  console.log('Options Loading:', optionsLoading);
  console.log('Traditional Options Data:', options);
  console.log('Hierarchical Options Data:', hierarchicalOptions);
  console.log('Selected Options:', formData.selected_options);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Configure {treatmentType} for {surfaceType === 'wall' ? 'Wall' : 'Window'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <TreatmentPricingHeader
            productName={formData.product_name}
            onNameChange={(name) => handleInputChange("product_name", name)}
            windowCovering={windowCovering}
          />

          <TreatmentQuantityField
            quantity={formData.quantity}
            onQuantityChange={(quantity) => handleInputChange("quantity", quantity)}
          />

          <TreatmentMeasurementsCard
            formData={formData}
            onInputChange={handleInputChange}
          />

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
              hierarchicalOptions={hierarchicalOptions}
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

          <TreatmentNotesField
            notes={formData.notes}
            onNotesChange={(notes) => handleInputChange("notes", notes)}
          />

          <CostSummaryCard costs={costs} treatmentType={treatmentType} />

          <TreatmentFormActions onCancel={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
};
