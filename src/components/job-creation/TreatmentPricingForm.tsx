
import React, { useState, useEffect } from "react";
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
// Use NEW unified calculation engine for consistent pricing
import { calculateBlindCosts, isBlindCategory } from "@/components/measurements/dynamic-options/utils/blindCostCalculator";
import { convertLength } from "@/utils/lengthUnits";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface TreatmentPricingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
  surfaceType: string;
  windowCovering?: any;
  projectId?: string;
  existingTreatmentData?: any;
}

export const TreatmentPricingForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType = "Curtains", // Default fallback
  surfaceType = "window", // Default fallback
  windowCovering,
  projectId,
  existingTreatmentData
}: TreatmentPricingFormProps) => {
  const { formData, setFormData, handleInputChange, resetForm } = useTreatmentFormData(treatmentType, windowCovering, existingTreatmentData);
  const { options, hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(windowCovering?.id);
  const { data: treatmentTypesData, isLoading: treatmentTypesLoading } = useTreatmentTypes();
  const { data: businessSettings } = useBusinessSettings();
  const uploadFile = useUploadFile();
  const { calculateFabricUsage, calculateCosts: calculateCurtainCosts } = useFabricCalculation(formData, options, treatmentTypesData, treatmentType, hierarchicalOptions);

  // Get user's preferred measurement unit (default to mm)
  const userUnit = businessSettings?.measurement_unit || 'mm';

  // CRITICAL: Detect treatment category using centralized utility
  const treatmentCategory = windowCovering?.treatment_category || windowCovering?.category || '';
  const isBlindsOrShutters = isBlindCategory(treatmentCategory, treatmentType);

  // Calculate costs using the UNIFIED calculation engine
  const costs = React.useMemo(() => {
    if (isBlindsOrShutters) {
      // CRITICAL: Convert measurements to CM for consistent calculation
      const rawWidth = parseFloat(formData.rail_width) || 0;
      const rawHeight = parseFloat(formData.drop) || 0;

      // Convert from user's unit to CM (the calculation engine expects CM)
      const widthCm = convertLength(rawWidth, userUnit, 'cm');
      const heightCm = convertLength(rawHeight, userUnit, 'cm');

      console.log('🔄 TreatmentPricingForm: Unit conversion', {
        rawWidth, rawHeight,
        userUnit,
        widthCm, heightCm
      });

      // Get selected options with FULL pricing details from hierarchical options
      const selectedOpts = hierarchicalOptions
        .flatMap(category => category.subcategories || [])
        .flatMap(sub => sub.sub_subcategories || [])
        .filter(opt => formData.selected_options.includes(opt.id))
        .map(opt => ({
          name: opt.name,
          price: opt.base_price || 0,
          pricingMethod: opt.pricing_method || 'fixed',
          pricingGridData: opt.pricing_grid_data || null,
          label: opt.label || opt.name
        }));

      // Also include traditional options with their pricing methods
      const traditionalOpts = options
        .filter(opt => formData.selected_options.includes(opt.id))
        .map(opt => ({
          name: opt.name,
          price: opt.base_price || 0,
          pricingMethod: opt.pricing_method || 'fixed',
          pricingGridData: opt.pricing_grid_data || null,
          label: opt.label || opt.name
        }));

      const allOptions = [...selectedOpts, ...traditionalOpts];

      // Create a fabric item with all pricing grid data preserved
      const fabricItem = windowCovering?.fabric_details || {
        name: formData.fabric_type || 'Material',
        unit_price: parseFloat(formData.fabric_cost_per_yard) || 0,
        selling_price: parseFloat(formData.fabric_cost_per_yard) || 0,
        price_per_meter: parseFloat(formData.fabric_cost_per_yard) || 0,
        fabric_width_cm: parseFloat(formData.fabric_width) || 0,
        // Preserve ALL pricing grid data
        pricing_grid_data: windowCovering?.fabric_details?.pricing_grid_data,
        pricing_grid_markup: windowCovering?.fabric_details?.pricing_grid_markup || 0,
        resolved_grid_name: windowCovering?.fabric_details?.resolved_grid_name,
        resolved_grid_code: windowCovering?.fabric_details?.resolved_grid_code,
        resolved_grid_id: windowCovering?.fabric_details?.resolved_grid_id,
        price_group: windowCovering?.fabric_details?.price_group,
        product_category: windowCovering?.fabric_details?.product_category
      };

      // Build measurements object for double configuration support
      const measurements = {
        rail_width: widthCm,
        drop: heightCm,
        curtain_type: formData.curtain_type || 'single' // For roman blind double config
      };

      // Use the UNIFIED calculation engine (same as DynamicWindowWorksheet)
      const result = calculateBlindCosts(
        widthCm,
        heightCm,
        windowCovering, // template
        fabricItem,
        allOptions,
        measurements
      );

      return {
        fabricCost: result.fabricCost.toFixed(2),
        laborCost: result.manufacturingCost.toFixed(2),
        optionsCost: result.optionsCost.toFixed(2),
        headingCost: '0.00', // Blinds don't have heading costs
        totalCost: result.totalCost.toFixed(2),
        fabricUsage: result.displayText || `${widthCm.toFixed(1)}cm × ${heightCm.toFixed(1)}cm`,
        fabricOrientation: 'standard',
        seamsRequired: 0,
        seamLaborHours: 0,
        widthsRequired: 1,
        squareMeters: result.squareMeters,
        optionDetails: result.optionDetails || allOptions.map(opt => ({
          name: opt.name,
          cost: opt.price,
          method: opt.pricingMethod || 'fixed',
          calculation: `${opt.pricingMethod || 'fixed'}: ${opt.price}`
        })),
        warnings: [],
        costComparison: null
      };
    } else {
      // Use curtain calculation
      return calculateCurtainCosts();
    }
  }, [isBlindsOrShutters, formData, options, hierarchicalOptions, windowCovering, treatmentType, calculateCurtainCosts, userUnit]);

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
  console.log('Form Data:', formData);
  console.log('Calculated Costs:', costs);
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

  // Set default product name based on treatment type if none provided
  useEffect(() => {
    if (isOpen && !formData.product_name && treatmentType) {
      setFormData(prev => ({
        ...prev,
        product_name: treatmentType
      }));
    }
  }, [isOpen, treatmentType, formData.product_name, setFormData]);

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
      product_name: formData.product_name || treatmentType,
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
        heading_fullness: formData.heading_fullness,
        // CRITICAL: Save pricing grid data
        pricing_grid_data: windowCovering?.fabric_details?.pricing_grid_data,
        resolved_grid_name: windowCovering?.fabric_details?.resolved_grid_name,
        resolved_grid_code: windowCovering?.fabric_details?.resolved_grid_code,
        resolved_grid_id: windowCovering?.fabric_details?.resolved_grid_id,
        price_group: windowCovering?.fabric_details?.price_group,
        product_category: windowCovering?.fabric_details?.product_category
      },
      selected_options: formData.selected_options,
      notes: formData.notes,
      images: uploadedImages,
      status: "planned",
      window_covering: windowCovering,
      // Save ALL cost summary data
      cost_summary: {
        fabric_cost: costs.fabricCost,
        options_cost: costs.optionsCost,
        heading_cost: costs.headingCost, // CRITICAL: Include heading cost
        labor_cost: costs.laborCost,
        manufacturing_cost: costs.laborCost, // Alias for compatibility
        total_cost: costs.totalCost,
        fabric_usage: costs.fabricUsage,
        linear_meters: costs.fabricUsage, // Alias for compatibility
        fabric_orientation: costs.fabricOrientation,
        seams_required: costs.seamsRequired,
        seam_labor_hours: costs.seamLaborHours,
        widths_required: costs.widthsRequired,
        option_details: costs.optionDetails,
        warnings: costs.warnings,
        cost_comparison: costs.costComparison
      }
    };

    onSave(treatmentData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    console.log('Dialog closed, resetting form');
    resetForm();
    onClose();
  };

  const handleOptionToggle = (optionId: string) => {
    const option = options.find(o => o.id === optionId);
    if (option?.is_required) return; // Can't toggle required options
    
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

  // Show loading state while form is initializing
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange called with:', open);
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background border-b pb-4 mb-4">
          <DialogTitle className="text-center text-lg font-semibold">
            Configure {treatmentType || 'Treatment'} for {surfaceType === 'wall' ? 'Wall' : 'Window'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Add measurements, select options, and configure pricing details
          </p>
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
            windowCovering={windowCovering}
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

          {/* FABRIC DETAILS - Only show for curtains and roman blinds */}
          {/* Blinds (roller, venetian, cellular, vertical) use pricing grids and material selection instead */}
          {!isBlindsOrShutters && (
            <FabricDetailsCard 
              formData={formData} 
              onInputChange={handleInputChange}
              fabricUsage={costs.fabricUsage}
            />
          )}

          <ImageUploadCard
            images={formData.images}
            onImageUpload={(files) => setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))}
            onRemoveImage={(index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
          />

          <TreatmentNotesField
            notes={formData.notes}
            onNotesChange={(notes) => handleInputChange("notes", notes)}
          />

          <CostSummaryCard 
            costs={costs} 
            treatmentType={treatmentType}
            selectedOptions={formData.selected_options}
            availableOptions={options}
            hierarchicalOptions={hierarchicalOptions}
            formData={formData}
          />

          <TreatmentFormActions onCancel={handleClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
};
