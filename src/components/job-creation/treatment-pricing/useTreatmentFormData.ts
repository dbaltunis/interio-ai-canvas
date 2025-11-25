
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
    fabric_width: existingData?.fabric_details?.fabric_width || (isBlindOrShutter ? "100" : "137"),
    roll_direction: existingData?.fabric_details?.roll_direction || "vertical",
    // CRITICAL: Blinds don't use fullness - set to 1.0 (no multiplication)
    heading_fullness: existingData?.fabric_details?.heading_fullness || (isBlindOrShutter ? "1.0" : "2.5"),
    selected_heading: existingData?.fabric_details?.selected_heading,
    // CRITICAL: Blinds don't use fabric hems - these should be 0 unless explicitly set in template
    header_hem: existingData?.measurements?.header_hem || (isBlindOrShutter ? "0" : "15"),
    bottom_hem: existingData?.measurements?.bottom_hem || (isBlindOrShutter ? "0" : "10"),
    side_hem: existingData?.measurements?.side_hem || (isBlindOrShutter ? "0" : "5"),
    seam_hem: existingData?.measurements?.seam_hem || (isBlindOrShutter ? "0" : "3"),
    custom_labor_rate: existingData?.custom_labor_rate || "",
    selected_options: existingData?.selected_options || [],
    notes: existingData?.notes || "",
    images: existingData?.images || []
  });

  // Auto-set roll direction based on fabric width
  useEffect(() => {
    const fabricWidth = parseFloat(formData.fabric_width) || 137;
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
    const isBlindOrShutter = treatmentType.toLowerCase().includes('blind') || 
                             treatmentType.toLowerCase().includes('shutter') ||
                             treatmentType.toLowerCase().includes('venetian') ||
                             treatmentType.toLowerCase().includes('cellular') ||
                             treatmentType.toLowerCase().includes('honeycomb') ||
                             treatmentType.toLowerCase().includes('vertical') ||
                             windowCovering?.category === 'blinds' || 
                             windowCovering?.category === 'shutters';
    
    setFormData({
      product_name: existingData?.product_name || windowCovering?.name || treatmentType || "Curtains",
      rail_width: existingData?.measurements?.rail_width || "",
      drop: existingData?.measurements?.drop || "",
      pooling: existingData?.measurements?.pooling || "0",
      quantity: existingData?.quantity || 1,
      fabric_type: existingData?.fabric_details?.fabric_type || "",
      fabric_code: existingData?.fabric_details?.fabric_code || "",
      fabric_cost_per_yard: existingData?.fabric_details?.fabric_cost_per_yard || "",
      fabric_width: existingData?.fabric_details?.fabric_width || (isBlindOrShutter ? "100" : "137"),
      roll_direction: existingData?.fabric_details?.roll_direction || "vertical",
      heading_fullness: existingData?.fabric_details?.heading_fullness || (isBlindOrShutter ? "1.0" : "2.5"),
      selected_heading: existingData?.fabric_details?.selected_heading,
      header_hem: existingData?.measurements?.header_hem || (isBlindOrShutter ? "0" : "15"),
      bottom_hem: existingData?.measurements?.bottom_hem || (isBlindOrShutter ? "0" : "10"),
      side_hem: existingData?.measurements?.side_hem || (isBlindOrShutter ? "0" : "5"),
      seam_hem: existingData?.measurements?.seam_hem || (isBlindOrShutter ? "0" : "3"),
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
