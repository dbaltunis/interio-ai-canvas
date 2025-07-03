
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
  header_hem: string;
  bottom_hem: string;
  side_hem: string;
  seam_hem: string;
  custom_labor_rate: string;
  selected_options: string[];
  notes: string;
  images: File[];
}

export const useTreatmentFormData = (treatmentType: string = "Curtains", windowCovering?: any) => {
  const [formData, setFormData] = useState<TreatmentFormData>({
    product_name: windowCovering?.name || treatmentType || "Curtains",
    rail_width: "",
    drop: "",
    pooling: "0",
    quantity: 1,
    fabric_type: "",
    fabric_code: "",
    fabric_cost_per_yard: "",
    fabric_width: "137",
    roll_direction: "vertical", // Default to vertical for narrow fabrics
    heading_fullness: "2.5",
    header_hem: "15",
    bottom_hem: "10",
    side_hem: "5",
    seam_hem: "3",
    custom_labor_rate: "",
    selected_options: [],
    notes: "",
    images: []
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
    setFormData({
      product_name: windowCovering?.name || treatmentType || "Curtains",
      rail_width: "",
      drop: "",
      pooling: "0",
      quantity: 1,
      fabric_type: "",
      fabric_code: "",
      fabric_cost_per_yard: "",
      fabric_width: "137",
      roll_direction: "vertical", // Default to vertical for narrow fabrics
      heading_fullness: "2.5",
      header_hem: "15",
      bottom_hem: "10",
      side_hem: "5",
      seam_hem: "3",
      custom_labor_rate: "",
      selected_options: [],
      notes: "",
      images: []
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm
  };
};
