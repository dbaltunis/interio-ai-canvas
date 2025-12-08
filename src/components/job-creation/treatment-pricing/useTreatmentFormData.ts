
import { useState, useEffect } from "react";

export interface TreatmentFormData {
  product_name: string;
  rail_width: string;
  drop: string;
  pooling: string;
  quantity: number;
  fabric_type: string;
  fabric_code: string;
  fabric_cost_per_yard: string;
  fabric_width: string;
  roll_direction: string;
  heading_fullness: string;
  selected_heading?: string;
  header_hem: string;
  bottom_hem: string;
  side_hem: string;
  seam_hem: string;
  custom_labor_rate: string;
  selected_options: string[];
  notes: string;
  images: File[];
}

export const useTreatmentFormData = (treatmentType: string = "Curtains", windowCovering?: any, existingData?: any) => {
  // Detect if this is a blind/shutter (not curtain/roman) to avoid unnecessary curtain-specific defaults
  const isBlindOrShutter = treatmentType.toLowerCase().includes('blind') || 
                           treatmentType.toLowerCase().includes('shutter') ||
                           treatmentType.toLowerCase().includes('venetian') ||
                           treatmentType.toLowerCase().includes('cellular') ||
                           treatmentType.toLowerCase().includes('honeycomb') ||
                           treatmentType.toLowerCase().includes('vertical') ||
                           windowCovering?.category === 'blinds' || 
                           windowCovering?.category === 'shutters';
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    product_name: existingData?.product_name || windowCovering?.name || treatmentType || "Curtains",
    rail_width: existingData?.measurements?.rail_width || "",
    drop: existingData?.measurements?.drop || "",
    pooling: existingData?.measurements?.pooling || "0",
    quantity: existingData?.quantity || 1,
    fabric_type: existingData?.fabric_details?.fabric_type || "",
    fabric_code: existingData?.fabric_details?.fabric_code || "",
    fabric_cost_per_yard: existingData?.fabric_details?.fabric_cost_per_yard || "",
    // CRITICAL: NO hardcoded fabric width - must come from selected fabric or template
    fabric_width: existingData?.fabric_details?.fabric_width || "",
    roll_direction: existingData?.fabric_details?.roll_direction || "vertical",
    // CRITICAL: NO hardcoded fullness - must come from template
    heading_fullness: existingData?.fabric_details?.heading_fullness || "",
    selected_heading: existingData?.fabric_details?.selected_heading,
    // CRITICAL: NO hardcoded hems - must come from template
    header_hem: existingData?.measurements?.header_hem || "",
    bottom_hem: existingData?.measurements?.bottom_hem || "",
    side_hem: existingData?.measurements?.side_hem || "",
    seam_hem: existingData?.measurements?.seam_hem || "",
    custom_labor_rate: existingData?.custom_labor_rate || "",
    selected_options: existingData?.selected_options || [],
    notes: existingData?.notes || "",
    images: existingData?.images || []
  });

  // Auto-set roll direction based on fabric width - only if fabric width is provided
  useEffect(() => {
    const fabricWidth = parseFloat(formData.fabric_width);
    if (!fabricWidth || isNaN(fabricWidth)) return; // Don't auto-set if no fabric width
    
    const newRollDirection = fabricWidth <= 200 ? "vertical" : "horizontal";
    
    if (formData.roll_direction !== newRollDirection) {
      setFormData(prev => ({
        ...prev,
        roll_direction: newRollDirection
      }));
    }
  }, [formData.fabric_width]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    // CRITICAL: No hardcoded fallbacks in resetForm either
    // Form fields start empty - user/template must provide values
    setFormData({
      product_name: existingData?.product_name || windowCovering?.name || treatmentType || "Curtains",
      rail_width: existingData?.measurements?.rail_width || "",
      drop: existingData?.measurements?.drop || "",
      pooling: existingData?.measurements?.pooling || "0",
      quantity: existingData?.quantity || 1,
      fabric_type: existingData?.fabric_details?.fabric_type || "",
      fabric_code: existingData?.fabric_details?.fabric_code || "",
      fabric_cost_per_yard: existingData?.fabric_details?.fabric_cost_per_yard || "",
      fabric_width: existingData?.fabric_details?.fabric_width || "", // NO hardcoded 137/100
      roll_direction: existingData?.fabric_details?.roll_direction || "vertical",
      heading_fullness: existingData?.fabric_details?.heading_fullness || "", // NO hardcoded 2.5/1.0
      selected_heading: existingData?.fabric_details?.selected_heading,
      header_hem: existingData?.measurements?.header_hem || "", // NO hardcoded 15/0
      bottom_hem: existingData?.measurements?.bottom_hem || "", // NO hardcoded 10/0
      side_hem: existingData?.measurements?.side_hem || "", // NO hardcoded 5/0
      seam_hem: existingData?.measurements?.seam_hem || "", // NO hardcoded 3/0
      custom_labor_rate: existingData?.custom_labor_rate || "",
      selected_options: existingData?.selected_options || [],
      notes: existingData?.notes || "",
      images: existingData?.images || []
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm
  };
};
